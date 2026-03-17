import { Controller, Get, Patch, Body, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserService, UserSettingsResponse } from './user.service';
import { User } from '@/entities/user.entity';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('用户')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @ApiOperation({ summary: '获取当前登录用户信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  async getCurrentUser(@CurrentUser() user: User): Promise<User> {
    return this.userService.findById(user.id);
  }

  @Get('settings')
  @ApiOperation({ summary: '获取用户设置（包含脱敏后的 LLM 配置）' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  async getUserSettings(@CurrentUser() user: User): Promise<UserSettingsResponse> {
    return this.userService.getUserSettings(user.id);
  }

  @Patch('update')
  @ApiOperation({ summary: '更新个人资料' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  @ApiResponse({ status: 409, description: '邮箱或手机号已被使用' })
  async updateProfile(
    @CurrentUser() user: User,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.userService.update(user.id, updateUserDto);
  }

  @Post('heartbeat')
  @ApiOperation({ summary: '记录心跳' })
  @ApiResponse({ status: 200, description: '心跳记录成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  async recordHeartbeat(@CurrentUser() user: User): Promise<User> {
    return this.userService.recordHeartbeat(user.id);
  }
}
