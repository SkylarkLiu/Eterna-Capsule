import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '@/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, phone, password, username } = registerDto;

    if (!email && !phone) {
      throw new BadRequestException('邮箱和手机号至少填写一项');
    }

    if (email) {
      const existingEmail = await this.userRepository.findOne({
        where: { email },
      });
      if (existingEmail) {
        throw new ConflictException('该邮箱已被注册');
      }
    }

    if (phone) {
      const existingPhone = await this.userRepository.findOne({
        where: { phone },
      });
      if (existingPhone) {
        throw new ConflictException('该手机号已被注册');
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.userRepository.create({
      email,
      phone,
      password: hashedPassword,
      username,
    });

    await this.userRepository.save(user);

    const payload = { sub: user.id, username: user.username };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: this.sanitizeUser(user),
    };
  }

  async login(loginDto: LoginDto) {
    const { account, password } = loginDto;

    const isEmail = account.includes('@');
    
    const user = await this.userRepository
      .createQueryBuilder('user')
      .where(isEmail ? 'user.email = :account' : 'user.phone = :account', {
        account,
      })
      .addSelect('user.password')
      .getOne();

    if (!user) {
      throw new UnauthorizedException('账号或密码错误');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('账号或密码错误');
    }

    await this.userRepository.update(user.id, {
      lastLoginAt: new Date(),
    });

    const payload = { sub: user.id, username: user.username };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: this.sanitizeUser(user),
    };
  }

  async validateUser(userId: string) {
    return this.userRepository.findOne({
      where: { id: userId },
    });
  }

  private sanitizeUser(user: User) {
    const { password, ...result } = user;
    return result;
  }
}
