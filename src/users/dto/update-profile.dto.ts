import { IsString, IsOptional, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty({
    description: 'Имя пользователя',
    example: 'Иван Петрович Сидоров',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Имя должно содержать минимум 2 символа' })
  name?: string;

  @ApiProperty({
    description: 'Номер телефона',
    example: '+7 (999) 123-45-67',
    required: false,
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    description: 'Адрес',
    example: 'г. Москва, ул. Пушкина, д. 10',
    required: false,
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({
    description: 'Биография (для петситтеров)',
    example: 'Опытный кинолог с 5-летним стажем',
    required: false,
  })
  @IsOptional()
  @IsString()
  bio?: string;
}
