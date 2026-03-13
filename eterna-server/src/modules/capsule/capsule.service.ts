import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, LessThan, MoreThan } from 'typeorm';
import { Capsule } from '@/entities/capsule.entity';
import { CreateCapsuleDto } from './dto/create-capsule.dto';
import { UpdateCapsuleDto } from './dto/update-capsule.dto';
import { CapsuleStatus, TriggerType } from '@/entities/capsule.enums';

@Injectable()
export class CapsuleService {
  constructor(
    @InjectRepository(Capsule)
    private capsuleRepository: Repository<Capsule>,
  ) {}

  async create(userId: string, createCapsuleDto: CreateCapsuleDto): Promise<Capsule> {
    const capsule = this.capsuleRepository.create({
      ...createCapsuleDto,
      userId,
      triggerDate: createCapsuleDto.triggerDate
        ? new Date(createCapsuleDto.triggerDate)
        : null,
      mediaUrls: createCapsuleDto.mediaUrls || [],
    });

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

    if (updateCapsuleDto.triggerDate) {
      capsule.triggerDate = new Date(updateCapsuleDto.triggerDate);
    }

    Object.assign(capsule, {
      ...updateCapsuleDto,
      triggerDate: updateCapsuleDto.triggerDate
        ? new Date(updateCapsuleDto.triggerDate)
        : capsule.triggerDate,
    });

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
    });

    const inactivityCapsules = await this.capsuleRepository
      .createQueryBuilder('capsule')
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
