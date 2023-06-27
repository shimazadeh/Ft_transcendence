import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto/auth.dto';
import * as argon from 'argon2';
import { Prisma } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) { }

  async signup(dto: AuthDto) {
    // generer le hash
    const hash = await argon.hash(dto.password);

    // tenter de save l'user
    try {
      const user = await this.prisma.user.create({
        data: {
          username: dto.username,
          hash,
        },
      });

      // Retourne un token avec l'id et l'username
      return this.signToken(user.id, user.username);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Username already taken');
        }
      } else {
        throw error;
      }
    }
  }

  async signin(dto: AuthDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        username: dto.username,
      },
    });

    if (!user || !user.hash) // Si user n'existe pas ou si il n'y a pas de hash (profil 42)
		throw new ForbiddenException('Incorrect username or password');

    // compare password
    const passwordMatch = await argon.verify(user.hash, dto.password);
    if (!passwordMatch)
      throw new ForbiddenException('Incorrect username or password');

    return this.signToken(user.id, user.username);
  }

  async signToken(
    userId: number,
    username: string,
  ): Promise<string> {
    const payload = {
      sub: userId,
      username: username,
    };

    const secret = this.config.get('JWT_SECRET'); // On recupere la variable d'env

    const token = await this.jwt.signAsync(payload, {
      expiresIn: '1days', // Temps avant que le token expire
      secret: secret,
    });

    return token;
  }
}
