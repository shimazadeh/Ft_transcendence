import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { SocketsService } from './sockets.service';
import { Server, Socket } from 'socket.io';
import { movePaddleDto, gameModeDto} from './dto/game.dto';
import { Interval } from '@nestjs/schedule';
import { GameService } from './game.service';
import { HistoryDto } from 'src/history/dto';
import { HistoryService } from 'src/history/history.service';
import { Prisma } from '@prisma/client';
import { profile, time } from 'console';
import { connect } from 'http2';
import { session } from 'passport';
import { timeInterval } from 'rxjs';
import { FriendService } from 'src/friend/friend.service';
import { User, Friend } from '@prisma/client';

@WebSocketGateway({ cors: true })
export class SocketsGameGateway implements OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer()
	private server: Server;
	private interval: NodeJS.Timeout | undefined;
	private gameSessions: Map<(number | undefined)[], GameService> = new Map();

	constructor(
		private readonly socketService: SocketsService,
		private readonly historyService: HistoryService,
		private readonly friendService: FriendService,
		) {}

	afterInit() {
	}

	handleConnection(client: Socket) {
	}

	handleDisconnect(client: Socket) {
		this.playerleft(client);
	}

	async updatePlayerWinLoose(client: (number), won: boolean) {
		const user = await this.socketService.getUserWithid(client);

		if (user)
			this.socketService.changeWin(+user.id, won);
	}

	calculateNewElo(currentElo: number, opponentElo: number, win: boolean): number {
		let K: number;

		if (currentElo < 1000) {
			K = 160;
		} else if (currentElo < 2000) {
			K = 120;
		} else if (currentElo < 3000) {
			K = 80;
		} else if (currentElo < 4000) {
			K = 40;
		} else {
			K = 20;
		}

		const expectedScore = 1 / (1 + Math.pow(10, (opponentElo - currentElo) / 400));
		const actualScore = win ? 1 : 0;
		return currentElo + K * (actualScore - expectedScore);
	}

	async updatePlayerElo(client: number, opponent: number, won: boolean, gameserv: GameService) {
		const user = await this.socketService.getUserWithid(client);
		const opp = await this.socketService.getUserWithid(opponent);

		console.log("updating elo ", new Date().toISOString());

		if (user && opp) {
		  const newElo = this.calculateNewElo(user.elo, opp.elo, won);
		  await this.updateHistory(client, gameserv, won, newElo);
		  this.socketService.updateElo(+user.id, newElo);
		}
	  }

	  async updateHistory(client: number, gameserv: GameService, won: boolean, newElo: number) {
		const user = await this.socketService.getUserWithid(client);
		if (user) {
		  const playerScore = gameserv.getGameState().playerScore;
		  const opponentScore = gameserv.getGameState().opponentScore;
		  const _numwon = won ? Math.max(playerScore, opponentScore) : Math.min(playerScore, opponentScore);
		  const _numlos = !won ? Math.max(playerScore, opponentScore) : Math.min(playerScore, opponentScore);

		  const historyDto: HistoryDto = {
			userID: user.id.toString(),
			result: won ? 'victory' : 'defeat',
			mode: gameserv.getGameState().gameSpeed === 12 ? "Bonus": "Normal",
			pointsWon: _numwon.toString(),
			pointsLost: _numlos.toString(),
			elo: (newElo - (+user.elo)).toString(),
		  };
		  await this.historyService.newEntry(historyDto);
		}
	  }

	async updatePrismaData(connectedClients: (number | undefined)[], game_service: GameService): Promise<void>{
		if (connectedClients[0] && connectedClients[1]) {
		  const won = game_service.getGameState().playerScore > game_service.getGameState().opponentScore;

		  await Promise.all([
			this.updatePlayerWinLoose(connectedClients[0], won),
			this.updatePlayerElo(connectedClients[0], connectedClients[1], won, game_service),

			this.updatePlayerWinLoose(connectedClients[1], !won),
			this.updatePlayerElo(connectedClients[1], connectedClients[0], !won, game_service),
			]);
		}
	}

	async startGameInterval(clients: (number | undefined)[]): Promise<void> {
		let game_service = this.getGameService(clients);
		let connectedClients = clients;
		if (!game_service){
			console.log("no active game session!")
			return;
		}
		const intervalDuration = 500 / game_service.getGameState().gameSpeed;

		const gameLoop = async () => {
			const timerInterval = game_service?.updateTime();

			if ((game_service?.getwinner() && connectedClients[1] && connectedClients[0]) ||
			(game_service?.getGameState().gameSpeed === 12 && game_service?.getGameState().elapsedTime >= 30))
			{
				await this.updatePrismaData(connectedClients, game_service);
				this.gameOver(connectedClients, false);
				if (timerInterval)
					timerInterval();
			}
			else if (connectedClients.length === 2  && !game_service?.getGameState().pause){
				game_service?.bounceBall();
				connectedClients.forEach((client)=> {
					if (client)
						this.server.to(`user_${client}`).emit('updateBallPosition', game_service?.getGameState());
				});
				game_service?.updateSpectators(game_service.getGameState(), this.server);
			}
			setTimeout(gameLoop, intervalDuration);
		}
		gameLoop();
	}

	stopGameInterval(): void {
		if (this.interval) {
		  clearInterval(this.interval);
		  this.interval = undefined;
		}
	}

	getGameService(clients: (number | undefined)[]): GameService | undefined {
		for (const [key, gameService] of this.gameSessions.entries()) {
		  if (
			(key[0] === clients[0] && key[1] === clients[1]) ||
			(key[0] === clients[1] && key[1] === clients[0])
		  ) {
			return gameService;
		  }
		}
		return undefined;
	}

	find_clients(client1: (number | undefined), client2: (number | undefined)): boolean{
		for (const key of this.gameSessions.keys()) {
			if ((key[0] === client1 && key[1] === client2) ||
			(key[0] === client2 && key[1] === client1))
				return true;
		}
		return false;
	}

	find_session(client1: (number | undefined), client2: (number | undefined)): boolean {
		if (!this.find_clients(client1, client2))
		{
			const game_service = new GameService;
			this.gameSessions.set([client1, client2], game_service);
			this.gameSessions.get([client1, client2])?.setnumofPlayers();
			return false;
		}
		return true;
	}

	deleteSession(clients: (number | undefined)[]): boolean {
		for (const [key, game_serv] of this.gameSessions.entries()) {
		  if (
			(key[0] === clients[0] && key[1] === clients[1]) ||
			(key[0] === clients[1] && key[1] === clients[0])
		  ) {
			game_serv.spectatorGameEnded(this.server);
			this.gameSessions.delete(key);
			return true;
		  }
		}
		return false;
	  }

	async updatePlayerStatus(client: (number | undefined), status: string) {
		if (client)
		{
			const user = await this.socketService.getUserWithid(client);
			if (user)
			{
				this.socketService.changeState(+user.id, status)
				await this.refreshFriend(user)
			}
		}
	}

	@SubscribeMessage('join-room')
	async joinroom(@MessageBody() gameMode: gameModeDto, @ConnectedSocket() client: Socket): Promise<void>{
		const player = await this.socketService.getUser(client.id);
		const opponent = await this.socketService.getUserWithid(+(gameMode.opponentid));
		if (player && opponent && (!this.find_session(player.id, opponent.id))){
			let clients = [player.id, opponent.id];
			let i = 0;
			this.getGameService(clients)?.setSpeed(gameMode.Mode);
			for (const client of clients) {
				if (client)
					this.server.to(`user_${client}`).emit('start', ++i);
				this.updatePlayerStatus(client, "is playing");
			}
			this.getGameService(clients)?.startGame();
			this.startGameInterval(clients);
		}
		else if (player && opponent && this.find_session(player.id, opponent.id)){
			console.log("session already exist");//for when the second player calls the session
		}
		else
			console.log("opponent doesnt exist");
	}

	notifyClients(connectedClients: (number | undefined)[], gameserv: GameService, flag: boolean): void{
		const won = gameserv.getGameState().playerScore > gameserv.getGameState().opponentScore;

		const winnerindex = won === true ? 0: 1;
		const looserindex = won === true ? 1: 0;
		if (flag === false){
			this.server.to(`user_${connectedClients[looserindex]}`).emit("game-over", "Game Over!\n");
			this.server.to(`user_${connectedClients[winnerindex]}`).emit("game-over", "Congratulation!\n");
		}else{
			this.server.to(`user_${connectedClients[looserindex]}`).emit("player-left");
			this.server.to(`user_${connectedClients[winnerindex]}`).emit("game-over", "Opponent Left\n");
		}
		this.updatePlayerStatus(connectedClients[0], "online");
		this.updatePlayerStatus(connectedClients[1], "online");
	}

	gameOver(clients: (number | undefined)[], left: boolean): void{
		for (const [connectedClients, game_serv] of this.gameSessions.entries()) {
			if (connectedClients.includes(clients[0]) || connectedClients.includes(clients[1])) {
				this.notifyClients(connectedClients, game_serv, left);
				this.getGameService(connectedClients)?.resetGame();
				this.stopGameInterval();
				this.deleteSession(connectedClients);
				break;
		  }
		}
	}

	@SubscribeMessage('join-as-spectator')
	async joinAsSpectator(@MessageBody() playerId: number, @ConnectedSocket() client: Socket): Promise<void> {
		let found = false;
		const spec = await this.socketService.getUser(client.id)
		if (spec)
		{
			const towatch = await this.socketService.getUserWithid((+playerId));
			if (towatch)
			{
				console.log("joining as spectator")
				for (const [connectedClients, game_serv] of this.gameSessions.entries()) {
					if (connectedClients.includes(towatch.id)) {
						game_serv.addSpectator(spec.id);
						found = true;
						break;
					}
				}
				if (!found)
					console.log("no active game: player id is ", playerId)
			}
			else
				console.log("nothing to watch player id is ", playerId)
		}
	}

	@SubscribeMessage('player-left')
	async playerleft(@ConnectedSocket() client: Socket): Promise<void>{
		const user = await this.socketService.getUser(client.id)

		for (const connectedClients of this.gameSessions.keys()) {
			if (connectedClients.includes(user?.id)) {
				const leavingplayerind = connectedClients.indexOf(user?.id);
				const game_serv = this.getGameService(connectedClients)
				if (game_serv)
				{
					game_serv.getGameState().playerScore = leavingplayerind === 0 ? 0 : 10;
					game_serv.getGameState().opponentScore = leavingplayerind === 0 ? 10 : 0;
					await this.updatePrismaData(connectedClients, game_serv);
					this.gameOver(connectedClients, true);
					break;
				}
			}
		  }
	}

	@SubscribeMessage('move-player')
	async movePlayer(@MessageBody() movePaddleDto: movePaddleDto, @ConnectedSocket() client: Socket): Promise<void>{
		const user = await this.socketService.getUser(client.id)

		for (const connectedClients of this.gameSessions.keys()) {
			if (connectedClients.includes(user?.id)) {
				const game_serv = this.getGameService(connectedClients);
				if (game_serv)
				{
					if (movePaddleDto.playerID === 1)
						game_serv.movePlayer1(movePaddleDto.movedPlayer);
					else
						game_serv.movePlayer2(movePaddleDto.movedPlayer);
					connectedClients.forEach((client)=> {
						if (client)
							this.server.to(`user_${client}`).emit('move-paddles', game_serv.getGameState());
					});
				}
				break;
			}
		  }
	}

	@SubscribeMessage('spectator-left')
	async spectatorLeft(@ConnectedSocket() client: Socket): Promise<void>{
		const spec = await this.socketService.getUser(client.id)

		if (spec)
		{
			for (const [key, gameService] of this.gameSessions.entries()) {
				if (gameService.lookupSpectator(spec.id))
				{
					console.log("removng spectator")
					gameService.removeSpectator(spec.id);
					break;
				}
			}
		}
	}


	async refreshFriend(user: User & { friend: Friend[] }) {
		// const friendSockets: { [friendId: number]: Socket } = {};
		const friendSockets: { [friendId: number]: string } = {};
		for (const friend of user.friend) {
			  friendSockets[friend.friendId] = `user_${friend.friendId}`;
		  }
		await new Promise(resolve => setTimeout(resolve, 100));
		for (const friendId of Object.keys(friendSockets)) {
		  const friendSocket = friendSockets[+friendId];
		  const friendFriend = await this.friendService.getFriendsByUserId(+friendId);
		  // friendSocket.emit('receiveFriend', { friends: friendFriend });
		  this.server.to(friendSocket).emit('receiveFriend', { friends: friendFriend });
		}
	  }
}
