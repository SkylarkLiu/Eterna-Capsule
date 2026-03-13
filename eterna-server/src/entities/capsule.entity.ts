import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from './user.entity';
import { CapsuleType, CapsuleStatus, TriggerType } from './capsule.enums';

@Entity('capsules')
export class Capsule {
  @ApiProperty({ description: '胶囊ID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: '标题', example: '给未来的自己' })
  @Column({ length: 200 })
  title: string;

  @ApiProperty({ description: '内容（支持长文本）' })
  @Column({ type: 'text' })
  content: string;

  @ApiPropertyOptional({ description: '媒体链接列表', type: [String] })
  @Column({ type: 'simple-json', nullable: true })
  mediaUrls: string[];

  @ApiProperty({ description: '类型', enum: CapsuleType, example: CapsuleType.TEXT })
  @Column({
    type: 'varchar',
    length: 20,
    default: CapsuleType.TEXT,
  })
  type: CapsuleType;

  @ApiProperty({ description: '状态', enum: CapsuleStatus, example: CapsuleStatus.DRAFT })
  @Index()
  @Column({
    type: 'varchar',
    length: 20,
    default: CapsuleStatus.DRAFT,
  })
  status: CapsuleStatus;

  @ApiProperty({ description: '触发类型', enum: TriggerType })
  @Column({
    type: 'varchar',
    length: 20,
  })
  triggerType: TriggerType;

  @ApiPropertyOptional({ description: '目标触发日期（TIME类型使用）' })
  @Index()
  @Column({ type: 'datetime', nullable: true })
  triggerDate: Date;

  @ApiPropertyOptional({ description: '宽限天数（INACTIVITY类型使用）' })
  @Column({ type: 'integer', nullable: true })
  graceDays: number;

  @ApiPropertyOptional({ description: '最后心跳时间' })
  @Column({ type: 'datetime', nullable: true })
  lastHeartbeat: Date;

  @ApiPropertyOptional({ description: '实际发送时间' })
  @Column({ type: 'datetime', nullable: true })
  sentAt: Date;

  @ApiProperty({ description: '所属用户ID' })
  @Index()
  @Column()
  userId: string;

  @ApiPropertyOptional({ description: '所属用户' })
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;
}
