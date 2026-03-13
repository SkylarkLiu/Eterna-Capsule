import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Capsule } from '@/entities/capsule.entity';
import { CapsuleController } from './capsule.controller';
import { CapsuleService } from './capsule.service';
import { NotificationModule } from '@/modules/notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Capsule]),
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads',
        filename: (_req: Express.Request, file: Express.Multer.File, callback: (error: Error | null, filename: string) => void) => {
          const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
          callback(null, uniqueName);
        },
      }),
      limits: {
        fileSize: 50 * 1024 * 1024,
      },
      fileFilter: (_req: Express.Request, file: Express.Multer.File, callback: (error: Error | null, acceptFile: boolean) => void) => {
        const allowedMimes = [
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
          'video/mp4',
          'video/quicktime',
          'video/webm',
        ];
        if (allowedMimes.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(new Error('不支持的文件类型'), false);
        }
      },
    }),
    NotificationModule,
  ],
  controllers: [CapsuleController],
  providers: [CapsuleService],
  exports: [CapsuleService],
})
export class CapsuleModule {}
