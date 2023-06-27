import { Module } from '@nestjs/common';
import { IntraController } from './intra.controller';
import { IntraService } from './intra.service';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [HttpModule, JwtModule.register({})],
  controllers: [IntraController],
  providers: [IntraService]
})
export class IntraModule {}
