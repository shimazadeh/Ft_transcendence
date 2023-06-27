import { Body, Controller, Get, NotFoundException, Post, Req, UseGuards } from '@nestjs/common';
import { HistoryService } from './history.service';
import { HistoryDto, HistoryID } from './dto';
import { JwtGuard } from 'src/auth/guard';

interface AuthenticatedUser {
	id: number;
	username: string;
}

interface AuthenticatedRequest extends Request {
	user: AuthenticatedUser;
}

@UseGuards(JwtGuard)
@Controller('history')
export class HistoryController {
    constructor(private historyService: HistoryService) {}

	@Get('display')
	async getProfile(@Req() req: AuthenticatedRequest) {
		if (!req.user) {
			throw new NotFoundException('User not found');
		}
		// return (req.user);
        return this.historyService.getUserHistory(req.user.id);
	}

    // @Post('')
    // async getHistory(@Body() dto:HistoryID) {
    //     return this.historyService.getUserHistory(dto.id);
    // }

    @Post('add')
    async addHistory(@Body() dto:HistoryDto) {
        return this.historyService.newEntry(dto);
    }

}
