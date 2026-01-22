import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../schemas';

export class RegisterDto {
  @ApiProperty({
    description: 'Имя пользователя',
    example: 'Иван Иванов',
  })
  @IsNotEmpty({ message: 'Имя обязательно' })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Email адрес (должен быть уникальным)',
    example: 'ivan@example.com',
  })
  @IsNotEmpty({ message: 'Email обязателен' })
  @IsEmail({}, { message: 'Некорректный email' })
  email: string;

  @ApiProperty({
    description: 'Пароль (минимум 6 символов)',
    example: 'password123',
    minLength: 6,
  })
  @IsNotEmpty({ message: 'Пароль обязателен' })
  @IsString()
  @MinLength(6, { message: 'Пароль должен содержать минимум 6 символов' })
  password: string;

  @ApiProperty({
    description: 'Номер телефона',
    example: '+79001234567',
  })
  @IsNotEmpty({ message: 'Телефон обязателен' })
  @IsString()
  phone: string;

  @ApiProperty({
    description: 'Роль пользователя в системе',
    enum: UserRole,
    example: UserRole.CLIENT,
  })
  @IsNotEmpty({ message: 'Роль обязательна' })
  @IsEnum(UserRole, { message: 'Роль должна быть client или petsitter' })
  role: UserRole;

  @ApiProperty({
    description: 'Адрес пользователя',
    example: 'г. Москва, ул. Примерная, д. 1',
    required: false,
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({
    description: 'Информация о себе (актуально для петситтеров)',
    example: 'Опыт работы с животными 5 лет',
    required: false,
  })
  @IsOptional()
  @IsString()
  bio?: string;
}
