import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PetType, PetSize } from '../../schemas';

export class CreatePetDto {
  @ApiProperty({
    description: 'Кличка животного',
    example: 'Бобик',
  })
  @IsNotEmpty({ message: 'Кличка обязательна' })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Тип животного',
    enum: PetType,
    example: PetType.DOG,
  })
  @IsNotEmpty({ message: 'Тип животного обязателен' })
  @IsEnum(PetType, { message: 'Некорректный тип животного' })
  type: PetType;

  @ApiProperty({
    description: 'Порода',
    example: 'Лабрадор',
  })
  @IsNotEmpty({ message: 'Порода обязательна' })
  @IsString()
  breed: string;

  @ApiProperty({
    description: 'Возраст в годах',
    example: 3,
    minimum: 0,
  })
  @IsNotEmpty({ message: 'Возраст обязателен' })
  @IsNumber()
  @Min(0, { message: 'Возраст не может быть отрицательным' })
  age: number;

  @ApiProperty({
    description: 'Размер животного',
    enum: PetSize,
    example: PetSize.MEDIUM,
  })
  @IsNotEmpty({ message: 'Размер обязателен' })
  @IsEnum(PetSize, { message: 'Некорректный размер' })
  size: PetSize;

  @ApiProperty({
    description: 'Вес в килограммах',
    example: 25.5,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Вес не может быть отрицательным' })
  weight?: number;

  @ApiProperty({
    description: 'Особые потребности (аллергии, особенности поведения и т.д.)',
    example: 'Боится громких звуков, аллергия на курицу',
    required: false,
  })
  @IsOptional()
  @IsString()
  specialNeeds?: string;

  @ApiProperty({
    description: 'Медицинская информация (прививки, заболевания)',
    example: 'Все прививки сделаны, здоров',
    required: false,
  })
  @IsOptional()
  @IsString()
  medicalInfo?: string;

  @ApiProperty({
    description: 'URL фотографии животного',
    example: 'https://example.com/photos/bobik.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  photo?: string;
}
