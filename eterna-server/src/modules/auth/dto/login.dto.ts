import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ description: '账号（邮箱或手机号）', example: 'user@example.com' })
  @IsNotEmpty({ message: '账号不能为空' })
  @IsString()
  account: string;

  @ApiProperty({ description: '密码', example: 'password123', minLength: 6, maxLength: 20 })
  @IsNotEmpty({ message: '密码不能为空' })
  @IsString()
  @MinLength(6, { message: '密码长度不能少于6位' })
  @MaxLength(20, { message: '密码长度不能超过20位' })
  password: string;
}
