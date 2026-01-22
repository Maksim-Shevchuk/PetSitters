import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RequestStatus } from '../../schemas';

export class UpdateRequestDto {
  @ApiProperty({
    description: 'Новый статус заявки',
    enum: RequestStatus,
    example: RequestStatus.IN_PROGRESS,
    required: false,
  })
  @IsOptional()
  @IsEnum(RequestStatus, { message: 'Некорректный статус' })
  status?: RequestStatus;

  @ApiProperty({
    description: 'Заметки о выполнении',
    example: 'Прогулка прошла отлично, животное активное и довольное',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
