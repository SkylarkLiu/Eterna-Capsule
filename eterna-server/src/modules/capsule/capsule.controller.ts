import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseInterceptors,
  UploadedFiles,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
import { CapsuleService } from './capsule.service';
import { CreateCapsuleDto } from './dto/create-capsule.dto';
import { UpdateCapsuleDto } from './dto/update-capsule.dto';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Public } from '@/common/decorators/public.decorator';

@ApiTags('胶囊管理')
@ApiBearerAuth()
@Controller('capsules')
export class CapsuleController {
  constructor(private readonly capsuleService: CapsuleService) {}

  @Post()
  @ApiOperation({ summary: '创建胶囊' })
  create(
    @CurrentUser('id') userId: string,
    @Body() createCapsuleDto: CreateCapsuleDto,
  ) {
    return this.capsuleService.create(userId, createCapsuleDto);
  }

  @Get()
  @ApiOperation({ summary: '获取用户所有胶囊' })
  findAll(@CurrentUser('id') userId: string) {
    return this.capsuleService.findAll(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取单个胶囊详情' })
  findOne(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.capsuleService.findOne(userId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新胶囊' })
  update(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCapsuleDto: UpdateCapsuleDto,
  ) {
    return this.capsuleService.update(userId, id, updateCapsuleDto);
  }

  @Post(':id/seal')
  @ApiOperation({ summary: '封装胶囊' })
  seal(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.capsuleService.seal(userId, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除胶囊' })
  remove(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.capsuleService.remove(userId, id);
  }

  @Post(':id/heartbeat')
  @ApiOperation({ summary: '记录心跳（死信开关类型）' })
  recordHeartbeat(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.capsuleService.recordHeartbeat(userId, id);
  }

  @Post('upload')
  @ApiOperation({ summary: '上传媒体文件' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('files', 10))
  uploadFiles(@UploadedFiles() files: Express.Multer.File[]) {
    const urls = files.map(
      (file) => `/uploads/${file.filename}`,
    );
    return { urls };
  }

  @Public()
  @Get('triggers/check')
  @ApiOperation({ summary: '检查待触发的胶囊（定时任务调用）' })
  checkTriggers() {
    return this.capsuleService.checkTriggers();
  }
}
