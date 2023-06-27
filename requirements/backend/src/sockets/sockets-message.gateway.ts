import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { SocketsService } from './sockets.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { Server, Socket } from 'socket.io';
import { CreateRoomDto, JoinRoomDto, RoomObj, TypingDto, UserDto } from './entities/message.entity';
import { ForbiddenException } from '@nestjs/common';
import { MessageService } from './message.service';
import { copyFileSync } from 'fs';
import * as argon from 'argon2';
import { use } from 'passport';
import { User } from '@prisma/client';

export interface Message {
	id: number;
	author: User;	
	text: string;
}

export interface ChatRoomData {
	whitelist: User[];
	admins: User[];
	banned: User[];
	connected: User[];
	friends: User[];
	blocked : User[];  
	room: RoomObj;
	owner: User | null;
  }


@WebSocketGateway({ cors: true })
export class SocketsChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
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
		private readonly messagesService: MessageService) {}

	@SubscribeMessage('findAllRooms')
	async findAllRooms(@ConnectedSocket() client: Socket) {
		const user = await this.socketService.getUser(client.id);
		if (!user)
			return ;
		const rooms = await this.messagesService.getRoomsForUser(user);
		return rooms;
	}
	@SubscribeMessage('owner')
	async owner(@MessageBody('roomId') roomId: number,) {
		const owner = await this.messagesService.owner(roomId);
		if (!owner)
			throw new ForbiddenException('No owner found');
		return owner;
	}
	@SubscribeMessage('createRoom')
	async createRoom(@MessageBody('roomName') roomName: string,
	@MessageBody('type') type: string,
	@ConnectedSocket() client: Socket) {
		try {
			if (roomName.length > 14)
				throw new ForbiddenException('Room name too long');
			const user = await this.socketService.getUser(client.id);
			if (!user)
				return ;
			if (type === 'public' || type === 'protected')
			{
				const exists = await this.messagesService.roomExist(roomName);
				if (exists)
					throw new ForbiddenException('Room alerady exists');
			}
			const room = await this.messagesService.createRoom(user.id, roomName, type);
			this.messagesService.addWhitelistUser(room.id, user.id);
			this.messagesService.promoteAdmin(room.id, user.id);
			if (room.type === 'private')
				this.server.to(`user_${user.id}`).emit('newRoom', room);
			else
					this.server.emit('newRoom', room);
			return room;
		}
		catch (e) {
			client.emit('errorMessage',e.message);
		}
	}

	@SubscribeMessage('verifyPassword')
	async verifyPassword(@MessageBody('roomId') roomId: number,
	@MessageBody('password') password: string,
	@ConnectedSocket() client: Socket) {
		try {
			const room = await this.messagesService.getRoomById(roomId);
			if (!room)
				throw new ForbiddenException('Room does not exist');
				
				const user = await this.socketService.getUser(client.id);
				if (!user)
					return ;

				const admin = await this.messagesService.isAdmin(room.id, user.id);
				
			if (room.type != 'protected' || admin)
				client.emit('passSuccess', {id: room.id});
			else
			{
				if (!password || !room.password)
					throw new ForbiddenException('Access Forbidden');
				const passwordMatch = await argon.verify(room.password, password);
				if (!passwordMatch)
					throw new ForbiddenException('Wrong password provided');
			}
			client.emit('passSuccess', {id: room.id});
		} catch (e) {
			client.emit('passError', { message: e.message });
		}
	}
	@SubscribeMessage('join')
	async joinRoom(@MessageBody('roomId') roomId: number,
	 @ConnectedSocket() client: Socket) {
		try {
		const room = await this.messagesService.getRoomById(roomId);
		if (!room || room.active === false)
			throw new ForbiddenException('Room does not exist');		
		
		const user = await this.socketService.getUser(client.id);
		if (!user)
			return ;

		const banned = await this.messagesService.isBanned(room.id, user.id)
		if (banned)
			throw new ForbiddenException('Access to room forbidden : user banned');
		const whitelisted = await this.messagesService.searchWhiteList(room.id, user.id)
		if (room.type === 'private')
		{
		  if (!whitelisted)
			throw new ForbiddenException('Access to private room forbidden');
		}
		client.join(roomId.toString());
		console.log(user.username, 'joined room :', room.name);
		if (room.type === 'protected' || room.type === 'public')
		{
			if (!whitelisted)
			{
				await this.messagesService.addWhitelistUser(room.id, user.id);
				this.server.to(roomId.toString()).emit('refreshWhiteList', user, false);
			}
		}
		await this.messagesService.connectedUser(room.id, user.id);
		client.emit('joinSuccess', room.name);
		this.server.to(roomId.toString()).emit('refreshConnected', user, false);
	} catch (e) {
		const room = await this.messagesService.getRoomById(roomId);
		if (!room)
		{
			client.emit('joinError', {msg : e.message});
			return ;
		}
		client.emit('joinError', {msg : e.message, type: room.type});
	}
	}


	async isUserInRoom(roomName: string, user: User) {
		const room = this.server.sockets.adapter.rooms.get(roomName);
	
		if (room) {
		  for (const clientId of room) {
			const client = this.server.sockets.sockets.get(clientId);
			if (!client)
				return false;
			const clientUserProfile = await this.socketService.getUser(client.id);
	
			if (clientUserProfile?.id === user.id) {
			  return true;
			}
		  }
		}
		return false;
	}
	@SubscribeMessage('leave')
	async leaveRoom(@ConnectedSocket() client: Socket,
	@MessageBody('roomId') roomId: number) {
		const user = await this.socketService.getUser(client.id);
		if (!user)
			return ;
		const room = await this.messagesService.getRoomById(roomId);
		if (!room)
			throw new ForbiddenException('No room found');
		client.leave(roomId.toString());
		const inRoom = await this.isUserInRoom(roomId.toString(), user);
		if (!inRoom) {
			await this.messagesService.disconnectedUser(room.id, user.id);
			this.server.to(roomId.toString()).emit('refreshConnected', user, true);
		}
		console.log(user.username, 'left room :', room.name);
	}


	@SubscribeMessage('findRoomMessages')
	async findRoomMessages(@ConnectedSocket() client: Socket,
	@MessageBody('id') id: number) {
		const user = await this.socketService.getUser(client.id);
			if (!user)
				return ;
		const messages = await this.messagesService.getMessagesByRoom(id);
		const blockedUsers = await this.messagesService.getBlockedUsers(user.id);

		const filteredMessages = messages.filter((message) => {
			const authorId = message.author.id;
			return !blockedUsers.some((blockedUser) => blockedUser.id === authorId);
		  });
		
		return filteredMessages;
	}
	
	@SubscribeMessage('createMessage')
	async create(
	@MessageBody('roomId') roomId: number,
	@MessageBody('text') text: string,
	@ConnectedSocket() client: Socket) {
	try {
	  const user = await this.socketService.getUser(client.id);
	  if (!user)
		  return ;
	  const room = await this.messagesService.getRoomById(roomId);
	  if (!room)
		  throw new ForbiddenException('Room does not exist');
	  const banned = await this.messagesService.isBanned(room.id, user.id);
	  if (banned)
	  	throw new ForbiddenException('You are banned from this room !');
	const muted = await this.messagesService.isMuted(room.id, user.id);
	if (muted)
		throw new ForbiddenException('You are muted from this room !');
	  const message = await this.messagesService.createMessage(user.id, text, roomId);
	  this.server.to(room.id.toString()).emit('refreshMessages', message, false);
	//   this.server.emit('newMessage', message);
	  return message;
	} catch (e) {
		client.emit('msgError', { message: e.message });
	}
	}

	@SubscribeMessage('promoteAdmin')
	async promoteAdmin(@MessageBody('targetId') target: number,
	@MessageBody('roomId') roomId: number,
	@ConnectedSocket() client: Socket)
	{
		try {
		const user = await this.socketService.getUser(client.id);
		if (!user)
			return ;
		const room = await this.messagesService.getRoomById(roomId);
		if (!room)
			throw new ForbiddenException('Room does not exist');
		const verifyClient = await this.messagesService.isAdmin(room.id, user.id);
		if (!verifyClient)
			throw new ForbiddenException('Client is not an admin');
		const userTarget = await this.messagesService.searchUserId(target);
		if (!userTarget)
			throw new ForbiddenException('Target does not exist');
		const targetIsBanned = await this.messagesService.isBanned(room.id, userTarget.id);
		if (targetIsBanned)
			throw new ForbiddenException('Cannot promote a banned user');
		const aleradyAdmin = await this.messagesService.isAdmin(room.id, userTarget.id);
		if (aleradyAdmin)
			throw new ForbiddenException('User is alerady an admin');
		this.messagesService.promoteAdmin(room.id, userTarget.id);
		this.server.to(roomId.toString()).emit('refreshAdmins', userTarget, false);
	} catch (e) {
		client.emit('msgError', { message: e.message });
	}
}
	@SubscribeMessage('demoteAdmin')
	async demoteAdmin(@MessageBody('targetId') target: number,
	@MessageBody('roomId') roomId: number,
	@ConnectedSocket() client: Socket)
	{
		try {
		const user = await this.socketService.getUser(client.id);
		if (!user)
			return ;
		const room = await this.messagesService.getRoomById(roomId);
		if (!room)
			throw new ForbiddenException('Room does not exist');
		const verifyClient = await this.messagesService.isAdmin(room.id, user.id);
		if (!verifyClient)
			throw new ForbiddenException('Client is not an admin');
		const userTarget = await this.messagesService.searchUserId(target);
		if (!userTarget)
			throw new ForbiddenException('Target does not exist');
		const owner = await this.messagesService.owner(roomId);
		if (target === owner?.id)
			throw new ForbiddenException('Cannot demote the owner !');
		const wasAdmin = this.messagesService.isAdmin(room.id, userTarget.id);
		if (!wasAdmin)
			throw new ForbiddenException('User is not an admin');
		this.messagesService.demoteAdmin(room.id, userTarget.id);
		this.server.to(roomId.toString()).emit('refreshAdmins', userTarget, true);
	} catch (e) {
		client.emit('msgError', { message: e.message });
	}
}
	@SubscribeMessage('ban')
	async ban(@MessageBody('targetId') target: number,
	@MessageBody('roomId') roomId: number,
	@ConnectedSocket() client: Socket)
	{
		try {

			const user = await this.socketService.getUser(client.id);
			if (!user)
				return ;
			const room = await this.messagesService.getRoomById(roomId);
			if (!room)
			throw new ForbiddenException('Room does not exist');
			const verifyClient = await this.messagesService.isAdmin(room.id, user.id);
			if (!verifyClient)
			throw new ForbiddenException('Client is not an admin');
			const userTarget = await this.messagesService.searchUserId(target);
			if (!userTarget)
			throw new ForbiddenException('Target does not exist');
			const owner = await this.messagesService.owner(roomId);
			if (target === owner?.id)
			throw new ForbiddenException('Cannot ban the owner !');
		const targetIsBanned = await this.messagesService.isBanned(room.id, userTarget.id);
		if (targetIsBanned)
		throw new ForbiddenException('Target Alerady Banned');
		this.messagesService.ban(room.id, userTarget.id);
			
		const isConnected = await this.messagesService.isConnected(room.id, userTarget.id);
		if (isConnected)
		{
			this.server.to(`user_${userTarget.id}`).emit('kickUser', {name: room.name});
		}
		this.server.to(room.id.toString()).emit('refreshBanned', userTarget, false);
		} catch (e) {
			client.emit('msgError', { message: e.message });
		}
	}
	@SubscribeMessage('unban')
	async unban(@MessageBody('targetId') target: number,
	@MessageBody('roomId') roomId: number,
	@ConnectedSocket() client: Socket)
	{
		try {
		const user = await this.socketService.getUser(client.id);
		if (!user)
			return ;
		const room = await this.messagesService.getRoomById(roomId);
		if (!room)
			throw new ForbiddenException('Room does not exist');
		const verifyClient = await this.messagesService.isAdmin(room.id, user.id);
		if (!verifyClient)
			throw new ForbiddenException('Client is not an admin');
		const userTarget = await this.messagesService.searchUserId(target);
		if (!userTarget)
			throw new ForbiddenException('Target does not exist');
		const targetIsBanned = await this.messagesService.isBanned(room.id, userTarget.id);
		if (!targetIsBanned)
			throw new ForbiddenException('Target is not Banned');
		this.messagesService.unban(room.id, userTarget.id);
		this.server.to(room.id.toString()).emit('refreshBanned', userTarget, true);
		this.messagesService.removeWhitelistUser(room.id, userTarget.id);
		this.server.to(room.id.toString()).emit('refreshWhiteList', userTarget, true);


	} catch (e) {
		client.emit('msgError', { message: e.message });
	}
}

	@SubscribeMessage('mute')
	async mute(@MessageBody('targetId') target: number,
	@MessageBody('roomId') roomId: number,
	@ConnectedSocket() client: Socket)
	{
		try {
		const user = await this.socketService.getUser(client.id);
		if (!user)
			return ;
		const room = await this.messagesService.getRoomById(roomId);
		if (!room)
			throw new ForbiddenException('Room does not exist');
		const verifyClient = await this.messagesService.isAdmin(room.id, user.id);
		if (!verifyClient)
			throw new ForbiddenException('Client is not an admin');
		const userTarget = await this.messagesService.searchUserId(target);
		if (!userTarget)
			throw new ForbiddenException('Target does not exist');
		const owner = await this.messagesService.owner(roomId);
		if (target === owner?.id)
			throw new ForbiddenException('Cannot mute the owner !');
		this.messagesService.mute(room.id, userTarget.id);
	} catch (e) {
		client.emit('msgError', { message: e.message });
	}
}
	@SubscribeMessage('unmute')
	async unmute(@MessageBody('targetId') target: number,
	@MessageBody('roomId') roomId: number,
	@ConnectedSocket() client: Socket)
	{
		try {
		const user = await this.socketService.getUser(client.id);
		if (!user)
			return ;
		const room = await this.messagesService.getRoomById(roomId);
		if (!room)
			throw new ForbiddenException('Room does not exist');
		const verifyClient = await this.messagesService.isAdmin(room.id, user.id);
		if (!verifyClient)
			throw new ForbiddenException('Client is not an admin');
		const userTarget = await this.messagesService.searchUserId(target);
		if (!userTarget)
			throw new ForbiddenException('Target does not exist');
		this.messagesService.unmute(room.id, userTarget.id);
	} catch (e) {
		client.emit('msgError', { message: e.message });
	}
}

	@SubscribeMessage('kick')
	async kick(@MessageBody('targetId') targetId: number,
	@MessageBody('roomId') roomId: number,
	@ConnectedSocket() client: Socket)
	{
		try {
		const user = await this.socketService.getUser(client.id);
		if (!user)
			return ;
		const room = await this.messagesService.getRoomById(roomId);
		if (!room)
			throw new ForbiddenException('Room does not exist');
		const verifyClient = await this.messagesService.isAdmin(room.id, user.id);
		if (!verifyClient)
			throw new ForbiddenException('Client is not an admin');
		const owner = await this.messagesService.owner(roomId);
		if (targetId === owner?.id)
			throw new ForbiddenException('Cannot kick the owner !');
		const isConnected = await this.messagesService.isConnected(room.id, targetId);
		if (isConnected)
			this.server.to(`user_${targetId}`).emit('kickUser', {name: room.name});
		const target = await this.messagesService.searchUserId(targetId);
		if (!target)
			return;
		this.messagesService.removeWhitelistUser(room.id, target.id);
		this.server.to(room.id.toString()).emit('refreshWhiteList', target, true);
		this.server.to(`user_${targetId}`).emit('deleted', room.id);
		
	} catch (e) {
			client.emit('msgError', { message: e.message });
		}
}

	@SubscribeMessage('popupInfos')
	async popupInfos(@MessageBody('id') id: number, @MessageBody('roomId') roomId: number,
	@ConnectedSocket() client: Socket) {
		const user = await this.socketService.getUser(client.id);
		if (!user)
			return ;
		const room = await this.messagesService.getRoomById(roomId);
		if (!room)
			throw new ForbiddenException('Room does not exist');
		const target = await this.messagesService.searchUserId(id);
		if (!target)
			throw new ForbiddenException('Target does not exist');
		const isClientAdmin = await this.messagesService.isAdmin(room.id, user.id);
		const isAdmin = await this.messagesService.isAdmin(room.id, target.id);
		const isBanned = await this.messagesService.isBanned(room.id, target.id);
		const isMuted = await this.messagesService.isMuted(room.id, target.id);
		return ({ban: isBanned, mute: isMuted, admin: isAdmin, clientAdmin: isClientAdmin});
	}
	@SubscribeMessage('isAdmin')
	async isAdmin(@MessageBody('roomId') roomId: number,
	@ConnectedSocket() client: Socket) {
		const user = await this.socketService.getUser(client.id);
		if (!user)
			return ;
		const room = await this.messagesService.getRoomById(roomId);
		if (!room)
			throw new ForbiddenException('Room does not exist');
		const isClientAdmin = await this.messagesService.isAdmin(room.id, user.id);
		return isClientAdmin;
	}
	@SubscribeMessage('isConnected')
	async isConnected(@MessageBody('roomId') roomId: number, @MessageBody('userId') userId: number) {
		const isConnected = this.messagesService.isConnected(roomId, userId);
		return isConnected;
	}

	@SubscribeMessage('createDirectMessage')
	async createDirectMessage(@MessageBody('targetId') targetId: number,
	@ConnectedSocket() client: Socket) {
		try {
		const userA = await this.socketService.getUser(client.id);
		if (!userA)
			return ;
		const userB = await this.messagesService.searchUserId(targetId);
		if (!userA || !userB)
			throw new ForbiddenException('User does not exist');

		const blockedA = await this.messagesService.getBlockedUsers(userA.id);
		const blockedB = await this.messagesService.getBlockedUsers(userB.id);
		if (blockedA.some((user) => user.id === userB.id))
			throw new ForbiddenException('This user is blocked !');
		if (blockedB.some((user) => user.id === userA.id))
			throw new ForbiddenException('This user has blocked you !');

		const roomExists = await this.messagesService.findDirectMsg(userA.id, userB.id);
		if (roomExists)
		{
			client.join(roomExists.id.toString());
			client.emit('passSuccess', {id: roomExists.id});
		}
		else
		{
			const room = await this.messagesService.createDirectMsg(userA, userB);
			if (!room)
				throw new ForbiddenException('Room cannot be created');
			client.join(room.id.toString());
			client.emit('newRoom', room);
			this.server.to(`user_${targetId}`).emit('newRoom', room);
			client.emit('passSuccess', {id: room.id});
		}
		} catch (e) {
			client.emit('msgError', { message: e.message });
			client.emit('errorMessage',  e.message );
		}
	}

	@SubscribeMessage('deleteRoom')
	async deleteRoom(@MessageBody('roomId') roomId: number,
	@ConnectedSocket() client: Socket)
	{
		try {
		const user = await this.socketService.getUser(client.id);
		if (!user)
			return ;
		const room = await this.messagesService.getRoomById(roomId);
		if (!room)
			throw new ForbiddenException('Room does not exist');
			if (room.owner.id !== user.id)
				throw new ForbiddenException('You are not the owner of this room !');
		const verifyClient = await this.messagesService.isAdmin(room.id, user.id);
		if (!verifyClient)
			throw new ForbiddenException('Client is not an admin');
		await this.messagesService.deleteRoom(room.id);
		this.server.emit('deleted', room.id);
		this.server.to(roomId.toString()).emit('kickUser', {name: room.name});
		} catch (e) {
		client.emit('msgError', { message: e.message });
	}
}

	@SubscribeMessage('addToChat')
	async addToChat(@MessageBody('friendId') friendId: number,
	@MessageBody('roomId') roomId: number,
	@ConnectedSocket() client: Socket) {
		try {
		const user = await this.socketService.getUser(client.id);
		if (!user)
			return ;
		const room = await this.messagesService.getRoomById(roomId);
		if (!room)
			throw new ForbiddenException('Room does not exist');
		if (room.type === 'direct')
			throw new ForbiddenException('Cannot add user to private message');
		const verifyClient = await this.messagesService.isAdmin(room.id, user.id);
		if (!verifyClient)
			throw new ForbiddenException('User is not an admin');
		const target = await this.messagesService.searchUserId(friendId);
		if (!target)
			throw new ForbiddenException('Target does not exist');

		const blockedA = await this.messagesService.getBlockedUsers(user.id);
		const blockedB = await this.messagesService.getBlockedUsers(target.id);
		if (blockedA.some((blocked) => blocked.id === target.id))
			throw new ForbiddenException('This user is blocked !');
		if (blockedB.some((blocked) => blocked.id === user.id))
			throw new ForbiddenException('This user has blocked you !');
	
		this.messagesService.addWhitelistUser(room.id, friendId);
		this.server.to(room.id.toString()).emit('refreshWhiteList', target, false);
		if (room.type === 'private' || room.type === 'direct')
			this.server.to(`user_${friendId}`).emit('newRoom', room);
		}
		catch (e) {
			client.emit('msgError', { message: e.message });
		}
	}

	
	//Classic
	
	@SubscribeMessage('getChatRoomData')
	async getChatRoomData(@ConnectedSocket() client: Socket, @MessageBody('roomId') roomId: number) {
		const user = await this.socketService.getUser(client.id);
		if (!user)
		return ;
		const data: ChatRoomData = await this.messagesService.getChatRoomData(roomId, user.id);
		return data;
	}
	
	@SubscribeMessage('quitRoom')
	async quitRoom(
		@MessageBody('roomId') roomId: number,
		@ConnectedSocket() client: Socket) {
			try {
				const user = await this.socketService.getUser(client.id);
				if (!user)
				return ;
				const room = await this.messagesService.getRoomById(roomId);
				if (!room)
				throw new ForbiddenException('Room does not exist');
				await this.messagesService.removeWhitelistUser(room.id, user.id);
				this.server.to(room.id.toString()).emit('refreshWhiteList', user, true);
				if (room.type !== 'public' && room.type !== 'protected')
					this.server.to(`user_${user.id}`).emit('deleted', room.id);
			} catch (e) {
			client.emit('msgError', { message: e.message });
		}
	}
	
	@SubscribeMessage('protectRoom')
	async protectRoom(@MessageBody('roomId') roomId: number,
	@MessageBody('password') password: string,
	@ConnectedSocket() client: Socket) {
		try {
			const user = await this.socketService.getUser(client.id);
			if (!user)
			return ;
			const room = await this.messagesService.getRoomById(roomId);
			if (!room)
			throw new ForbiddenException('Room does not exist');
			const verifyClient = await this.messagesService.isAdmin(room.id, user.id);
			if (!verifyClient)
			throw new ForbiddenException('User is not an admin');	
			await this.messagesService.protectRoom(roomId, password);
			this.server.to(room.id.toString()).emit('refreshType', 'protected');
			this.server.emit('refreshRoomSelectType', room.id ,'protected');
		} catch (e) {
			client.emit('msgError', { message: e.message });
		}
	}
	@SubscribeMessage('unprotectRoom')
	async unprotectRoom(@MessageBody('roomId') roomId: number,
	@ConnectedSocket() client: Socket) {
	try {
		const user = await this.socketService.getUser(client.id);
		if (!user)
		return ;
		const room = await this.messagesService.getRoomById(roomId);
		if (!room)
		throw new ForbiddenException('Room does not exist');
		const verifyClient = await this.messagesService.isAdmin(room.id, user.id);
		if (!verifyClient)
		throw new ForbiddenException('User is not an admin');	
		await this.messagesService.unprotectRoom(roomId);
		this.server.to(room.id.toString()).emit('refreshType', 'public');
		this.server.emit('refreshRoomSelectType', room.id ,'public');
	} catch (e) {
		client.emit('msgError', { message: e.message });
	}
}


	@SubscribeMessage('displayDirect')
	async displayDirect(@MessageBody('roomId') roomId: number,
	@ConnectedSocket() client: Socket) {
		const user = await this.socketService.getUser(client.id);
		if (!user)
		return ;
		const room = await this.messagesService.getRoomById(roomId);
		if (!room)
		throw new ForbiddenException('Room does not exist');
		const roomUsers = room.whitelist;
		const other = roomUsers.find((guy) => guy.id !== user.id);
		if (!other)
			return ;
		return other.gameLogin;
	}


//Ne fonctionne plus pour le moment
// @SubscribeMessage('typing')
// async typing(@MessageBody() dto: TypingDto, @ConnectedSocket() client: Socket) {
//   const user = await this.socketService.getUser(client.id);
//   const username = user.username;
//   const typing = dto.isTyping;
//   client.to(dto.roomName).emit('typing', { username, typing });
// }

}
