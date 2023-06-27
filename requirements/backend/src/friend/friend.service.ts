import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { FriendRequest } from '@prisma/client'

@Injectable()
export class FriendService {
    constructor(private prisma: PrismaService) { }

    async bloqueUserById(userId: number, friendId: number) {
        const isAreadyBloque = await this.prisma.bloqueUser.findMany({
            where: { senderId: userId, recipientId: friendId },
        })
        if (isAreadyBloque.length)
            return undefined
        const request = await this.prisma.bloqueUser.create({
            data: {
                sender: { connect: { id: userId } },
                recipient: { connect: { id: friendId } }
            },
        });
        await this.prisma.friend.deleteMany({
            where: {
                userId: userId,
                friendId: friendId
            }
        })
        await this.prisma.friend.deleteMany({
            where: {
                userId: friendId,
                friendId: userId
            }
        })
    }

    async createFriendRequest(UserId: number, friendId: number) {
        const isAlreadyFriend = await this.prisma.friend.findMany({
            where: { userId: UserId, friendId: friendId }
        })

        if (isAlreadyFriend.length) {
            throw new Error(`user ${UserId} is already friend with ${friendId}`);
        }
        const isAlreadyRequest = await this.prisma.friendRequest.findMany({
            where: { senderId: UserId, recipientId: friendId },
        })
        const bloque = await this.prisma.bloqueUser.findMany({
            where: { senderId: UserId, recipientId: friendId }
        })
        const bloqued = await this.prisma.bloqueUser.findMany({
            where: { recipientId: UserId, senderId: friendId }
        })
        if (isAlreadyRequest.length || bloque.length || bloqued.length) {
            return undefined;
        }
        const request = await this.prisma.friendRequest.create({
            data: {
                sender: { connect: { id: UserId } },
                recipient: { connect: { id: friendId } }
            },
        });
        const ret = await this.prisma.friendRequest.findMany({
            where: { senderId: UserId, recipientId: friendId },
            include: { sender: true }
        })
        return ret[0]
    }

    async addFriend(userId: number, friendId: number): Promise<void> {
        const friend = await this.prisma.user.findUnique({
            where: { id: friendId },
        });
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!friend || !user) {
            throw new Error(`No user found with id ${friendId}`);
        }

        await this.prisma.friend.create({
            data: {
                user: { connect: { id: friendId } },
                friend: { connect: { id: userId } },
            }
        })
    }

    async acceptFriendRequest(UserId: number, friendId: number) {

        await this.prisma.friendRequest.deleteMany({
            where: {
                senderId: friendId,
                recipientId: UserId
            }
        })
        await this.addFriend(UserId, friendId)
        await this.addFriend(friendId, UserId)
    }

    async refuseFriendRequest(UserId: number, friendId: number) {
        await this.prisma.friendRequest.deleteMany({
            where: {
                senderId: friendId,
                recipientId: UserId
            }
        })
    }

    async getFriendsByUserId(userId: number) {
        const friend = await this.prisma.friend.findMany({
            where: { userId },
            include: { friend: true },
        })
        return friend.map(friend => {
            const { access_token, ...rest } = friend.friend
            return { ...friend, friend: rest }
        })
    }

    async deleteFriendById(userId: number, friendId: number) {
        await this.prisma.friend.deleteMany({
            where: {
                userId: userId,
                friendId: friendId
            }
        })
        await this.prisma.friend.deleteMany({
            where: {
                userId: friendId,
                friendId: userId
            }
        })
    }

    async userByName(userId: number, name: string) {
        const validCharacters = /^[a-zA-Z0-9_-éèàç]+$/
        if (!validCharacters.test(name)) {
            console.log("incorrect FriendName");
            return [];
        }
        const friend = await this.prisma.user.findMany({
            where: {
                gameLogin: {
                    startsWith: name,
                }
            }
        })
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { friend: true }
        })
        const alreadyReq = await this.prisma.friendRequest.findMany({
            where: { senderId: userId },
        })
        const bloqued = await this.prisma.bloqueUser.findMany({
            where: { senderId: userId },
        })
        const bloquedBy = await this.prisma.bloqueUser.findMany({
            where: { recipientId: userId },
        })
        const filtered = friend.filter((friend) => friend.id !== userId && !user?.friend.some((f) => f.friendId === friend.id) && !alreadyReq?.some((req) => req.recipientId === friend.id) && !bloqued?.some((req) => req.recipientId === friend.id) && !bloquedBy?.some((req) => req.senderId === friend.id))
        return filtered.map(friend => {
            const { access_token, ...rest } = friend
            return friend
        })
    }

    async getFriendReq(userId: number) {
        const request = await this.prisma.friendRequest.findMany({
            where: { recipientId: userId },
            include: { sender: true }
        })
        return request.map(sender => {
            const { access_token, ...rest } = sender.sender
            return { ...sender, sender: rest }
        })
    }

    async getUserById(id: number) {
        if (Number.isNaN(id))
            return ;
        const user = await this.prisma.user.findUnique({
            where: { id: id }
        })
        return user?.gameLogin
    }
}
