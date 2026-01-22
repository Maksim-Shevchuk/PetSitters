import {
  IsNotEmpty,
  IsString,
  IsNumber,
  Min,
  Max,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({
    description: 'ID завершенной заявки',
    example: '697117d676bbc3be9cb8c720',
  })
  @IsNotEmpty({ message: 'ID заявки обязателен' })
  @IsString()
  requestId: string;

  @ApiProperty({
    description: 'Оценка от 1 до 5',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @IsNotEmpty({ message: 'Оценка обязательна' })
  @IsNumber()
  @Min(1, { message: 'Минимальная оценка - 1' })
  @Max(5, { message: 'Максимальная оценка - 5' })
  rating: number;

  @ApiProperty({
    description: 'Текст отзыва',
    example:
      'Отличный петситтер! Бобик был очень доволен прогулкой. Рекомендую!',
    required: false,
  })
  @IsOptional()
  @IsString()
  comment?: string;
}
