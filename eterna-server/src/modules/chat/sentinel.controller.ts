import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { User } from '@/entities/user.entity';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@ApiTags('Sentinel AI')
@ApiBearerAuth()
@Controller('sentinel')
export class SentinelController {
  constructor(private readonly chatService: ChatService) {}

  @Post('chat')
  @ApiOperation({ summary: '与守护兽对话' })
  @ApiResponse({ status: 200, description: '对话成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  async chat(
    @CurrentUser() user: User,
    @Body('message') message: string,
  ): Promise<{ response: string }> {
    const response = await this.chatService.chat(user.id, message);
    return { response };
  }

  @Post('feed')
  @ApiOperation({ summary: '喂食守护兽' })
  @ApiResponse({ status: 200, description: '喂食成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  async feed(@CurrentUser() user: User): Promise<{ message: string; energyIncrease: number }> {
    return this.chatService.feed(user.id);
  }

  @Get('history')
  @ApiOperation({ summary: '获取对话历史' })
  @ApiQuery({ name: 'limit', required: false, description: '返回条数限制' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  async getHistory(
    @CurrentUser() user: User,
    @Query('limit') limit?: number,
  ): Promise<{ history: Array<{ role: string; content: string; createdAt: Date }> }> {
    const history = await this.chatService.getChatHistory(user.id, limit || 10);
    return {
      history: history.map(h => ({
        role: h.role,
        content: h.content,
        createdAt: h.createdAt,
      })),
    };
  }

  @Get('memories')
  @ApiOperation({ summary: '获取长期记忆' })
  @ApiQuery({ name: 'limit', required: false, description: '返回条数限制' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  async getMemories(
    @CurrentUser() user: User,
    @Query('limit') limit?: number,
  ): Promise<{ memories: Array<{ summary: string; tags: string[]; importanceScore: number; createdAt: Date }> }> {
    const memories = await this.chatService.getMemories(user.id, limit || 10);
    return {
      memories: memories.map(m => ({
        summary: m.summary,
        tags: m.tags || [],
        importanceScore: m.importanceScore,
        createdAt: m.createdAt,
      })),
    };
  }
}
