import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, SelectQueryBuilder } from 'typeorm';
import { User } from '@/entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { HeartbeatStatus } from '@/entities/heartbeat.enums';

// 用户设置响应 DTO（包含脱敏后的 LLM 配置）
export class UserSettingsResponse {
  username: string;
  email: string | null;
  phone: string | null;
  avatarUrl: string | null;
  motto: string | null;
  heartbeatGraceDays: number;
  llmModel: string | null;
  llmBaseUrl: string | null;
  llmApiKeyMasked: string | null; // 脱敏后的 API Key
}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    return user;
  }

  /**
   * 获取用户设置（包含脱敏后的 LLM 配置）
   */
  async getUserSettings(id: string): Promise<UserSettingsResponse> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .where('user.id = :id', { id })
      .addSelect('user.llmApiKey') // 显式查询 API Key
      .getOne();

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 脱敏 API Key：只显示前4位和后4位
    let llmApiKeyMasked: string | null = null;
    if (user.llmApiKey) {
      const key = user.llmApiKey;
      if (key.length > 12) {
        llmApiKeyMasked = `${key.substring(0, 4)}${'•'.repeat(8)}${key.substring(key.length - 4)}`;
      } else {
        llmApiKeyMasked = `${key.substring(0, 2)}${'•'.repeat(6)}`;
      }
    }

    return {
      username: user.username,
      email: user.email,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      motto: user.motto,
      heartbeatGraceDays: user.heartbeatGraceDays,
      llmModel: user.llmModel,
      llmBaseUrl: user.llmBaseUrl,
      llmApiKeyMasked,
    };
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
    });
  }

  async findByPhone(phone: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { phone },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .where('user.id = :id', { id })
      .addSelect('user.llmApiKey') // 显式查询现有 API Key
      .getOne();

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingEmail = await this.findByEmail(updateUserDto.email);
      if (existingEmail) {
        throw new ConflictException('该邮箱已被使用');
      }
    }

    if (updateUserDto.phone && updateUserDto.phone !== user.phone) {
      const existingPhone = await this.findByPhone(updateUserDto.phone);
      if (existingPhone) {
        throw new ConflictException('该手机号已被使用');
      }
    }

    // 安全性检查：如果 llmApiKey 是空字符串或未提供，保留现有值
    const updateData = { ...updateUserDto };
    if (updateData.llmApiKey === '' || updateData.llmApiKey === undefined) {
      delete updateData.llmApiKey;
    }

    Object.assign(user, updateData);

    return this.userRepository.save(user);
  }

  async recordHeartbeat(userId: string): Promise<User> {
    const user = await this.findById(userId);
    
    user.lastHeartbeatAt = new Date();
    user.heartbeatStatus = HeartbeatStatus.ALIVE;
    
    return this.userRepository.save(user);
  }

  async getUsersWithMissingHeartbeat(): Promise<User[]> {
    const users = await this.userRepository.find({
      where: {
        heartbeatStatus: HeartbeatStatus.ALIVE,
      },
    });

    const now = new Date();
    const missingUsers: User[] = [];

    for (const user of users) {
      if (!user.lastHeartbeatAt) {
        continue;
      }

      const daysSinceLastHeartbeat = Math.floor(
        (now.getTime() - user.lastHeartbeatAt.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceLastHeartbeat > user.heartbeatGraceDays) {
        missingUsers.push(user);
      }
    }

    return missingUsers;
  }

  async markUsersAsMissing(userIds: string[]): Promise<void> {
    if (userIds.length === 0) return;
    
    await this.userRepository.update(
      { id: In(userIds) },
      { heartbeatStatus: HeartbeatStatus.MISSING },
    );
  }

  async markUserAsDeparted(userId: string): Promise<void> {
    await this.userRepository.update(
      { id: userId },
      { heartbeatStatus: HeartbeatStatus.DEPARTED },
    );
  }

  async getMissingUsersWithSealedCapsules(): Promise<User[]> {
    return this.userRepository
      .createQueryBuilder('user')
      .innerJoin('user.capsules', 'capsule')
      .where('user.heartbeatStatus = :status', { status: HeartbeatStatus.MISSING })
      .andWhere('capsule.status = :capsuleStatus', { capsuleStatus: 'SEALED' })
      .andWhere('capsule.triggerType = :triggerType', { triggerType: 'INACTIVITY' })
      .getMany();
  }
}
