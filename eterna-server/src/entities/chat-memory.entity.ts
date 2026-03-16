import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from './user.entity';

/**
 * ChatMemory Entity - Short-term Conversation Storage
 * 
 * This entity stores recent conversations between the user and Sentinel.
 * 
 * STORAGE POLICY:
 * - Only the last 10 rounds of conversation are kept per user
 * - Older conversations are processed and compressed into UserMemory
 * - This keeps the database fast and AI context manageable
 * 
 * MEMORY LIFECYCLE:
 * 1. User sends a message -> Stored here as 'user' role
 * 2. Sentinel responds -> Stored here as 'assistant' role
 * 3. When 10 rounds are reached -> Trigger compression
 * 4. Compression extracts key points -> Saves to UserMemory
 * 5. Old ChatMemory entries are deleted
 */
@Entity('chat_memories')
export class ChatMemory {
  @ApiProperty({ description: '对话ID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: '所属用户ID' })
  @Index()
  @Column()
  userId: string;

  @ApiPropertyOptional({ description: '所属用户' })
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  /**
   * Message role: 'user' or 'assistant' (Sentinel)
   */
  @ApiProperty({ description: '消息角色', enum: ['user', 'assistant'] })
  @Column({ length: 20 })
  role: 'user' | 'assistant';

  /**
   * The actual message content
   */
  @ApiProperty({ description: '消息内容' })
  @Column({ type: 'text' })
  content: string;

  /**
   * Conversation round number
   * Incremented for each user message
   */
  @ApiPropertyOptional({ description: '对话轮次' })
  @Column({ type: 'integer', default: 1 })
  round: number;

  /**
   * Emotion detected in the message
   * Used for context-aware responses
   */
  @ApiPropertyOptional({ description: '检测到的情感' })
  @Column({ length: 50, nullable: true })
  emotion: string;

  /**
   * Whether this message has been processed for memory compression
   */
  @ApiPropertyOptional({ description: '是否已压缩处理' })
  @Column({ default: false })
  processed: boolean;

  /**
   * Session ID for grouping conversations
   * A new session starts when user logs in after a long absence
   */
  @ApiPropertyOptional({ description: '会话ID' })
  @Column({ length: 100, nullable: true })
  sessionId: string;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;
}
