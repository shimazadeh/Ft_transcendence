import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as fs from 'fs';
import * as path from 'path';

interface AuthenticatedUser {
	id: number;
	username: string;
    avatar: string;
}

interface MulterFile {
	originalname: string;
	encoding: string;
	mimetype: string;
	buffer: Buffer;
	size: number;
  }

@Injectable()
export class UserService {
    constructor(private prismaService: PrismaService,
        private jwtService: JwtService) { }

    async getAllUsers() {
        const users = await this.prismaService.user.findMany({
            select: {
                id: true,
                state: true,
                username: true,
                elo: true,
                win: true,
                loose: true,
                gameLogin: true,
            }
        });
        return users;
    }

    async getUserFromToken(token: string) {
        try {
            const decoded = this.jwtService.verify(token);
            if (!decoded) {
                return null;
            }

            const user = await this.prismaService.user.findUnique({
                where: {
                    id: decoded.userId,
                },
            });

            if (!user) {
                return null;
            }

            return {
                id: user.id,
                username: user.username,
                elo: user.elo,
            };
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    async updateGameLogin(id: number, gameLogin: string) {
        const existingUser = await this.prismaService.user.findFirst({
            where: { id: id }
        });
        if(!existingUser){
            throw new HttpException('No user found with given id', 404);
        }
        if(existingUser.gameLogin === gameLogin){
            throw new HttpException('New username is same as the old username', 400);
        }
        if (gameLogin.length < 5 || gameLogin.length > 30) {
            throw new HttpException('Game login must have between 5 and 30 characters', 400);
        }
        const validCharacters = /^[a-zA-Z0-9_éèàç-]+$/
        if (!validCharacters.test(gameLogin)) {
            throw new HttpException('Game login can only contain alphanumeric characters, hyphens and underscores', 400);
        }
        const usernameTaken = await this.prismaService.user.findFirst({
            where: { gameLogin: gameLogin }
        });
        if(usernameTaken){
            throw new HttpException('Game login is already taken by another user', 400);
        }
        return this.prismaService.user.update({
            where: {id: id},
            data: { gameLogin: gameLogin},
        })
    }

    async getBlock(userId: number) {
        const user = await this.prismaService.bloqueUser.findMany({
            where: { senderId: userId },
            include: { recipient: true }
        })
        return user
    }

    async deleteBlock(blockId: number) {
        await this.prismaService.bloqueUser.delete({
            where: { id: blockId }
        })
    }

    async updateAvatar(user: AuthenticatedUser, avatar: MulterFile) {

        // size protection
        const MAX_SIZE = 2 * 1024 * 1024;
        if (avatar.size > MAX_SIZE) {
            throw new HttpException('File is too large. Maximum size is 2MB.', 400);
        }

        // filetype protection
        const allowedMimes = ['image/jpeg', 'image/pjpeg', 'image/png', 'image/gif'];
        if (!allowedMimes.includes(avatar.mimetype)) {
            throw new HttpException('Only jpg, png, and gif image files are allowed.', 400);
        }

        // create unique id for avatar
        const filename = `${user.id}_${Date.now()}_${avatar.originalname}`;
        const filepath = `./avatars/${filename}`;

        await fs.promises.writeFile(filepath, avatar.buffer);
        const avatarUrl = `http://${process.env.DOMAIN}:5000/avatars/${filename}`;
        const updatedUser = await this.prismaService.user.update({
          where: { id: user.id },
          data: { avatar: avatarUrl },
        });

        // Delete old avatar file
        if (user.avatar && user.avatar.startsWith(`http://${process.env.DOMAIN}:5000/avatars/`)) {
            const oldAvatarFilename = user.avatar.split('/').pop();
            if (oldAvatarFilename && oldAvatarFilename !== 'default_avatar.jpeg') {
                const oldAvatarFilepath = path.join('./avatars', oldAvatarFilename);
                try {
                    await fs.promises.unlink(oldAvatarFilepath);
                } catch (err) {
                    console.error(`Failed to delete old avatar: ${err}`);
                }
            }
        }
        return updatedUser;
      }
    
    async setAvatarSelected(id: number) {
        const user = await this.prismaService.user.update({
            where: {id: id},
            data: { avatarSelected: true },
        });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }

    async setDefaultAvatar(id: number) {
        const defaultAvatarUrl = `http://${process.env.DOMAIN}:5000/avatars/default_avatar.jpeg`;
        const user = await this.prismaService.user.update({
          where: {id: id},
          data: { avatar: defaultAvatarUrl },
        });
      
        if (!user) {
          throw new NotFoundException('User not found');
        }
      }

    async getPublicUserInfo(id: number) {
        try {
          const publicInfo = await this.prismaService.user.findUnique({
            where: {
              id: id,
            },
            select: {
              createAt: true,
              gameLogin: true,
              elo: true,
              win: true,
              loose: true,
              avatar: true,
            }
            });
            if (!publicInfo) {
              throw new HttpException('User not found', 404);
            }
            return publicInfo;
        } catch (error) {
          console.error(error);
          throw new HttpException('Error retrieving user information', 400);
        }
    }
}
