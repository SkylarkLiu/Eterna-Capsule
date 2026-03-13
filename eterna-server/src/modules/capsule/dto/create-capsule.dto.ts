import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsArray,
  IsDateString,
  IsInt,
  Min,
  ValidateIf,
} from 'class-validator';
import { CapsuleType, TriggerType } from '@/entities/capsule.enums';

export class CreateCapsuleDto {
  @ApiProperty({ description: '标题', example: '给未来的自己' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: '内容' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({ description: '媒体链接列表', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mediaUrls?: string[];

  @ApiProperty({ description: '类型', enum: CapsuleType })
  @IsEnum(CapsuleType)
  type: CapsuleType;

  @ApiProperty({ description: '触发类型', enum: TriggerType })
  @IsEnum(TriggerType)
  triggerType: TriggerType;

  @ApiPropertyOptional({ description: '目标触发日期（TIME类型必填）' })
  @ValidateIf((o) => o.triggerType === TriggerType.TIME)
  @IsDateString()
  triggerDate?: string;

  @ApiPropertyOptional({ description: '宽限天数（INACTIVITY类型必填）' })
  @ValidateIf((o) => o.triggerType === TriggerType.INACTIVITY)
  @IsInt()
  @Min(1)
  graceDays?: number;
}
