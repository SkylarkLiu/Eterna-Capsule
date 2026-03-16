import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserMemory } from '@/entities/user-memory.entity';
import { ChatMemory } from '@/entities/chat-memory.entity';
import { User } from '@/entities/user.entity';
import { Capsule } from '@/entities/capsule.entity';
import { ChatService } from './chat.service';
import { SentinelController } from './sentinel.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserMemory, ChatMemory, User, Capsule]),
  ],
  controllers: [SentinelController],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {}
