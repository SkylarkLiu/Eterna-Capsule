import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Capsule } from '@/entities/capsule.entity';
import { CapsuleController } from './capsule.controller';
import { CapsuleService } from './capsule.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Capsule]),
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
          callback(null, uniqueName);
        },
      }),
      limits: {
        fileSize: 50 * 1024 * 1024,
      },
      fileFilter: (req, file, callback) => {
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
  ],
  controllers: [CapsuleController],
  providers: [CapsuleService],
  exports: [CapsuleService],
})
export class CapsuleModule {}
