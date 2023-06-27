import { Injectable } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { CreateRoomDto, MessageObj } from './entities/message.entity';
import { PrismaService } from 'src/prisma/prisma.service';
import { User, Message } from '@prisma/client';

@Injectable()
export class SocketsService {
  // private clientToUser: { [clientId: string]: User } = {};

  private clientProfileMap: Map<string, User> = new Map<string, User>();

  constructor(private prisma: PrismaService) { }

  async getUserWithToken(access_token: string) {
    const user = await this.prisma.user.findFirstOrThrow({
      where: {
        access_token: access_token,
      },
      include: { friend: true }
    });
    return user;
  }

  async getUserWithid(id: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: id,
      },
      include: { friend: true }
    });
    return user;
  }

  async setClientMap(user: User, clientId: string) {
    this.clientProfileMap.set(clientId, user);
  }

  findSocketById(id: number) {
    const idS: string[] = [];

    for (const [key, value] of this.clientProfileMap.entries()) {
      if (id === value.id) {
        idS.push(key);
      }
    }

    const clientId = idS[0];

    return clientId;
  }

  async getUser(clientId: string) {
    return this.clientProfileMap.get(clientId);
  }

  supClient(clientId: string) {
    this.clientProfileMap.delete(clientId);
  }

  async changeState(userId: number, newState: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { state: newState }
    })
  }

  async changeWin(userId: number, Win: boolean) {
    if (Win)
    {
      await this.prisma.user.update({
        where: { id: userId },
        data: { win: {increment: 1} }
      })
    }
    else
    {
      await this.prisma.user.update({
        where: { id: userId },
        data: { loose: {increment: 1} }
      })
    }
  }

  async updateElo(userId: number, newElo: number) {
    await this.prisma.user.update({
        where: { id: userId },
        data: { elo: Math.round(newElo) },
    });
  }

}
