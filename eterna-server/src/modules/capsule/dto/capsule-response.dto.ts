import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CapsuleType, CapsuleStatus, TriggerType } from '@/entities/capsule.enums';

export class CapsuleResponseDto {
  @ApiProperty({ description: '胶囊ID' })
  id: string;

  @ApiProperty({ description: '标题' })
  title: string;

  @ApiProperty({ description: '内容' })
  content: string;

  @ApiPropertyOptional({ description: '媒体链接列表', type: [String] })
  mediaUrls: string[];

  @ApiProperty({ description: '类型', enum: CapsuleType })
  type: CapsuleType;

  @ApiProperty({ description: '状态', enum: CapsuleStatus })
  status: CapsuleStatus;

  @ApiProperty({ description: '触发类型', enum: TriggerType })
  triggerType: TriggerType;

  @ApiPropertyOptional({ description: '目标触发日期' })
  triggerDate: Date;

  @ApiPropertyOptional({ description: '宽限天数' })
  graceDays: number;

  @ApiPropertyOptional({ description: '最后心跳时间' })
  lastHeartbeat: Date;

  @ApiPropertyOptional({ description: '实际发送时间' })
  sentAt: Date;

  @ApiProperty({ description: '所属用户ID' })
  userId: string;

  @ApiProperty({ description: '创建时间' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  updatedAt: Date;
}

export class TriggerCheckResultDto {
  @ApiProperty({ description: '待触发的胶囊列表' })
  capsules: CapsuleResponseDto[];

  @ApiProperty({ description: '总数' })
  count: number;
}
