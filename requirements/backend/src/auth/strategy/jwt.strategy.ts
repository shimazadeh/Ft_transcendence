import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService, private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get('JWT_SECRET'),
    });
  }

  // Validate the JWT payload and return the user without the password hash.
  async validate(payload: { sub: number; username: string }) {
    const user = await this.prisma.user.findUnique({
      where: { username: payload.username },
    });
    if (!user) {
      throw new UnauthorizedException();
    }
    const { hash, ...userWithoutHash } = user;
    return userWithoutHash; // retourne le user sans son hash
  }
}