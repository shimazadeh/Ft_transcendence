import { Module } from '@nestjs/common';
import { TwofaController } from './twofa.controller';
import { TwofaService } from './twofa.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
	imports: [JwtModule],
  controllers: [TwofaController],
  providers: [TwofaService]
})
export class TwofaModule {}
