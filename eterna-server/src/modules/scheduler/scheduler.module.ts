import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SchedulerService } from './scheduler.service';
import { ChatModule } from '@/modules/chat/chat.module';
import { UserModule } from '@/modules/user/user.module';
import { CapsuleModule } from '@/modules/capsule/capsule.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Capsule } from '@/entities/capsule.entity';
import { User } from '@/entities/user.entity';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([Capsule, User]),
    UserModule,
    CapsuleModule,
    ChatModule,
  ],
  providers: [SchedulerService],
  exports: [SchedulerService],
})
export class SchedulerModule {}
