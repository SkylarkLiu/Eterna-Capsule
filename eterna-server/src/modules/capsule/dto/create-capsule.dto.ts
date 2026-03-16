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
  MaxLength,
} from 'class-validator';
import { CapsuleType, TriggerType, ContactMethod } from '@/entities/capsule.enums';

/**
 * CreateCapsuleDto - Zero-Knowledge Capsule Creation
 * 
 * SECURITY ARCHITECTURE:
 * ======================
 * This DTO supports zero-knowledge encryption where:
 * 
 * 1. The client encrypts content BEFORE sending to server
 * 2. The server stores the encrypted content WITHOUT decryption capability
 * 3. The 'content' field may contain:
 *    - Plain text (when encrypted=false, for backward compatibility)
 *    - Base64-encoded AES-256-GCM ciphertext (when encrypted=true)
 * 
 * ENCRYPTION FIELDS:
 * - encrypted: Boolean flag indicating if content is encrypted
 * - iv: Initialization Vector for AES-GCM (Base64 encoded)
 * - salt: PBKDF2 salt for key derivation (Base64 encoded)
 * 
 * IMPORTANT:
 * - IV and Salt are NOT secrets - they can be safely stored on the server
 * - The decryption key is NEVER sent to the server
 * - The server CANNOT decrypt the content at any point
 */
export class CreateCapsuleDto {
  @ApiProperty({ description: '标题', example: '给未来的自己' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  /**
   * Content field - supports both plain text and encrypted data
   * 
   * When encrypted=true:
   * - Contains Base64-encoded AES-256-GCM ciphertext
   * - Server stores it WITHOUT the ability to decrypt
   * 
   * When encrypted=false:
   * - Contains plain text content (backward compatibility)
   */
  @ApiProperty({ description: '内容（加密时为Base64密文）' })
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
  @IsOptional()
  @IsDateString()
  triggerDate?: string;

  @ApiPropertyOptional({ description: '宽限天数（INACTIVITY类型必填）' })
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
   * 
   * When true:
   * - Content is AES-256-GCM encrypted
   * - Server CANNOT read the content
   * - IV and Salt fields must be provided
   */
  @ApiPropertyOptional({ description: '是否已加密（true时服务器无法读取内容）' })
  @IsOptional()
  encrypted?: boolean;

  /**
   * Initialization Vector (IV) for AES-256-GCM
   * 
   * SECURITY NOTE:
   * - This is a PUBLIC value, NOT a secret
   * - Safe to store on the server
   * - Required for decryption but useless without the key
   * - Base64 encoded, typically 12 bytes (96 bits)
   */
  @ApiPropertyOptional({ description: '加密初始化向量 (IV) - 非密钥，可安全存储' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  iv?: string;

  /**
   * Salt for PBKDF2 key derivation
   * 
   * SECURITY NOTE:
   * - This is a PUBLIC value, NOT a secret
   * - Safe to store on the server
   * - Used to derive the encryption key from password
   * - The server CANNOT derive the key from salt alone
   * - Base64 encoded, typically 16 bytes (128 bits)
   */
  @ApiPropertyOptional({ description: '密钥派生盐值 (Salt) - 非密钥，可安全存储' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  salt?: string;
}
