import { ApiProperty } from '@nestjs/swagger';

export class AcceptRequestDto {
  @ApiProperty({
    description: 'ID заявки для принятия',
    example: '697117d676bbc3be9cb8c720',
  })
  requestId: string;
}
