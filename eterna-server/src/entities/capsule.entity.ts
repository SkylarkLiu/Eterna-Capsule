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
import { CapsuleType, CapsuleStatus, TriggerType, ContactMethod } from './capsule.enums';

/**
 * Capsule Entity - Zero-Knowledge Architecture
 * 
 * SECURITY DECLARATION:
 * =====================
 * This entity implements a zero-knowledge storage architecture where:
 * 
 * 1. The server NEVER stores the user's plaintext password
 * 2. The server NEVER stores or has access to the derived decryption key
 * 3. All content encryption/decryption happens CLIENT-SIDE only
 * 4. The server acts as a "blind storage" - storing ciphertext without
 *    the ability to decrypt it
 * 
 * ENCRYPTION FLOW:
 * - Client derives a 256-bit key using PBKDF2 with a random salt
 * - Client encrypts content using AES-256-GCM
 * - Client sends: ciphertext, IV, salt to server
 * - Server stores these values WITHOUT any decryption capability
 * 
 * DECRYPTION FLOW:
 * - Client retrieves: ciphertext, IV, salt from server
 * - Client re-derives the key using the stored salt
 * - Client decrypts content locally
 * 
 * The server cannot read the content at any point in the process.
 */
@Entity('capsules')
export class Capsule {
  @ApiProperty({ description: '胶囊ID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: '标题', example: '给未来的自己' })
  @Column({ length: 200 })
  title: string;

  /**
   * Content field - stores encrypted data (Base64 encoded ciphertext)
   * 
   * When encrypted=true, this field contains:
   * - Base64 encoded AES-256-GCM ciphertext
   * - The server CANNOT decrypt this content
   * - Only the client with the correct password can decrypt
   * 
   * When encrypted=false, this field contains:
   * - Plain text content (for backward compatibility)
   */
  @ApiProperty({ description: '内容（加密时为Base64密文）' })
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

  @ApiPropertyOptional({ description: '接收人称呼' })
  @Column({ length: 100, nullable: true })
  recipientName: string;

  @ApiPropertyOptional({ description: '联系方式类型', enum: ContactMethod })
  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  contactMethod: ContactMethod;

  @ApiPropertyOptional({ description: '联系方式值' })
  @Column({ length: 200, nullable: true })
  contactValue: string;

  /**
   * Encryption status flag
   * When true, content is AES-256-GCM encrypted and server cannot read it
   */
  @ApiPropertyOptional({ description: '是否已加密（true时服务器无法读取内容）' })
  @Column({ default: false })
  encrypted: boolean;

  /**
   * Initialization Vector (IV) for AES-256-GCM decryption
   * 
   * SECURITY NOTE:
   * - This is NOT a secret - it's safe to store on the server
   * - IV is used together with the key (which server doesn't have) to decrypt
   * - Each encryption uses a unique random IV for security
   */
  @ApiPropertyOptional({ description: '加密初始化向量 (IV) - 非密钥，可安全存储' })
  @Column({ length: 100, nullable: true })
  iv: string;

  /**
   * Salt used for PBKDF2 key derivation
   * 
   * SECURITY NOTE:
   * - This is NOT a secret - it's safe to store on the server
   * - Salt prevents rainbow table attacks on the encryption
   * - Each capsule uses a unique random salt
   * - The server CANNOT derive the key from salt alone (needs password)
   */
  @ApiPropertyOptional({ description: '密钥派生盐值 (Salt) - 非密钥，可安全存储' })
  @Column({ length: 100, nullable: true })
  salt: string;

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
