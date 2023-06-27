import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from 'src/prisma/prisma.service';
import { ApiToken, User42 } from './intra.interface';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class IntraService {
  constructor(
    private prismaService: PrismaService,
	private jwtService : JwtService,
    private configService: ConfigService,
  ) {}
	async getToken(code : string) {
		const data = {
			grant_type : 'authorization_code',
			client_id : this.configService.get('CLIENT_ID'),
			client_secret : this.configService.get('CLIENT_SECRET'),
			code : code,
			redirect_uri : this.configService.get('REDIRECT_URL'),	
		};
		const config = {
			headers: {
			  'Content-Type': 'application/x-www-form-urlencoded',
			},
		  };
		  return axios.post('https://api.intra.42.fr/oauth/token', data, config)
		  .then((response)=> {
			return (response.data);
		  })
		  .catch(error => {
			console.error(error);
		  });	  
	}

	async getProfile(accessToken : ApiToken) {
		const config = {
			headers : {
				'Authorization' : `Bearer ${accessToken.access_token}`
			}
		}
		return axios.get('https://api.intra.42.fr/v2/me', config)
		.then((response)=> {
			const User : User42 = {
				email: response.data.email,
				login: response.data.login,
				avatar: response.data.image.link,
				id: response.data.id,
				twoFactorAuthenticationSecret: '',
			}
			if (!User){
				throw new HttpException('Error', HttpStatus.FORBIDDEN);
			}
			return User;
		})
		.catch(error => {
			console.log('An error occured : ', error);
		});
	}

	async newProfile(profile : User42)
	{
		const userExists = await this.prismaService.user.findUnique({
			where : {
				username: profile.login
			}
		})
		if (!userExists)
			return (true);
		return (false);
	}

	async createUser(profile : User42)
	{
		const newUser = await this.prismaService.user.create({
			data: {
				username : profile.login,
				avatar : profile.avatar,		
			}
		})
		if (!newUser) {
			console.log('Error on createUser()');
			return (false);
		}
		return (true);
	}

	async getJwtToken(
		userId: number,
		username: string,
	  ):  Promise<string>  {
		const payload = {
		  sub: userId,
		  username: username,
		};
		const secret = this.configService.get('JWT_SECRET');
		const token = await this.jwtService.signAsync(payload, {
		  expiresIn: '1days',
		  secret: secret,
		});
		return token;
	  }
}
