import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UserService } from '@/modules/user/user.service';
import { CapsuleService } from '@/modules/capsule/capsule.service';
import { NotificationService } from '@/modules/notification/notification.service';
import { ChatService } from '@/modules/chat/chat.service';
import { HeartbeatStatus } from '@/entities/heartbeat.enums';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Capsule } from '@/entities/capsule.entity';
import { CapsuleStatus, TriggerType } from '@/entities/capsule.enums';
import { User } from '@/entities/user.entity';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);
  private processedCapsules: Set<string> = new Set();

  constructor(
    private readonly userService: UserService,
    private readonly capsuleService: CapsuleService,
    private readonly notificationService: NotificationService,
    private readonly chatService: ChatService,
    @InjectRepository(Capsule)
    private capsuleRepository: Repository<Capsule>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleHeartbeatCheck() {
    this.logger.log('开始心跳检测任务...');

    try {
      const missingUsers = await this.userService.getUsersWithMissingHeartbeat();
      
      if (missingUsers.length > 0) {
        const userIds = missingUsers.map(u => u.id);
        await this.userService.markUsersAsMissing(userIds);
        
        this.logger.log(`已标记 ${missingUsers.length} 个用户为失联状态`);
      } else {
        this.logger.log('没有发现失联用户');
      }
    } catch (error) {
      this.logger.error(`心跳检测任务失败: ${error.message}`);
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async handleMessengerTask() {
    this.logger.log('开始信使任务...');

    try {
      const capsulesToTrigger = await this.capsuleRepository
        .createQueryBuilder('capsule')
        .leftJoinAndSelect('capsule.user', 'user')
        .where('capsule.status = :status', { status: CapsuleStatus.SEALED })
        .andWhere('capsule.triggerType = :triggerType', { triggerType: TriggerType.INACTIVITY })
        .andWhere('user.heartbeatStatus = :heartbeatStatus', { heartbeatStatus: HeartbeatStatus.MISSING })
        .getMany();

      let sentCount = 0;
      let failedCount = 0;

      for (const capsule of capsulesToTrigger) {
        if (this.processedCapsules.has(capsule.id)) {
          this.logger.log(`胶囊 ${capsule.id} 已处理过，跳过`);
          continue;
        }

        this.processedCapsules.add(capsule.id);

        if (capsule.contactMethod && capsule.contactValue) {
          this.logger.log(`守护兽已出发前往 [${capsule.contactValue}]`);
          
          const notificationSent = await this.notificationService.sendNotification(capsule);
          
          if (notificationSent) {
            capsule.status = CapsuleStatus.SENT;
            capsule.sentAt = new Date();
            await this.capsuleRepository.save(capsule);
            sentCount++;
            this.logger.log(`胶囊 ${capsule.id} 已成功送达`);
          } else {
            failedCount++;
            this.logger.warn(`胶囊 ${capsule.id} 通知发送失败`);
          }
        } else {
          capsule.status = CapsuleStatus.SENT;
          capsule.sentAt = new Date();
          await this.capsuleRepository.save(capsule);
          sentCount++;
          this.logger.log(`胶囊 ${capsule.id} 已触发（无接收人信息）`);
        }
      }

      this.logger.log(`信使任务完成: 发送 ${sentCount}, 失败 ${failedCount}`);
    } catch (error) {
      this.logger.error(`信使任务失败: ${error.message}`);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanProcessedCache() {
    this.logger.log('清理已处理胶囊缓存...');
    this.processedCapsules.clear();
    this.logger.log('缓存已清理');
  }

  /**
   * Memory Compression Task - Runs every night at 2 AM
   * 
   * This task processes all users' conversations from the day and
   * extracts key memories to store in long-term memory.
   * 
   * FLOW:
   * 1. Find all users who had conversations today
   * 2. For each user, call ChatService.compressMemories()
   * 3. AI extracts 3 most precious memory points
   * 4. Summaries are stored in UserMemory table
   * 5. Old ChatMemory entries are cleaned up
   * 
   * EFFECT:
   * When you ask "Do you remember who I mentioned last month?"
   * The Sentinel can search through compressed memories and recall.
   */
  @Cron('0 2 * * *')
  async handleMemoryCompression() {
    this.logger.log('开始记忆压缩任务...');

    try {
      const users = await this.userRepository.find({
        where: { heartbeatStatus: HeartbeatStatus.ALIVE },
      });

      let compressedCount = 0;
      let errorCount = 0;

      for (const user of users) {
        try {
          await this.chatService.compressMemories(user.id);
          compressedCount++;
        } catch (error) {
          this.logger.error(`用户 ${user.id} 记忆压缩失败: ${error.message}`);
          errorCount++;
        }
      }

      this.logger.log(`记忆压缩任务完成: 成功 ${compressedCount}, 失败 ${errorCount}`);
    } catch (error) {
      this.logger.error(`记忆压缩任务失败: ${error.message}`);
    }
  }

  async triggerCapsuleManually(capsuleId: string): Promise<boolean> {
    const capsule = await this.capsuleRepository.findOne({
      where: { id: capsuleId },
      relations: ['user'],
    });

    if (!capsule) {
      this.logger.warn(`胶囊 ${capsuleId} 不存在`);
      return false;
    }

    if (capsule.status !== CapsuleStatus.SEALED) {
      this.logger.warn(`胶囊 ${capsuleId} 状态不是 SEALED`);
      return false;
    }

    if (capsule.contactMethod && capsule.contactValue) {
      this.logger.log(`守护兽已出发前往 [${capsule.contactValue}]`);
      
      const notificationSent = await this.notificationService.sendNotification(capsule);
      
      if (notificationSent) {
        capsule.status = CapsuleStatus.SENT;
        capsule.sentAt = new Date();
        await this.capsuleRepository.save(capsule);
        return true;
      }
      return false;
    } else {
      capsule.status = CapsuleStatus.SENT;
      capsule.sentAt = new Date();
      await this.capsuleRepository.save(capsule);
      return true;
    }
  }
}
