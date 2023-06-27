import { ForbiddenException, HttpException, Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { CreateRoomDto, MessageObj, RoomObj } from './entities/message.entity';
import { PrismaService } from 'src/prisma/prisma.service';
import { User, Message, Room } from '@prisma/client';
import * as argon from 'argon2';

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

@Injectable()
export class MessageService {
  private clientToUser: { [clientId: string]: User } = {};

  constructor(private prisma: PrismaService) { }

  
  async searchUser(userName : string) {
    const user = await this.prisma.user.findUnique({
      where : {
        username : userName,
      },
    });
    return user;
  }
  async searchUserId(id : number) {
    const user = await this.prisma.user.findUnique({
      where : {
        id : id,
      },
    });
    return user;
  }

  async owner(roomId : number) {
    const room = await this.prisma.room.findUnique({
      where : {
        id : roomId,
      },
    });
    if (!room)
      throw new ForbiddenException('Room not found');
    const owner = await this.prisma.user.findUnique({
      where : {
        id : room.ownerId,
      },
    });
    return owner;
  }

  async connectedUser(roomId: number, userId: number)
  {
    return this.prisma.room.update({
      where: { id: roomId },
      data: { connected: { connect: { id: userId } } },
    });
  }
  async disconnectedUser(roomId: number, userId: number)
  {
    return this.prisma.room.update({
      where: { id: roomId },
      data: { connected: { disconnect: { id: userId } } },
    });
  }
  async isConnected(roomId: number, userId: number) {
    const room = await this.prisma.room.findUnique({
      where : {id: roomId},
      include: { connected: true },
    });
    const isConnected = room?.connected.some((user) => user.id === userId);
    return isConnected;
  }
  async getConnected(roomId: number) {
    const rooms = await this.prisma.room.findUnique({
      where : {id: roomId},
      include: { connected: true },
    });
    return rooms?.connected;
  }

  async createRoom(userId: number, roomName: string, type: string) {
    // let hash: string = '';
    // if (dto.password)
    //   hash = await argon.hash(dto.password);
    const validCharacters = /^[a-zA-Z0-9_-éèàç]+$/
    if (!validCharacters.test(roomName)) {
        throw new ForbiddenException('Room Name can only contain alphanumeric characters, hyphens and underscores');
    }
    const room = await this.prisma.room.create({
      data: {
        name: roomName,
        type: type,
        // password: hash,
        owner: { connect: { id: userId } },
      }
    });
    const completeRoom = await this.prisma.room.findUnique({
      where : {id: room.id},
      include: { owner: true },
    })
    if (!completeRoom)
      throw new HttpException('Room not found', 400);
    return completeRoom;
  }
  
   async deleteRoom(roomId: number) {
    return this.prisma.room.update({
      where: { id: roomId },
      data: { active: false },
    });

  }

  findAllRooms() {
    const rooms = this.prisma.room.findMany();
    return rooms;
  }
  async roomExist(roomName: string) {

      const rooms = await this.prisma.room.findMany({
        where : {
          name: roomName,
        },
      });
    const activeRoom = rooms.some((room) => room.active === true);
    return activeRoom;
  }
  async getRoomById(roomId: number) {
    const room = await this.prisma.room.findUnique({
      where : {
        id: roomId,
      },
      include: { owner: true, whitelist:true },
    });
    return room;
  }

  async addWhitelistUser(roomId: number, userId: number) {
    return this.prisma.room.update({
      where: { id: roomId },
      data: { whitelist: { connect: { id: userId } } },
    });
  }
  async removeWhitelistUser(roomId: number, userId: number) {
    return this.prisma.room.update({
      where: { id: roomId },
      data: { whitelist: { disconnect: { id: userId } } },
    });
  }
  async searchWhiteList(roomId: number, userId: number) {
    const room = await this.prisma.room.findUnique({
      where : {id: roomId},
      include: { whitelist: true },
    });
    const isWhiteListed = room?.whitelist.some((user) => user.id === userId);
    return isWhiteListed;
  }
  async getWhiteList(roomId: number) {
    const rooms = await this.prisma.room.findUnique({
      where : {id: roomId},
      include: { whitelist: true },
    });
    return rooms?.whitelist;
  }

  async ban(roomId: number, userId: number) {
    return this.prisma.room.update({
      where: { id: roomId },
      data: { banned: { connect: { id: userId } } },
    });
  }
  async unban(roomId: number, userId: number) {
    return this.prisma.room.update({
      where: { id: roomId },
      data: { banned: { disconnect: { id: userId } } },
    });
  }
  async isBanned(roomId: number, userId: number) {
    const room = await this.prisma.room.findUnique({
      where : {id: roomId},
      include: { banned: true },
    });
    const ban = room?.banned.some((user) => user.id === userId);
    return ban;
  }

  async mute(roomId: number, userId: number) {
    return this.prisma.room.update({
      where: { id: roomId },
      data: { muted: { connect: { id: userId } } },
    });
  }
  async unmute(roomId: number, userId: number) {
    return this.prisma.room.update({
      where: { id: roomId },
      data: { muted: { disconnect: { id: userId } } },
    });
  }
  async isMuted(roomId: number, userId: number) {
    const room = await this.prisma.room.findUnique({
      where : {id: roomId},
      include: { muted: true },
    });
    const mute = room?.muted.some((user) => user.id === userId);
    return mute;
  }

  async promoteAdmin(roomId: number, userId: number) {
    return this.prisma.room.update({
      where: { id: roomId },
      data: { admin: { connect: { id: userId } } },
    });
  }
  async demoteAdmin(roomId: number, userId: number) {
    return this.prisma.room.update({
      where: { id: roomId },
      data: { admin: { disconnect: { id: userId } } },
    });
  }
  async isAdmin(roomId: number, userId: number) {
    const room = await this.prisma.room.findUnique({
      where : {id: roomId},
      include: { admin: true },
    });
    const adm = room?.admin.some((user) => user.id === userId);
    return adm;
  }

  async createMessage(userId: number, text: string, roomId: number) {
    const message = await this.prisma.message.create({
      data: {
        author: {connect: {id: userId} },
        text: text,
        room: { connect: { id: roomId } },
      }
    })
    const messageComplete = await this.prisma.message.findUnique({
      where : {id: message.id},
      include: { author: true },
    })
    const filteredUser = (user: User): any => {
      const { access_token, ...filteredData } = user;
      return filteredData;
    };
    const filteredMessage = (message: any): any => {
      return {
        ...message,
        author: filteredUser(message.author),
      };
    }
    const messagefiltered = filteredMessage(messageComplete);
    return messagefiltered;
  }

  async getMessagesByRoom(roomId: number) {
  const messages = await this.prisma.message.findMany({
      where: { roomId },
      include: { author: true },
      orderBy: { createdAt: 'asc' },
    });
    const filteredUser = (user: User): any => {
      const { access_token, ...filteredData } = user;
      return filteredData;
    };
    const filteredMessage = (message: any): any => {
      return {
        ...message,
        author: filteredUser(message.author),
      };
    }
    const messagesFiltered = messages.map(filteredMessage);
    return messagesFiltered;
} 

  async findDirectMsg(idA: number, idB: number) {
    const directIdA: string = idA.toString() + idB.toString();
    const roomA = await this.prisma.room.findFirst({
      where: {directId: directIdA},
    })
    if (roomA && roomA.active)
    return roomA;
    const directIdB: string = idB.toString() + idA.toString();
    const roomB = await this.prisma.room.findFirst({
      where: {directId: directIdB},
    })
    if (roomB && roomB.active)
      return roomB;
    return null;
  }
  async createDirectMsg(userA: User, userB: User) {
    const exists = await this.findDirectMsg(userA.id, userB.id);
    if (exists)
      return exists;
    const name = userA.gameLogin + ' - ' + userB.gameLogin;
    const directId: string = userA.id.toString() + userB.id.toString();
    const room = await this.prisma.room.create({
      data: {
        name: name,
        type: 'direct',
        owner: { connect: { id: userA.id } },
        directId: directId,
      }
    });
    if (room)
    {
      this.addWhitelistUser(room.id, userA.id);
      this.addWhitelistUser(room.id, userB.id);
    }
    return room;
  }

  async getRoomsForUser(user: User): Promise<Room[]> {
    const rooms = await this.prisma.room.findMany({
      where: {
        active: true,
        OR: [
          { type: { notIn: ['private', 'direct'] } },
          { whitelist: { some: { id: user.id } } },
        ],
      },
      include: {
        whitelist: true,
        owner: true,
      },
    });


    return rooms.map((room) => {
      const { whitelist, owner, ...filteredRoom } = room;
      return {
        ...filteredRoom,
        whitelist: whitelist.map(({ access_token, ...user }) => user),
        owner: owner && { ...owner, access_token: undefined },
      };
    });

  }

  async getChatRoomData(roomId: number, userId: number): Promise<ChatRoomData> {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      include: {
        whitelist: true,
        admin: true,
        banned: true,
        connected: true,
        owner: true,
      },
    });

    if (!room)
      throw new ForbiddenException('No Room found !');

      const friends = await this.prisma.friend.findMany({
        where: { userId: userId },
        include: { friend: true },
      });
      const blocked = await this.prisma.bloqueUser.findMany({
        where: { senderId: userId },
        include: { recipient: true },
      });
    
      const filteredFriends = friends.map((friend) => friend.friend);
      const filteredBlocked = blocked.map((block) => block.recipient);

    const filteredUser = (user: User): any => {
      const { access_token, ...filteredData } = user;
      return filteredData;
    };

    const {password, ...filteredRoom} = room;

    return {
      whitelist: room.whitelist.map(filteredUser),
      admins: room.admin.map(filteredUser),
      banned: room.banned.map(filteredUser),
      connected: room.connected.map(filteredUser),
      friends: filteredFriends.map(filteredUser),
      blocked: filteredBlocked.map(filteredUser),
      room: filteredRoom,
      owner: filteredUser(room.owner),
    };
  }
  
  async protectRoom(roomId: number, password: string) {

   const hash = await argon.hash(password);
    return await this.prisma.room.update({
      where: { id: roomId },
      data: { type: 'protected', password: hash },
    });
  }
  async unprotectRoom(roomId: number) {
    return await this.prisma.room.update({
      where: { id: roomId },
      data: { type: 'public', password: '' },
    });
  }

  async getBlockedUsers(userId: number) {
    const blocked = await this.prisma.bloqueUser.findMany({
      where: { senderId: userId },
      include: { recipient: true },
    });
    const filteredBlocked = blocked.map((block) => block.recipient);

    const filteredUser = (user: User): any => {
      const { access_token, ...filteredData } = user;
      return filteredData;
    };
    return filteredBlocked.map(filteredUser);
  }

}