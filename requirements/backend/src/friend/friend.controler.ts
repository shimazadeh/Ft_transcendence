import { JwtGuard } from 'src/auth/guard';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { FriendService } from "./friend.service";
import { Controller, Get, UseGuards, Req, Post, Param, Put, Delete } from "@nestjs/common";

interface reqUser {
    id: number
}

interface newReq extends Request {
    user: reqUser
}

@UseGuards(JwtGuard)
@Controller('friend')
export class FriendController {
    constructor(private friendService: FriendService) { }

    @Get('')
    async getFriendsByUserId(@Req() req: newReq) {
        const friends = await this.friendService.getFriendsByUserId(+req.user.id);
        return friends;
    }

    @Get(':friendId')
    async getFriend(@Req() req: newReq, @Param('friendId') friendId: number) {
        return await this.friendService.getUserById(+friendId)
    }


    @Post('send/:friendId')
    async sendFriendReq(@Req() req: newReq, @Param('friendId') friendId: number) {
        const request = await this.friendService.createFriendRequest(+req.user.id, +friendId)
        return { request }
    }

    @Put('accept/:friendId')
    async acceptFriendReq(@Req() req: newReq, @Param('friendId') friendId: number) {
        await this.friendService.acceptFriendRequest(+req.user.id, +friendId)
    }

    @Delete('refuse/:friendId')
    async refuseFriendReq(@Req() req: newReq, @Param('friendId') friendId: number) {
        await this.friendService.refuseFriendRequest(+req.user.id, +friendId)
    }

    @Delete('delete/:friendId')
    async deleteFriend(@Req() req: newReq, @Param('friendId') friendId: number) {
        await this.friendService.deleteFriendById(+req.user.id, +friendId)
    }

    @Get('add/:name')
    async getFriendByName(@Req() req: newReq, @Param('name') name: string) {
        return await this.friendService.userByName(+req.user.id, name)
    }

    @Get('request')
    async getFriendReq(@Req() req: newReq) {
        return this.friendService.getFriendReq(+req.user.id)
    }
}