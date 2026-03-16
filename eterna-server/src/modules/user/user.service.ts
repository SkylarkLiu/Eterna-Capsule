import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User } from '@/entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { HeartbeatStatus } from '@/entities/heartbeat.enums';

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
    const user = await this.findById(id);

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

    Object.assign(user, updateUserDto);

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
