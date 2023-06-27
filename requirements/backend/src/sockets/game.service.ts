import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { GameState, BounceBallDto} from './dto/game.dto';
import { Server, Socket } from 'socket.io';
import { SocketsService } from './sockets.service';

const PADDLE_BOARD_SIZE = 5;
const PADDLE_EDGE_SPACE = 1;

const ROW_SIZE = 10 * 2;
const COL_SIZE = 20 * 2;

const board = [...Array(PADDLE_BOARD_SIZE)].map((_, pos) => pos);

@Injectable()
export class GameService {
	private spectators: number[] = [];
	private startTime: number =  Date.now();
	private gameState: GameState = {
		player1: board.map((x) => x * COL_SIZE + PADDLE_EDGE_SPACE),
		player2: board.map((x) => (x + 1) * COL_SIZE - (PADDLE_EDGE_SPACE + 1)),
		ball: Math.round((ROW_SIZE * COL_SIZE) / 2) + ROW_SIZE,
		deltaX: -1,
		deltaY: -(COL_SIZE),
		playerScore: 0,
		opponentScore: 0,
		pause: true,
		numofPlayers: 0,
		gameSpeed: 0,
		elapsedTime: 0,
	};

	addSpectator(spectator: number): void {
		this.spectators.push(spectator);
	}

	removeSpectator(spectator: number): void {
		const index = this.spectators.indexOf(spectator);
		if (index !== -1) {
		  this.spectators.splice(index, 1);
		}
	}

	lookupSpectator(lookup: number): boolean{
		for (let i = 0; i < this.spectators.length ; i++)
		{
			if (this.spectators[i] === lookup)
				return true;
		}
		return false;
	}

	spectatorGameEnded(server: Server): void {
		this.spectators.forEach((spectator) => {
			server.to(`user_${spectator}`).emit('game-over', "Game Ended!");
		  });
	}

	updateSpectators(gameState: GameState, server: Server): void {
		this.spectators.forEach((spectator) => {
			server.to(`user_${spectator}`).emit('gameState', gameState);
		});
	}

	getGameState() : GameState{
		return this.gameState;
	}

	startGame(): void {
		this.gameState.pause = false;
		this.startTime = Date.now();
		console.log("server service: startGame");
	}

	pauseGame(): void {
		this.gameState.pause = true;
		console.log("server service: pauseGame");
	}

	resetGame(): void{
		this.gameState = {
			player1: board.map((x) => x * COL_SIZE + PADDLE_EDGE_SPACE),
			player2: board.map((x) => (x + 1) * COL_SIZE - (PADDLE_EDGE_SPACE + 1)),
			ball: Math.round((ROW_SIZE * COL_SIZE) / 2) + ROW_SIZE,
			deltaX: -1,
			deltaY: -(COL_SIZE),
			playerScore: 0,
			opponentScore: 0,
			pause: true,
			numofPlayers: 0,
			gameSpeed: 0,
			elapsedTime: 0,
		};
	}

	setSpeed(Mode: string): void{
		if (Mode === 'n')
			this.gameState.gameSpeed = 8;
		else
			this.gameState.gameSpeed = 12;
	}

	movePlayer1(movePlayer: number[]): void{
		this.gameState.player1 = movePlayer;
	}

	movePlayer2(moveOpponent: number[]): void{
		this.gameState.player2 = moveOpponent;
	}

	setnumofPlayers(): void{
		this.gameState.numofPlayers = 2;
	}

	updateScores(): void{
		if (this.gameState.deltaX !== -1) {
			this.gameState.playerScore++;
		} else {
			this.gameState.opponentScore++;
		}
	}

	getwinner(): boolean{
		if (this.gameState.playerScore === 10 || this.gameState.opponentScore === 10)
			return true;
		return false;
	}

	updateTime(): ()=>void {
		if (!this.gameState.pause) {
			const interval = setInterval(() => {
			const currentTime = Date.now();
			const elapsedTimeInSeconds = Math.floor((currentTime - this.startTime) / 1000);
			this.gameState.elapsedTime = elapsedTimeInSeconds;
		  }, 1000);

		  return () => {
			clearInterval(interval);
		  };
		}
		return () => {};
	  }

	bounceBall():void{
		const newstate = this.gameState.ball + (this.gameState.deltaY + this.gameState.deltaX);
		if (this.rightleftEdge(newstate)) {//they missed the ball
			this.gameState.ball = Math.round((ROW_SIZE * COL_SIZE) / 2) + ROW_SIZE;
			this.updateScores();
		}
		else{
			if (this.topbottomEdge(newstate))
				this.gameState.deltaY = -this.gameState.deltaY;
			else if (this.touchingPaddleEdge(newstate) || this.touchingPaddle(newstate)){
				this.gameState.deltaX = -this.gameState.deltaX;
			}
			this.gameState.ball = newstate;
		}
	}

	private topbottomEdge(pos: number): boolean {
		return (pos < COL_SIZE + 1 || //top edge
			pos >= (ROW_SIZE - 1) * COL_SIZE - 1);
	}

	private rightleftEdge(pos: number): boolean {
		return (pos % COL_SIZE === 0 || // Ball touches left edge
		pos % COL_SIZE === COL_SIZE - 1);
	}

	private touchingPaddle(pos: number): boolean {
		const { player1, player2, deltaX } = this.gameState;
		const paddle =
			deltaX === -1 ? player1: player2;
		return paddle.includes(pos);
	}

	private touchingPaddleEdge(pos: number): boolean {
		const { player1, player2 } = this.gameState;
		const player1Edges = [player1[0], player1[player1.length - 1]];
		const player2Edges = [player2[0], player2[player2.length - 1]];
		return player1Edges.includes(pos) || player2Edges.includes(pos);
	}
}
