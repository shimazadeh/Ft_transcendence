import { WebSocketGateway, OnGatewayInit, SubscribeMessage, MessageBody, WebSocketServer, ConnectedSocket } from '@nestjs/websockets';
import { SocketsService } from './sockets.service';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { FriendService } from 'src/friend/friend.service';
import { MessageService } from './message.service';
import { User, Friend } from '@prisma/client';

@WebSocketGateway({ cors: true })
export class SocketsGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly socketService: SocketsService,
    private readonly msg: MessageService,
    private jwtService: JwtService,
    private friendService: FriendService) { }

  afterInit() {
    console.log('WebSocket Gateway initialized');
  }

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.headers.cookie?.substring(14);
      if (token) {
        await this.jwtService.verify(token);
        const user = await this.socketService.getUserWithToken(token);

        // Map -> key = clientId |  value = User
        this.socketService.setClientMap(user, client.id);

        // Room contenant tous les clients rattachés à un même User
        const userRoomName = `user_${user.id}`;
        client.join(userRoomName);

        console.log('Client connected:', client.id, ' ->', user.username);

        this.socketService.changeState(+user.id, 'online')
        this.refreshFriend(user)
      }
      else {
        console.log('CONNECTION ERROR : token is undefined');
        client.disconnect();
      }
    }
    catch (e) {
      console.log("Socket error : handleConnection refused");
    }
  }

  async handleDisconnect(client: Socket) {
	try {
    const token = client.handshake.headers.cookie?.substring(14);
    if (token) {
      const user: User & { friend: Friend[] } = await this.socketService.getUserWithToken(token);
      console.log('Client disconnected:', client.id, ' ->', user.username);
      this.socketService.changeState(+user.id, 'offline')
      this.refreshFriend(user)
      this.socketService.supClient(client.id)
    }
    else
      return
	}
	catch (e) {
		console.log("Socket error : User not found");
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
