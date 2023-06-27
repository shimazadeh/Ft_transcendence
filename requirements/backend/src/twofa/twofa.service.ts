import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode';

@Injectable()
export class TwofaService {

    constructor (
        private prismaService: PrismaService,
    ) {}

    async isTwoFAEnabled(userId: number) {
		const user = await this.prismaService.user.findUnique({
		  where: { id: userId },
		});
		if (!user)
			throw new ForbiddenException('isTwoFAEnabled : User not found');
		if (user.TwoFAenabled === true)
			return true;
		else
			return false;
	  }

	async enableTwoFA(userId : number) {
		await this.prismaService.user.update({
      	where: { id: userId },
		data : { TwoFAenabled : true }
		});
	  }

	async disableTwoFA(userId : number) {
		await this.prismaService.user.update({
      	where: { id: userId },
		data : { TwoFAenabled : false }
		});
	  }

	async isTwoFAVerified(userId: number) {
		const user = await this.prismaService.user.findUnique({
		  where: { id: userId },
		});
		if (!user)
			throw new ForbiddenException('isTwoFAEnabled : User not found');
		if (user.isTwoFAverified === true)
			return true;
		else
			return false;
	  }

	async setTwoFAVerified(userId : number) {
		await this.prismaService.user.update({
      	where: { id: userId },
		data : { isTwoFAverified : true }
		});
	  }

	async unsetTwoFAVerified(userId : number) {
		await this.prismaService.user.update({
      	where: { id: userId },
		data : { isTwoFAverified : false }
		});
	  }

	async setTwoFASecret(secret: string, userId: number) {
    	await this.prismaService.user.update({
      	where: { id: userId },
      	data: { TwoFASecret : secret },
		});
	}

	async generateTwoFactorAuthenticationSecret(login : string, userId : number) {
		const user = await this.prismaService.user.findUnique({
			where: { id: userId },
		});
		if (!user) {
			throw new Error('User not found');
		}
		if (user.TwoFAenabled && user.isTwoFAverified && user.TwoFASecret) {
			const otpauthUrl = authenticator.keyuri(login, 'ft_transcendence', user.TwoFASecret);
			return otpauthUrl;
		}
		const secret = authenticator.generateSecret();
		const otpauthUrl = authenticator.keyuri(login, 'ft_transcendence', secret);
		await this.setTwoFASecret(secret, userId);

		return otpauthUrl;
	  }

	async generateQrCodeDataURL(otpAuthUrl: string) {
		return toDataURL(otpAuthUrl);
	  }

	async verifyTwoFactorAuthenticationToken(userId: number, token: string) {
		const user = await this.prismaService.user.findUnique({
		  where: { id: userId },
		});
	
		const secret = user?.TwoFASecret;

		if (!secret){
			console.log("Error while finding 2FA secret");
			return null;
		}
		return authenticator.verify({
		token,
		secret,
		});
	  }

}
