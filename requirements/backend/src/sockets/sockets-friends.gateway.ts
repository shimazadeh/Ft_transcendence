import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { SocketsService } from './sockets.service';
import { Server, Socket } from 'socket.io';
import { FriendService } from 'src/friend/friend.service';
import { QueueService } from './queue.service';
import { MessageService } from './message.service';


@WebSocketGateway({ cors: true })
export class SocketsFriendsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private server: Server;

  afterInit() {
    console.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    // console.log('Client connected:', client.id);
  }

  handleDisconnect(client: Socket) {
    // console.log('Client disconnected:', client.id);
  }

  constructor(
    private readonly socketService: SocketsService,
    private readonly friendService: FriendService,
    private readonly queueService: QueueService,
    private readonly messageService: MessageService,) { }

  @SubscribeMessage('getFriend')
  async getFriendsByUserId(@ConnectedSocket() client: Socket) {
    const user = await this.socketService.getUser(client.id);
    if (!user)
      return ;
    const friends = await this.friendService.getFriendsByUserId(user.id);
    return friends;
  }

  @SubscribeMessage('getFriendReq')
  async getFriendReq(@ConnectedSocket() client: Socket) {
    const user = await this.socketService.getUser(client.id);
    if (!user)
      return ;
    return this.friendService.getFriendReq(user.id)
  }

  @SubscribeMessage('send')
  async sendFriendReq(@ConnectedSocket() client: Socket, @MessageBody() body: { id: number }) {
    const user = await this.socketService.getUser(client.id);
    if (!user)
      return ;
    const request = await this.friendService.createFriendRequest(user.id, +body.id)
    if (!request)
      return;
    this.server.to(`user_${body.id}`).emit('friendRequestNotification', { req: request });
  }

  @SubscribeMessage('acceptFriend')
  async acceptFriendReq(@ConnectedSocket() client: Socket, @MessageBody() body: { id: number }) {
    const user = await this.socketService.getUser(client.id);
    if (!user)
      return ;
    await this.friendService.acceptFriendRequest(+user.id, +body.id)
    const friendFriend = await this.friendService.getFriendsByUserId(+body.id)
    const friendUser = await this.friendService.getFriendsByUserId(+user.id)
    const request = this.friendService.getFriendReq(user.id)
    this.server.to(`user_${user.id}`).emit('receiveFriend', { friends: friendUser })
    this.server.to(`user_${user.id}`).emit('receiveReq', { req: request })
    this.server.to(`user_${body.id}`).emit('receiveFriend', { friends: friendFriend });
    const target = await this.messageService.searchUserId(body.id);
    if (!target)
      return ;
    this.server.to(`user_${body.id}`).emit('refreshFriends', user, false);
    this.server.to(`user_${user.id}`).emit('refreshFriends', target, false);

  }

  @SubscribeMessage('refuseFriend')
  async refuseFriendReq(@ConnectedSocket() client: Socket, @MessageBody() body: { id: number }) {
    const user = await this.socketService.getUser(client.id);
    if (!user)
      return ;
    await this.friendService.refuseFriendRequest(+user.id, +body.id)
    const request = this.friendService.getFriendReq(user.id)
    this.server.to(`user_${user.id}`).emit('receiveReq', { req: request })
  }

  @SubscribeMessage('deleteFriend')
  async deleteFriend(@ConnectedSocket() client: Socket, @MessageBody() body: { id: number }) {
    const user = await this.socketService.getUser(client.id);
    if (!user)
      return ;
    await this.friendService.deleteFriendById(+user.id, +body.id)
    const friendUser = await this.friendService.getFriendsByUserId(+user.id)
    this.server.to(`user_${user.id}`).emit('receiveFriend', { friends: friendUser })
    const friendFriend = await this.friendService.getFriendsByUserId(+body.id)
    this.server.to(`user_${body.id}`).emit('receiveFriend', { friends: friendFriend });
    const target = await this.messageService.searchUserId(body.id);
    if (!target)
      return ;
    this.server.to(`user_${body.id}`).emit('refreshFriends', user, true);
    this.server.to(`user_${user.id}`).emit('refreshFriends', target, true);
  }

  @SubscribeMessage('bloqueUser')
  async bloqueUser(@ConnectedSocket() client: Socket, @MessageBody() body: { id: number }) {
    const user = await this.socketService.getUser(client.id);
    if (!user)
      return ;
    await this.friendService.bloqueUserById(+user.id, +body.id)
    await this.friendService.refuseFriendRequest(+user.id, +body.id)
    const friendUser = await this.friendService.getFriendsByUserId(+user.id)
    this.server.to(`user_${user.id}`).emit('receiveFriend', { friends: friendUser })
    const request = this.friendService.getFriendReq(user.id)
    this.server.to(`user_${user.id}`).emit('receiveReq', { req: request })
  }

  @SubscribeMessage('bloqueFriend')
  async bloqueFriend(@ConnectedSocket() client: Socket, @MessageBody() body: { id: number }) {
    const user = await this.socketService.getUser(client.id);
    if (!user)
      return ;
    await this.friendService.bloqueUserById(+user.id, +body.id)
    const friendUser = await this.friendService.getFriendsByUserId(+user.id)
    this.server.to(`user_${user.id}`).emit('receiveFriend', { friends: friendUser })
    const friendFriend = await this.friendService.getFriendsByUserId(+body.id)
    this.server.to(`user_${body.id}`).emit('receiveFriend', { friends: friendFriend });
    const target = await this.messageService.searchUserId(body.id);
    if (target)
      this.server.to(`user_${user.id}`).emit('refreshBlocked', target, false);
  }

  @SubscribeMessage('invitePlay')
  async invitePlay(@ConnectedSocket() client: Socket, @MessageBody() body: { id: number }) {
    const user = await this.socketService.getUser(client.id);
    const isGaming = await this.queueService.isGaming(+body.id);
    if (!user || isGaming)
      return ;
    this.server.to(`user_${body.id}`).emit('invitePlayReq', { friendId: user.id });
  }

  @SubscribeMessage('acceptInvitation')
  async acceptInvit(@ConnectedSocket() client: Socket, @MessageBody() body: { id: number }) {
    const user = await this.socketService.getUser(client.id);
    if (!user)
      return ;
    const friend = await this.queueService.retUser(user.id)
    this.server.to(`user_${body.id}`).emit('accepted', { friend });
    this.server.to(`user_${user.id}`).emit('closePopup');
  }

  @SubscribeMessage('refuseInvitation')
  async refuseInvit(@ConnectedSocket() client: Socket, @MessageBody() body: { id: number }) {
    const user = await this.socketService.getUser(client.id);
    if (!user)
      return ;
     this.server.to(`user_${body.id}`).emit('refused');
     this.server.to(`user_${user.id}`).emit('closePopup');
  }
}
