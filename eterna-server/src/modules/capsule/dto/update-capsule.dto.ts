import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateCapsuleDto } from './create-capsule.dto';

export class UpdateCapsuleDto extends PartialType(CreateCapsuleDto) {
  @ApiPropertyOptional({ description: '标题' })
  title?: string;

  @ApiPropertyOptional({ description: '内容' })
  content?: string;

  @ApiPropertyOptional({ description: '媒体链接列表', type: [String] })
  mediaUrls?: string[];

  @ApiPropertyOptional({ description: '类型' })
  type?: string;

  @ApiPropertyOptional({ description: '触发类型' })
  triggerType?: string;

  @ApiPropertyOptional({ description: '目标触发日期' })
  triggerDate?: string;

  @ApiPropertyOptional({ description: '宽限天数' })
  graceDays?: number;
}
