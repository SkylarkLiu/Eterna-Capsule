import { Controller, Post, Body, Get, Patch, Query } from '@nestjs/common';
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
  ): Promise<{ 
    userMessage: string; 
    sentinelResponse: string; 
    timestamp: number;
  }> {
    const result = await this.chatService.chat(user.id, message);
    return {
      userMessage: message,
      sentinelResponse: result.response,
      timestamp: Date.now(),
    };
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

  @Get('messages')
  @ApiOperation({ summary: '分页获取对话消息（按时间升序）' })
  @ApiQuery({ name: 'page', required: false, description: '页码', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: '每页条数', example: 20 })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  async getMessages(
    @CurrentUser() user: User,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<{ 
    messages: Array<{ id: string; role: string; content: string; createdAt: Date }>;
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  }> {
    const pageNum = page || 1;
    const limitNum = limit || 20;
    const result = await this.chatService.getMessagesPaginated(user.id, pageNum, limitNum);
    return {
      messages: result.messages.map(m => ({
        id: m.id,
        role: m.role,
        content: m.content,
        createdAt: m.createdAt,
      })),
      total: result.total,
      page: pageNum,
      limit: limitNum,
      hasMore: result.hasMore,
    };
  }

  @Get('search')
  @ApiOperation({ summary: '搜索对话消息' })
  @ApiQuery({ name: 'keyword', required: false, description: '搜索关键词' })
  @ApiQuery({ name: 'date', required: false, description: '日期 (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: '搜索成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  async searchMessages(
    @CurrentUser() user: User,
    @Query('keyword') keyword?: string,
    @Query('date') date?: string,
  ): Promise<{ 
    messages: Array<{ 
      id: string; 
      role: string; 
      content: string; 
      createdAt: Date;
      context?: string;
    }>;
    total: number;
  }> {
    const result = await this.chatService.searchMessages(user.id, keyword, date);
    return {
      messages: result.messages,
      total: result.total,
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

  @Get('config')
  @ApiOperation({ summary: '获取守护兽配置' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  async getConfig(@CurrentUser() user: User): Promise<{ 
    customName: string; 
    personalityConfig: string; 
    energy: number;
    totalConversations: number;
  }> {
    const config = await this.chatService.getSentinelConfig(user.id);
    return {
      customName: config.customName,
      personalityConfig: config.personalityConfig,
      energy: config.energy,
      totalConversations: config.totalConversations,
    };
  }

  @Patch('config')
  @ApiOperation({ summary: '更新守护兽配置' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  async updateConfig(
    @CurrentUser() user: User,
    @Body('customName') customName?: string,
    @Body('personalityConfig') personalityConfig?: string,
  ): Promise<{ success: boolean; config: { customName: string; personalityConfig: string } }> {
    const config = await this.chatService.updateSentinelConfig(user.id, {
      customName,
      personalityConfig,
    });
    return {
      success: true,
      config: {
        customName: config.customName,
        personalityConfig: config.personalityConfig,
      },
    };
  }
}
