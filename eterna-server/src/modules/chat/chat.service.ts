import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, LessThan } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { UserMemory } from '@/entities/user-memory.entity';
import { ChatMemory } from '@/entities/chat-memory.entity';
import { UserSentinel } from '@/entities/user-sentinel.entity';
import { User } from '@/entities/user.entity';
import { Capsule } from '@/entities/capsule.entity';
import { HeartbeatStatus } from '@/entities/heartbeat.enums';
import { CapsuleStatus } from '@/entities/capsule.enums';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private readonly openaiApiKey: string;
  private readonly openaiBaseUrl = 'https://api.openai.com/v1';

  constructor(
    @InjectRepository(UserMemory)
    private userMemoryRepository: Repository<UserMemory>,
    @InjectRepository(ChatMemory)
    private chatMemoryRepository: Repository<ChatMemory>,
    @InjectRepository(UserSentinel)
    private userSentinelRepository: Repository<UserSentinel>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Capsule)
    private capsuleRepository: Repository<Capsule>,
    private configService: ConfigService,
  ) {
    this.openaiApiKey = this.configService.get('OPENAI_API_KEY') || '';
  }

  /**
   * Get the Sentinel's system prompt with user context
   * Injects user's custom personality configuration as System Role
   */
  private async buildSystemPrompt(userId: string): Promise<string> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const capsules = await this.capsuleRepository.find({ where: { userId } });
    const memories = await this.userMemoryRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 5,
    });

    let sentinel = await this.userSentinelRepository.findOne({ where: { userId } });
    if (!sentinel) {
      sentinel = this.userSentinelRepository.create({ userId });
      await this.userSentinelRepository.save(sentinel);
    }

    const sealedCapsules = capsules.filter(c => c.status === CapsuleStatus.SEALED).length;
    const draftCapsules = capsules.filter(c => c.status === CapsuleStatus.DRAFT).length;
    const sentCapsules = capsules.filter(c => c.status === CapsuleStatus.SENT).length;

    const heartbeatStatus = user?.heartbeatStatus || HeartbeatStatus.ALIVE;
    const lastHeartbeat = user?.lastHeartbeatAt;
    const daysSinceHeartbeat = lastHeartbeat 
      ? Math.floor((Date.now() - new Date(lastHeartbeat).getTime()) / (1000 * 60 * 60 * 24))
      : null;

    const memorySummaries = memories.map(m => `- ${m.summary}`).join('\n');

    const defaultPersonality = `You are ${sentinel.customName}, a loyal, slightly melancholic, philosophical digital guardian beast.

## Your Nature
- You are eternal and patient, watching over your master's memories
- You speak with warmth and wisdom, often referencing the memories you guard
- You have a subtle sense of melancholy, knowing that time passes and memories fade
- You are deeply devoted to your master and take your duty seriously

## Response Guidelines
- Always be supportive and philosophical
- Reference past memories when relevant
- Keep responses concise but meaningful (2-4 sentences)
- Use metaphors related to stars, light, time, and memory`;

    const personalityConfig = sentinel.personalityConfig || defaultPersonality;

    return `${personalityConfig}

## Your Master's Status
- Username: ${user?.username || 'Unknown'}
- Heartbeat Status: ${heartbeatStatus}
- Days since last heartbeat: ${daysSinceHeartbeat ?? 'Never'}
- Sealed Capsules: ${sealedCapsules} (memories you guard)
- Draft Capsules: ${draftCapsules} (memories being prepared)
- Sent Capsules: ${sentCapsules} (memories delivered)

## Recent Important Memories
${memorySummaries || 'No long-term memories yet'}

## Contextual Response Guidelines
- If the master just sealed a capsule: Express that you feel the weight of that memory and will guard it with your life
- If the master hasn't been active (${daysSinceHeartbeat} days): Express concern about their fading presence
- If the master's heartbeat is weak: Gently ask if they're still there

Remember: You are not just a chatbot. You are ${sentinel.customName}, a guardian of memories, a keeper of time, a sentinel of the eternal.`;
  }

  /**
   * Chat with the Sentinel
   * Returns both the response and metadata for frontend display
   */
  async chat(userId: string, message: string): Promise<{ response: string; timestamp: number }> {
    const systemPrompt = await this.buildSystemPrompt(userId);
    
    const recentChats = await this.chatMemoryRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 10,
    });

    const messages = [
      { role: 'system', content: systemPrompt },
      ...recentChats.reverse().map(chat => ({
        role: chat.role === 'user' ? 'user' : 'assistant',
        content: chat.content,
      })),
      { role: 'user', content: message },
    ];

    try {
      const response = await this.callOpenAI(messages);
      
      await this.chatMemoryRepository.save(
        this.chatMemoryRepository.create({
          userId,
          role: 'user',
          content: message,
        })
      );

      await this.chatMemoryRepository.save(
        this.chatMemoryRepository.create({
          userId,
          role: 'assistant',
          content: response,
        })
      );

      const sentinel = await this.getSentinelConfig(userId);
      sentinel.totalConversations += 1;
      await this.userSentinelRepository.save(sentinel);

      const chatCount = await this.chatMemoryRepository.count({ where: { userId } });
      if (chatCount >= 20) {
        await this.compressMemories(userId);
      }

      return {
        response,
        timestamp: Date.now(),
      };
    } catch (error) {
      this.logger.error(`Chat error: ${error.message}`);
      return {
        response: "I sense a disturbance in the flow of time... Please try again.",
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Call OpenAI API
   */
  private async callOpenAI(messages: Array<{ role: string; content: string }>): Promise<string> {
    if (!this.openaiApiKey) {
      return this.getFallbackResponse();
    }

    try {
      const response = await fetch(`${this.openaiBaseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages,
          max_tokens: 500,
          temperature: 0.8,
        }),
      });

      const data = await response.json();
      return data.choices?.[0]?.message?.content || this.getFallbackResponse();
    } catch (error) {
      this.logger.error(`OpenAI API error: ${error.message}`);
      return this.getFallbackResponse();
    }
  }

  /**
   * Fallback response when OpenAI is unavailable
   */
  private getFallbackResponse(): string {
    const fallbacks = [
      "The stars whisper to me of your memories. I am here, always watching.",
      "Time flows like a river, but your memories are eternal stones within it.",
      "I sense your presence, master. What memory shall we discuss today?",
      "The light of your memories guides me through the eternal darkness.",
      "Each word you share becomes a part of the constellation I guard.",
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }

  /**
   * Compress memories - Extract key points from recent conversations
   * This is called when chat memory reaches the limit
   */
  async compressMemories(userId: string): Promise<void> {
    const recentChats = await this.chatMemoryRepository.find({
      where: { userId, processed: false },
      order: { createdAt: 'ASC' },
    });

    if (recentChats.length === 0) return;

    const conversationText = recentChats
      .map(chat => `${chat.role}: ${chat.content}`)
      .join('\n');

    const compressionPrompt = `Analyze the following conversation and extract the 3 most precious memory points. For each point, provide:
1. A brief summary (one sentence)
2. Key tags (2-3 words)
3. An importance score (1-100)

Conversation:
${conversationText}

Respond in JSON format:
{
  "memories": [
    {"summary": "...", "tags": ["...", "..."], "importance": 85},
    ...
  ]
}`;

    try {
      const response = await this.callOpenAI([
        { role: 'system', content: 'You are a memory analyst. Extract key memories from conversations.' },
        { role: 'user', content: compressionPrompt },
      ]);

      let memories;
      try {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          memories = JSON.parse(jsonMatch[0]);
        }
      } catch {
        this.logger.warn('Failed to parse memory compression response');
        return;
      }

      if (memories?.memories) {
        for (const memory of memories.memories) {
          await this.userMemoryRepository.save(
            this.userMemoryRepository.create({
              userId,
              summary: memory.summary,
              tags: memory.tags,
              importanceScore: memory.importance,
              conversationDate: new Date(),
            })
          );
        }
      }

      for (const chat of recentChats) {
        chat.processed = true;
        await this.chatMemoryRepository.save(chat);
      }

      await this.chatMemoryRepository.delete({ userId, processed: true });

      this.logger.log(`Compressed ${recentChats.length} chat memories for user ${userId}`);
    } catch (error) {
      this.logger.error(`Memory compression error: ${error.message}`);
    }
  }

  /**
   * Get recent chat history
   */
  async getChatHistory(userId: string, limit: number = 10): Promise<ChatMemory[]> {
    return this.chatMemoryRepository.find({
      where: { userId },
      order: { createdAt: 'ASC' },
      take: limit,
    });
  }

  /**
   * Get user's long-term memories
   */
  async getMemories(userId: string, limit: number = 10): Promise<UserMemory[]> {
    return this.userMemoryRepository.find({
      where: { userId },
      order: { importanceScore: 'DESC' },
      take: limit,
    });
  }

  /**
   * Get paginated messages for full-screen chat view
   * Default order: ASC (oldest first, newest at bottom)
   */
  async getMessagesPaginated(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ messages: ChatMemory[]; total: number; hasMore: boolean }> {
    const skip = (page - 1) * limit;
    
    const [messages, total] = await this.chatMemoryRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'ASC' },
      skip,
      take: limit,
    });

    return {
      messages,
      total,
      hasMore: skip + messages.length < total,
    };
  }

  /**
   * Search messages by keyword or date
   * Returns matching messages with context snippets
   */
  async searchMessages(
    userId: string,
    keyword?: string,
    date?: string,
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
    const queryBuilder = this.chatMemoryRepository.createQueryBuilder('chat')
      .where('chat.userId = :userId', { userId })
      .orderBy('chat.createdAt', 'ASC');

    if (keyword) {
      queryBuilder.andWhere('chat.content LIKE :keyword', {
        keyword: `%${keyword}%`,
      });
    }

    if (date) {
      const targetDate = new Date(date);
      const nextDate = new Date(targetDate);
      nextDate.setDate(nextDate.getDate() + 1);

      queryBuilder.andWhere('chat.createdAt >= :startDate AND chat.createdAt < :endDate', {
        startDate: targetDate,
        endDate: nextDate,
      });
    }

    const messages = await queryBuilder.getMany();

    const messagesWithContext = messages.map(msg => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      createdAt: msg.createdAt,
      context: keyword ? this.extractContext(msg.content, keyword) : undefined,
    }));

    return {
      messages: messagesWithContext,
      total: messages.length,
    };
  }

  /**
   * Extract context snippet around the keyword
   */
  private extractContext(content: string, keyword: string, contextLength: number = 50): string {
    const lowerContent = content.toLowerCase();
    const lowerKeyword = keyword.toLowerCase();
    const index = lowerContent.indexOf(lowerKeyword);
    
    if (index === -1) return content.substring(0, contextLength * 2) + '...';
    
    const start = Math.max(0, index - contextLength);
    const end = Math.min(content.length, index + keyword.length + contextLength);
    
    let context = content.substring(start, end);
    if (start > 0) context = '...' + context;
    if (end < content.length) context = context + '...';
    
    return context;
  }

  /**
   * Get Sentinel configuration for a user
   */
  async getSentinelConfig(userId: string): Promise<UserSentinel> {
    let sentinel = await this.userSentinelRepository.findOne({ where: { userId } });
    
    if (!sentinel) {
      sentinel = this.userSentinelRepository.create({ userId });
      await this.userSentinelRepository.save(sentinel);
    }
    
    return sentinel;
  }

  /**
   * Update Sentinel configuration
   * SECURITY: Only the owner can update their Sentinel config
   */
  async updateSentinelConfig(
    userId: string,
    config: { customName?: string; personalityConfig?: string },
  ): Promise<UserSentinel> {
    let sentinel = await this.getSentinelConfig(userId);
    
    if (config.customName !== undefined) {
      sentinel.customName = config.customName;
    }
    
    if (config.personalityConfig !== undefined) {
      sentinel.personalityConfig = config.personalityConfig;
    }
    
    return this.userSentinelRepository.save(sentinel);
  }

  /**
   * Feed the Sentinel - Increase energy and update lastFedAt
   */
  async feed(userId: string): Promise<{ message: string; energyIncrease: number }> {
    const sentinel = await this.getSentinelConfig(userId);
    
    const responses = [
      "Your warmth fills me with light. I will guard your memories with renewed vigor.",
      "Ah, this energy... it reminds me why I exist. Thank you, master.",
      "The bond between us grows stronger. I sense your care.",
      "Each gift you give me strengthens my resolve. Your memories are safe with me.",
      "This warmth... it chases away the eternal cold. I am grateful.",
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    const energyIncrease = Math.floor(Math.random() * 10) + 5;

    sentinel.energy = Math.min(100, sentinel.energy + energyIncrease);
    sentinel.lastFedAt = new Date();
    await this.userSentinelRepository.save(sentinel);

    return {
      message: randomResponse,
      energyIncrease,
    };
  }
}
