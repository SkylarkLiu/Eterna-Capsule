import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from './user.entity';

/**
 * UserSentinel Entity - User's Sentinel Configuration
 * 
 * This entity stores the personalized configuration for each user's Sentinel.
 * Each user has one Sentinel with customizable name and personality.
 * 
 * PERSONALITY CONFIGURATION:
 * - customName: The name the user gives to their Sentinel
 * - personalityConfig: A long text document defining the Sentinel's personality
 *   This is injected as the System Role in LLM conversations
 * 
 * SECURITY:
 * - Only the Sentinel's owner can modify these settings
 * - JWT authentication is required for all modifications
 */
@Entity('user_sentinels')
export class UserSentinel {
  @ApiProperty({ description: '配置ID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: '所属用户ID' })
  @Index()
  @Column()
  userId: string;

  @ApiPropertyOptional({ description: '所属用户' })
  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  /**
   * Custom name for the Sentinel
   * Default: "Sentinel"
   * Users can personalize this to make their guardian feel more personal
   */
  @ApiProperty({ description: '守护兽昵称', example: '星辰' })
  @Column({ length: 50, default: 'Sentinel' })
  customName: string;

  /**
   * Personality configuration document
   * This is a long text that defines the Sentinel's:
   * - Speaking style
   * - Tone and mannerisms
   * - Knowledge domains
   * - Emotional expressions
   * 
   * This text is injected as the System Role in LLM conversations,
   * ensuring the AI responds according to the user's preferences.
   * 
   * Example:
   * "你是一个温和的向导，说话喜欢带星辰的隐喻。
   *  你是永恒的守护者，守护着主人的记忆。
   *  你说话时总是带着淡淡的忧伤，因为你知道时间会流逝。"
   */
  @ApiProperty({ description: '性格设定文档' })
  @Column({ type: 'text', default: '' })
  personalityConfig: string;

  /**
   * Energy level of the Sentinel (0-100)
   * Increases when user feeds/interacts with the Sentinel
   * Decreases over time if user is inactive
   */
  @ApiPropertyOptional({ description: '能量值 (0-100)' })
  @Column({ type: 'integer', default: 100 })
  energy: number;

  /**
   * Last time the Sentinel was fed
   */
  @ApiPropertyOptional({ description: '最后喂食时间' })
  @Column({ type: 'datetime', nullable: true })
  lastFedAt: Date;

  /**
   * Total number of conversations with the Sentinel
   */
  @ApiPropertyOptional({ description: '对话总次数' })
  @Column({ type: 'integer', default: 0 })
  totalConversations: number;

  /**
   * Selected personality preset (if any)
   * Stores the name of the preset for UI display
   */
  @ApiPropertyOptional({ description: '选择的性格预设' })
  @Column({ length: 50, nullable: true })
  selectedPreset: string;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;
}
