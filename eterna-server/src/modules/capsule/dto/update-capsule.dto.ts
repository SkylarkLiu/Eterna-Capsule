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

/**
 * UpdateCapsuleDto - Zero-Knowledge Capsule Update
 * 
 * SECURITY ARCHITECTURE:
 * Same as CreateCapsuleDto - supports zero-knowledge encryption
 * All encryption fields can be updated along with the encrypted content
 */
export class UpdateCapsuleDto extends PartialType(CreateCapsuleDto) {
  @ApiPropertyOptional({ description: '标题' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  /**
   * Content field - supports both plain text and encrypted data
   * When updating encrypted content, also update iv and salt
   */
  @ApiPropertyOptional({ description: '内容（加密时为Base64密文）' })
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

  /**
   * Encryption status flag
   */
  @ApiPropertyOptional({ description: '是否已加密' })
  @IsOptional()
  encrypted?: boolean;

  /**
   * Initialization Vector (IV) for AES-256-GCM
   * PUBLIC value - safe to store on server
   */
  @ApiPropertyOptional({ description: '加密初始化向量 (IV)' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  iv?: string;

  /**
   * Salt for PBKDF2 key derivation
   * PUBLIC value - safe to store on server
   */
  @ApiPropertyOptional({ description: '密钥派生盐值 (Salt)' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  salt?: string;
}
