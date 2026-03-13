import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsDateString,
  IsInt,
  Min,
  MaxLength,
} from 'class-validator';
import { CreateCapsuleDto } from './create-capsule.dto';
import { CapsuleType, TriggerType, ContactMethod } from '@/entities/capsule.enums';

export class UpdateCapsuleDto extends PartialType(CreateCapsuleDto) {
  @ApiPropertyOptional({ description: '标题' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({ description: '内容' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ description: '媒体链接列表', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mediaUrls?: string[];

  @ApiPropertyOptional({ description: '类型', enum: CapsuleType })
  @IsOptional()
  @IsEnum(CapsuleType)
  type?: CapsuleType;

  @ApiPropertyOptional({ description: '触发类型', enum: TriggerType })
  @IsOptional()
  @IsEnum(TriggerType)
  triggerType?: TriggerType;

  @ApiPropertyOptional({ description: '目标触发日期' })
  @IsOptional()
  @IsDateString()
  triggerDate?: string;

  @ApiPropertyOptional({ description: '宽限天数' })
  @IsOptional()
  @IsInt()
  @Min(1)
  graceDays?: number;

  @ApiPropertyOptional({ description: '接收人称呼' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  recipientName?: string;

  @ApiPropertyOptional({ description: '联系方式类型', enum: ContactMethod })
  @IsOptional()
  @IsEnum(ContactMethod)
  contactMethod?: ContactMethod;

  @ApiPropertyOptional({ description: '联系方式值' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  contactValue?: string;
}
