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
 * UserMemory Entity - Long-term Memory Storage
 * 
 * This entity stores compressed/summarized memories extracted from daily conversations.
 * The "Condensation" process runs nightly to extract key memories from chat logs.
 * 
 * MEMORY COMPRESSION FLOW:
 * 1. User chats with Sentinel throughout the day
 * 2. At midnight, a cron job processes all conversations
 * 3. AI extracts 3 most precious memory points
 * 4. Summaries are stored here with tags and importance scores
 * 
 * This allows the Sentinel to "remember" important things from weeks or months ago
 * without storing every single conversation (which would be slow and expensive).
 */
@Entity('user_memories')
export class UserMemory {
  @ApiProperty({ description: '记忆ID' })
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
   * Compressed memory summary
   * Example: "主人今天提到了他的老朋友小明，他们已经十年没见面了"
   */
  @ApiProperty({ description: '记忆摘要' })
  @Column({ type: 'text' })
  summary: string;

  /**
   * Tags extracted from the memory
   * Example: ["友情", "小明", "怀念"]
   */
  @ApiPropertyOptional({ description: '记忆标签', type: [String] })
  @Column({ type: 'simple-json', nullable: true })
  tags: string[];

  /**
   * Importance score (0-100)
   * Higher score = more important memory
   * Used to prioritize which memories to recall
   */
  @ApiPropertyOptional({ description: '重要性评分 (0-100)' })
  @Column({ type: 'integer', default: 50 })
  importanceScore: number;

  /**
   * Original conversation date
   * Used for time-based memory retrieval
   */
  @ApiPropertyOptional({ description: '原始对话日期' })
  @Column({ type: 'date', nullable: true })
  conversationDate: Date;

  /**
   * Key entities mentioned in the memory
   * Example: ["小明", "北京", "十年前"]
   */
  @ApiPropertyOptional({ description: '关键实体', type: [String] })
  @Column({ type: 'simple-json', nullable: true })
  entities: string[];

  /**
   * Emotion detected in the memory
   * Example: "怀念", "忧伤", "喜悦"
   */
  @ApiPropertyOptional({ description: '情感类型' })
  @Column({ length: 50, nullable: true })
  emotion: string;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;
}
