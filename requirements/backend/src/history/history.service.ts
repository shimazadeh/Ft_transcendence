import { ForbiddenException, Injectable } from '@nestjs/common';
import { HistoryDto, HistoryID } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class HistoryService {
    constructor(private prisma: PrismaService) {}

    async newEntry(dto: HistoryDto) {
        const id: number = parseInt(dto.userID);
        const user = await this.prisma.user.findUnique({where : {id : id}})
        if (!user)
            throw new ForbiddenException('User does not exist');

        const entry = await this.prisma.history.create({
            data : {
                user: {connect: {id : id} },
                result: dto.result,
                mode: dto.mode,
                pointsWon: parseInt(dto.pointsWon),
                pointsLost: parseInt(dto.pointsLost),
                elo: parseInt(dto.elo),
            }
        })
        return entry;
    }

    async getUserHistory(userID: number) {
        const user = await this.prisma.user.findUnique({where : {id : userID}, })
        if (!user)
            throw new ForbiddenException('User does not exist');
        const history = await this.prisma.history.findMany({
            where: { userId : userID },
        })
        return history;
    }
}
