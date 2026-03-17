import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { SessionAuthGuard } from '../common/guards/session-auth.guard';

@Module({
  imports: [UserModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    SessionAuthGuard,
    {
      provide: APP_GUARD,
      useExisting: SessionAuthGuard,
    },
  ],
})
export class AuthModule {}
