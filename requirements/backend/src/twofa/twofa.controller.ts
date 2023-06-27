import { Body, Controller, ForbiddenException, Get, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Request } from 'express';
import { TwofaService } from './twofa.service';
import { JwtGuard } from 'src/auth/guard';

@UseGuards(JwtGuard)
@Controller('twofa')
export class TwofaController {

    constructor (private twofaService: TwofaService,
                 private prismaService: PrismaService) {}

    async getUserFromSession(req: Request) {
        const sessionId = req.cookies.Authorization;
        const user = await this.prismaService.user.findFirst({
            where: {
                access_token: sessionId
            },
        });
        if (!user) {
            throw new UnauthorizedException('Invalid session');
        }
        return user;
    }

	@Get('generate-2fa-secret')
	async generateTwoFASecret(@Req() req : Request) {
        const user = await this.getUserFromSession(req);
        const otpauthUrl = await this.twofaService.generateTwoFactorAuthenticationSecret(user.username, user.id);
        const qrcode = await this.twofaService.generateQrCodeDataURL(otpauthUrl)
        
        return qrcode;
	}

	@Post('verify-2fa-code')
	async verifyTwoFACode(@Req() req : Request, @Body('code') code : string) {
        const user = await this.getUserFromSession(req);
        const isTwoFAValid = await this.twofaService.verifyTwoFactorAuthenticationToken(user.id, code);
        if (isTwoFAValid) {
            return true;
        } else {
            throw new ForbiddenException('Invalid 2FA code');
        }
	}

	@Post('enable-2fa')
	async enableTwoFA(@Req() req : Request) {
        const user = await this.getUserFromSession(req);
		await this.twofaService.enableTwoFA(user.id);
		return { message: "2FA enabled successfully" };
	}

	@Post('confirm-enable-2fa')
	async confirmEnableTwoFA(@Req() req : Request, @Body('code') code : string) {
	  const user = await this.getUserFromSession(req);
	  const isTwoFAValid = await this.twofaService.verifyTwoFactorAuthenticationToken(user.id, code);
	  if (isTwoFAValid) {
		await this.twofaService.enableTwoFA(user.id);
		return { message: "2FA enabled successfully" };
	  } else {
		throw new ForbiddenException('Invalid 2FA code');
	  }
	}

	@Post('disable-2fa')
	async disableTwoFA(@Req() req : Request) {
        const user = await this.getUserFromSession(req);
		await this.twofaService.disableTwoFA(user.id);
		return { message: "2FA disabled successfully" };
	}

	@Get('check-2fa')
	async checkTwoFA(@Req() req : Request) {
        const user = await this.getUserFromSession(req);
		return await this.twofaService.isTwoFAEnabled(user.id);
	}

	@Get('check-2fa-verified')
	async isTwoFAVerified(@Req() req : Request) {
        const user = await this.getUserFromSession(req);
		return await this.twofaService.isTwoFAVerified(user.id);
	}

	@Post('set-2fa-verified')
	async enableTwoFAVerified(@Req() req : Request) {
        const user = await this.getUserFromSession(req);
		await this.twofaService.setTwoFAVerified(user.id);
		return { message: "2FAVerified is set to true" };
	}

	@Post('unset-2fa-verified')
	async disableTwoFAVerified(@Req() req : Request) {
        const user = await this.getUserFromSession(req);
		await this.twofaService.unsetTwoFAVerified(user.id);
		return { message: "2FAVerified is set to false" };
	}  
}
