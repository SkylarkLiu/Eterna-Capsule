import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, IsEmail, Matches, IsUrl, IsInt, Min, Max } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({ description: '用户名', example: '永恒旅者', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: '用户名长度不能超过50位' })
  username?: string;

  @ApiPropertyOptional({ description: '邮箱', example: 'user@example.com' })
  @IsOptional()
  @IsEmail({}, { message: '邮箱格式不正确' })
  email?: string;

  @ApiPropertyOptional({ description: '手机号', example: '13800138000' })
  @IsOptional()
  @Matches(/^1[3-9]\d{9}$/, { message: '手机号格式不正确' })
  phone?: string;

  @ApiPropertyOptional({ description: '头像URL', example: 'https://example.com/avatar.jpg' })
  @IsOptional()
  @IsUrl({}, { message: '头像URL格式不正确' })
  avatarUrl?: string;

  @ApiPropertyOptional({ description: '座右铭', example: '守护你的数字记忆', maxLength: 200 })
  @IsOptional()
  @IsString()
  @MaxLength(200, { message: '座右铭长度不能超过200位' })
  motto?: string;

  @ApiPropertyOptional({ description: '心跳宽限天数', example: 7, minimum: 1, maximum: 30 })
  @IsOptional()
  @IsInt({ message: '心跳宽限天数必须是整数' })
  @Min(1, { message: '心跳宽限天数最小为1天' })
  @Max(30, { message: '心跳宽限天数最大为30天' })
  heartbeatGraceDays?: number;
}
