import { Body, Controller, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { Response } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService,
			  private prismaService: PrismaService) {}

  @Post('signup')
  	async signup(@Body() dto: AuthDto, @Res() res : Response) {
		const newUser = await this.prismaService.user.create({
			data: {
				username : dto.username,
			}
		})
		if (!newUser) {
			console.log('Error on createUser()');
			return (false);
		}
		const Token =  await this.authService.signToken(newUser.id, newUser.username);
		res.cookie("Authorization", Token)
		return res.status(201).send(Token);
	}

  @Post('signin')
  signin(@Body() dto: AuthDto, @Res() res : Response) {

	const JwtToken = this.authService.signup(dto);
	res.cookie('Authorization', JwtToken, {
		httpOnly: true
	});
  }
}
