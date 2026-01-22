import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsNumber,
  IsDateString,
  IsOptional,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ServiceType } from '../../schemas';

export class CreateRequestDto {
  @ApiProperty({
    description: 'ID животного',
    example: '697117d676bbc3be9cb8c710',
  })
  @IsNotEmpty({ message: 'ID животного обязателен' })
  @IsString()
  petId: string;

  @ApiProperty({
    description: 'Тип услуги',
    enum: ServiceType,
    example: ServiceType.WALKING,
  })
  @IsNotEmpty({ message: 'Тип услуги обязателен' })
  @IsEnum(ServiceType, { message: 'Некорректный тип услуги' })
  serviceType: ServiceType;

  @ApiProperty({
    description: 'Дата и время начала',
    example: '2026-01-25T10:00:00.000Z',
  })
  @IsNotEmpty({ message: 'Дата начала обязательна' })
  @IsDateString({}, { message: 'Некорректный формат даты начала' })
  startDate: string;

  @ApiProperty({
    description: 'Дата и время окончания',
    example: '2026-01-25T12:00:00.000Z',
  })
  @IsNotEmpty({ message: 'Дата окончания обязательна' })
  @IsDateString({}, { message: 'Некорректный формат даты окончания' })
  endDate: string;

  @ApiProperty({
    description: 'Описание заявки, особые пожелания',
    example: 'Прогулка в парке, желательно утром',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Адрес, где будет оказываться услуга',
    example: 'г. Москва, ул. Примерная, д. 1',
  })
  @IsNotEmpty({ message: 'Адрес обязателен' })
  @IsString()
  address: string;

  @ApiProperty({
    description: 'Стоимость услуги в рублях',
    example: 500,
    minimum: 0,
  })
  @IsNotEmpty({ message: 'Цена обязательна' })
  @IsNumber()
  @Min(0, { message: 'Цена не может быть отрицательной' })
  price: number;
}
