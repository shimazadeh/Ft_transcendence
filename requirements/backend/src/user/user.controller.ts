import { Body, Controller, Delete, Get, HttpException, NotFoundException, Param, Post, Put, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { Request, Response } from 'express';
import { JwtGuard } from 'src/auth/guard';
import { UserService } from './user.service';
import { FileInterceptor } from '@nestjs/platform-express';

interface AuthenticatedUser {
	id: number;
	username: string;
	avatar: string;
}

interface AuthenticatedRequest extends Request {
	user: AuthenticatedUser;
}

interface MulterFile {
	originalname: string;
	encoding: string;
	mimetype: string;
	buffer: Buffer;
	size: number;
  }

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
	constructor(private userService: UserService) { }

	@Get('profile')
	async getProfile(@Req() req: AuthenticatedRequest) {
		if (!req.user) {
			throw new NotFoundException('User not found');
		}
		return (req.user);
	}

	@Get('leaderboard')
	async getAll(@Req() req: AuthenticatedRequest) {
		if (!req.user) {
			throw new NotFoundException('User not found');
		}
		return this.userService.getAllUsers();
	}

	@Get('logout')
	logout(@Res() res: Response) {
		res.clearCookie('Authorization');
		return res.status(200).send({ message: 'User logged out' });
	}

	@Put('update-gameLogin')
	async updategGameLogin(@Req() req: AuthenticatedRequest, @Body('gameLogin') gameLogin: string) {
		if (!req.user) {
			throw new NotFoundException('User not found');
		}
		const id = req.user.id;
		return this.userService.updateGameLogin(id, gameLogin);
	}

	@Get('blockUser')
	async getBlockUser(@Req() req: AuthenticatedRequest) {
		if (!req.user) {
			throw new NotFoundException('User not found');
		}
		return this.userService.getBlock(+req.user.id)
	}

	@Delete('deleteBlock/:blockId')
	async RmBlock(@Param('blockId') id: number) {
		await this.userService.deleteBlock(+id)
	}

	@Post('update-avatar')
	@UseInterceptors(FileInterceptor('avatar'))
	async updateAvatar(@Req() req: AuthenticatedRequest, @UploadedFile() avatar: MulterFile) {
	  return await this.userService.updateAvatar(req.user, avatar);
	}

	@Put('set-avatar-selected')
	async setAvatarSelected(@Req() req: AuthenticatedRequest) {
		if (!req.user) {
			throw new NotFoundException('User not found');
		}
		const id = req.user.id;
		return this.userService.setAvatarSelected(id);
	}

	@Put('set-default-avatar')
	async setDefaultAvatar(@Req() req: AuthenticatedRequest) {
	  if (!req.user) {
		throw new NotFoundException('User not found');
	  }
	  const id = req.user.id;
	  await this.userService.setDefaultAvatar(id);
	  return { message: 'Default avatar set successfully.' };
	}
	
	@Get('public-profile/:id')
	getPublicUserInfo(@Param('id') id: string) {
	  const parsedId = parseInt(id);
	  if (isNaN(parsedId)) {
		throw new HttpException('Invalid id', 400);
	  }
	  return this.userService.getPublicUserInfo(parsedId);
	}
}
