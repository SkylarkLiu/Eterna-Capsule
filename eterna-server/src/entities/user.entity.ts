import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('users')
export class User {
  @ApiProperty({ description: '用户ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiPropertyOptional({ description: '邮箱', example: 'user@example.com' })
  @Index({ unique: true })
  @Column({ length: 100, nullable: true })
  email: string;

  @ApiPropertyOptional({ description: '手机号', example: '13800138000' })
  @Index({ unique: true })
  @Column({ length: 20, nullable: true })
  phone: string;

  @Exclude()
  @Column({ length: 255, select: false })
  password: string;

  @ApiProperty({ description: '用户名', example: '永恒旅者' })
  @Column({ length: 50 })
  username: string;

  @ApiPropertyOptional({ description: '头像URL', example: 'https://example.com/avatar.jpg' })
  @Column({ length: 500, nullable: true })
  avatarUrl: string;

  @ApiPropertyOptional({ description: '座右铭', example: '守护你的数字记忆' })
  @Column({ length: 200, nullable: true })
  motto: string;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;

  @ApiPropertyOptional({ description: '最后登录时间' })
  @Column({ type: 'datetime', nullable: true })
  lastLoginAt: Date;
}
