import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, LessThan } from 'typeorm';
import { Capsule } from '@/entities/capsule.entity';
import { CreateCapsuleDto } from './dto/create-capsule.dto';
import { UpdateCapsuleDto } from './dto/update-capsule.dto';
import { CapsuleStatus, TriggerType } from '@/entities/capsule.enums';
import { NotificationService } from '@/modules/notification/notification.service';

@Injectable()
export class CapsuleService {
  private readonly logger = new Logger(CapsuleService.name);

  constructor(
    @InjectRepository(Capsule)
    private capsuleRepository: Repository<Capsule>,
    private notificationService: NotificationService,
  ) {}

  async create(userId: string, createCapsuleDto: CreateCapsuleDto): Promise<Capsule> {
    const capsuleData: Partial<Capsule> = {
      title: createCapsuleDto.title,
      content: createCapsuleDto.content,
      type: createCapsuleDto.type,
      triggerType: createCapsuleDto.triggerType,
      userId,
      mediaUrls: createCapsuleDto.mediaUrls || [],
    };

    if (createCapsuleDto.triggerDate) {
      capsuleData.triggerDate = new Date(createCapsuleDto.triggerDate);
    }

    if (createCapsuleDto.graceDays !== undefined) {
      capsuleData.graceDays = createCapsuleDto.graceDays;
    }

    if (createCapsuleDto.recipientName) {
      capsuleData.recipientName = createCapsuleDto.recipientName;
    }

    if (createCapsuleDto.contactMethod) {
      capsuleData.contactMethod = createCapsuleDto.contactMethod;
    }

    if (createCapsuleDto.contactValue) {
      capsuleData.contactValue = createCapsuleDto.contactValue;
    }

    const capsule = this.capsuleRepository.create(capsuleData);
    return this.capsuleRepository.save(capsule);
  }

  async findAll(userId: string): Promise<Capsule[]> {
    return this.capsuleRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(userId: string, id: string): Promise<Capsule> {
    const capsule = await this.capsuleRepository.findOne({
      where: { id, userId },
      relations: ['user'],
    });

    if (!capsule) {
      throw new NotFoundException('胶囊不存在');
    }

    return capsule;
  }

  async update(
    userId: string,
    id: string,
    updateCapsuleDto: UpdateCapsuleDto,
  ): Promise<Capsule> {
    const capsule = await this.findOne(userId, id);

    if (capsule.status === CapsuleStatus.SEALED) {
      throw new ForbiddenException('已封装的胶囊不可修改');
    }

    if (capsule.status === CapsuleStatus.SENT) {
      throw new ForbiddenException('已送达的胶囊不可修改');
    }

    if (updateCapsuleDto.title !== undefined) {
      capsule.title = updateCapsuleDto.title;
    }
    if (updateCapsuleDto.content !== undefined) {
      capsule.content = updateCapsuleDto.content;
    }
    if (updateCapsuleDto.mediaUrls !== undefined) {
      capsule.mediaUrls = updateCapsuleDto.mediaUrls;
    }
    if (updateCapsuleDto.type !== undefined) {
      capsule.type = updateCapsuleDto.type;
    }
    if (updateCapsuleDto.triggerType !== undefined) {
      capsule.triggerType = updateCapsuleDto.triggerType;
    }
    if (updateCapsuleDto.triggerDate !== undefined) {
      capsule.triggerDate = new Date(updateCapsuleDto.triggerDate);
    }
    if (updateCapsuleDto.graceDays !== undefined) {
      capsule.graceDays = updateCapsuleDto.graceDays;
    }
    if (updateCapsuleDto.recipientName !== undefined) {
      capsule.recipientName = updateCapsuleDto.recipientName;
    }
    if (updateCapsuleDto.contactMethod !== undefined) {
      capsule.contactMethod = updateCapsuleDto.contactMethod;
    }
    if (updateCapsuleDto.contactValue !== undefined) {
      capsule.contactValue = updateCapsuleDto.contactValue;
    }

    return this.capsuleRepository.save(capsule);
  }

  async seal(userId: string, id: string): Promise<Capsule> {
    const capsule = await this.findOne(userId, id);

    if (capsule.status !== CapsuleStatus.DRAFT) {
      throw new BadRequestException('只有草稿状态的胶囊可以封装');
    }

    if (capsule.triggerType === TriggerType.TIME && !capsule.triggerDate) {
      throw new BadRequestException('时间触发类型必须设置触发日期');
    }

    if (capsule.triggerType === TriggerType.INACTIVITY && !capsule.graceDays) {
      throw new BadRequestException('死信开关类型必须设置宽限天数');
    }

    if (capsule.triggerType === TriggerType.INACTIVITY) {
      if (!capsule.recipientName || !capsule.contactMethod || !capsule.contactValue) {
        throw new BadRequestException('死信开关类型必须填写完整的接收人信息');
      }
    }

    capsule.status = CapsuleStatus.SEALED;
    return this.capsuleRepository.save(capsule);
  }

  async remove(userId: string, id: string): Promise<void> {
    const capsule = await this.findOne(userId, id);

    if (capsule.status === CapsuleStatus.SENT) {
      throw new ForbiddenException('已送达的胶囊不可删除');
    }

    await this.capsuleRepository.remove(capsule);
  }

  async recordHeartbeat(userId: string, id: string): Promise<Capsule> {
    const capsule = await this.findOne(userId, id);

    if (capsule.triggerType !== TriggerType.INACTIVITY) {
      throw new BadRequestException('只有死信开关类型的胶囊需要记录心跳');
    }

    capsule.lastHeartbeat = new Date();
    return this.capsuleRepository.save(capsule);
  }

  async checkTriggers(): Promise<{ capsules: Capsule[]; count: number }> {
    const now = new Date();

    const timeTriggeredCapsules = await this.capsuleRepository.find({
      where: {
        status: CapsuleStatus.SEALED,
        triggerType: TriggerType.TIME,
        triggerDate: LessThan(now),
      },
      relations: ['user'],
    });

    const inactivityCapsules = await this.capsuleRepository
      .createQueryBuilder('capsule')
      .leftJoinAndSelect('capsule.user', 'user')
      .where('capsule.status = :status', { status: CapsuleStatus.SEALED })
      .andWhere('capsule.triggerType = :triggerType', {
        triggerType: TriggerType.INACTIVITY,
      })
      .andWhere(
        `datetime(capsule.lastHeartbeat, '+' || capsule.graceDays || ' days') < datetime(:now)`,
        { now: now.toISOString() },
      )
      .getMany();

    const allTriggeredCapsules = [
      ...timeTriggeredCapsules,
      ...inactivityCapsules,
    ];

    return {
      capsules: allTriggeredCapsules,
      count: allTriggeredCapsules.length,
    };
  }

  async processTriggeredCapsules(): Promise<{ sent: number; failed: number }> {
    const { capsules } = await this.checkTriggers();
    
    let sent = 0;
    let failed = 0;

    for (const capsule of capsules) {
      try {
        if (capsule.contactMethod && capsule.contactValue) {
          const notificationSent = await this.notificationService.sendNotification(capsule);
          
          if (notificationSent) {
            capsule.status = CapsuleStatus.SENT;
            capsule.sentAt = new Date();
            await this.capsuleRepository.save(capsule);
            sent++;
            this.logger.log(`Capsule ${capsule.id} triggered and notification sent`);
          } else {
            failed++;
            this.logger.warn(`Failed to send notification for capsule ${capsule.id}`);
          }
        } else {
          capsule.status = CapsuleStatus.SENT;
          capsule.sentAt = new Date();
          await this.capsuleRepository.save(capsule);
          sent++;
          this.logger.log(`Capsule ${capsule.id} triggered (no notification needed)`);
        }
      } catch (error) {
        failed++;
        this.logger.error(`Error processing capsule ${capsule.id}: ${error.message}`);
      }
    }

    return { sent, failed };
  }

  async markAsSent(id: string): Promise<Capsule> {
    const capsule = await this.capsuleRepository.findOne({ where: { id } });

    if (!capsule) {
      throw new NotFoundException('胶囊不存在');
    }

    capsule.status = CapsuleStatus.SENT;
    capsule.sentAt = new Date();

    return this.capsuleRepository.save(capsule);
  }

  async markMultipleAsSent(ids: string[]): Promise<void> {
    await this.capsuleRepository.update(
      { id: In(ids) },
      { status: CapsuleStatus.SENT, sentAt: new Date() },
    );
  }
}
