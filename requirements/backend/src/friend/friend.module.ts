import { Module } from '@nestjs/common';
import { FriendController } from './friend.controler'
import { FriendService } from './friend.service';

@Module({
    controllers: [FriendController],
    providers: [FriendService]
})

export class FriendModule { }