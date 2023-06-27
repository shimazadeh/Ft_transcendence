import { Controller, Get, Query, Res, HttpException, HttpStatus, Req } from '@nestjs/common';
import { IntraService } from './intra.service';
import { Response, Request } from 'express';
import { ApiToken } from './intra.interface';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('intra')
export class IntraController {
	constructor (private intraService: IntraService,
				 private configService: ConfigService,
				 private prismaService: PrismaService) {}

	@Get('callback')
	async getCode(@Query('code') code : string,
				  @Query('state') state : string,
				  @Res() res : Response) {
			if (state !== this.configService.get('STATE') || !code) {
				throw new HttpException('Invalid code or state', HttpStatus.FORBIDDEN);
			}
			const AccessToken : ApiToken = await this.intraService.getToken(code);
			if (!AccessToken || !AccessToken.access_token) {
				throw new HttpException('Cannot get access token from 42 api', HttpStatus.FORBIDDEN);
			}	
			const IntraProfile = await this.intraService.getProfile(AccessToken);
			if (!IntraProfile) {
				throw new HttpException('Cannot get Profile from getProfile()', HttpStatus.FORBIDDEN);
			}
			const NewUser : boolean = await this.intraService.newProfile(IntraProfile);
			if  (NewUser == true) {
				if (await this.intraService.createUser(IntraProfile) == false)
					throw new HttpException('Cannot create new user from createUser()', HttpStatus.FORBIDDEN);
			}

			const User = await this.prismaService.user.findUnique({
				where : {
					username : IntraProfile.login,
				}
			})
			if (!User)
				throw new HttpException('Cannot create new user from createUser()', HttpStatus.FORBIDDEN);
			const JwtToken = await this.intraService.getJwtToken(User?.id, User?.username)
			await this.prismaService.user.update({
				where : {
					username : User.username,
				},
				data : {
					access_token : JwtToken,
				}
			})
			res.cookie('Authorization', JwtToken, {
				httpOnly: true
			});
			res.redirect(`http://${process.env.DOMAIN}:${process.env.CLIENT_PORT}/home`);
	}

	@Get('verify-session')
	async verifySession(@Req() req : Request) {
	  const sessionId = req.cookies.Authorization
	  const session = await this.prismaService.user.findFirst({
		where: {
			access_token: sessionId
		},
	  });
	  if (session) {
		return true;
	  } else {
		throw new HttpException('Invalid session', HttpStatus.UNAUTHORIZED);
	  }
	}
}