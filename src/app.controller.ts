import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({
    summary: 'Проверка работоспособности API',
    description: 'Простой эндпоинт для проверки, что API работает',
  })
  @ApiResponse({
    status: 200,
    description: 'API работает',
    schema: {
      example: 'Hello world!',
    },
  })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('test-encoding')
  @ApiOperation({
    summary: 'Тест кодировки UTF-8',
    description: 'Проверка корректного отображения русских символов',
  })
  @ApiResponse({
    status: 200,
    description: 'Проверка кодировки',
    schema: {
      example: {
        message: 'Тест русских символов',
        cyrillicText: 'Привет мир! 🐾',
        timestamp: '2026-01-21T18:00:00.000Z',
      },
    },
  })
  testEncoding(): object {
    return {
      message: 'Тест русских символов',
      cyrillicText: 'Привет мир! Это тестовое сообщение на русском языке. 🐾',
      specialChars: 'Ёё Щщ Ъъ Ыы Ээ Юю Яя',
      timestamp: new Date().toISOString(),
    };
  }
}
