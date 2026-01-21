import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { PetsService } from './pets.service';
import { CreatePetDto, UpdatePetDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../schemas';

@ApiTags('pets')
@Controller('pets')
export class PetsController {
  constructor(private readonly petsService: PetsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Зарегистрировать новое животное',
    description: 'Создание карточки животного. Доступно только клиентам.',
  })
  @ApiResponse({
    status: 201,
    description: 'Животное успешно зарегистрировано',
    schema: {
      example: {
        _id: '697117d676bbc3be9cb8c710',
        ownerId: '697117d676bbc3be9cb8c700',
        name: 'Бобик',
        type: 'dog',
        breed: 'Лабрадор',
        age: 3,
        size: 'medium',
        weight: 25.5,
        specialNeeds: 'Боится громких звуков',
        medicalInfo: 'Все прививки сделаны',
        isActive: true,
        createdAt: '2026-01-21T18:30:00.000Z',
        updatedAt: '2026-01-21T18:30:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Необходима авторизация',
  })
  @ApiResponse({
    status: 403,
    description: 'Доступно только клиентам',
  })
  create(@CurrentUser() user: any, @Body() createPetDto: CreatePetDto) {
    return this.petsService.create(user.userId, createPetDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Получить список всех животных',
    description: 'Возвращает список всех активных животных в системе',
  })
  @ApiResponse({
    status: 200,
    description: 'Список животных',
  })
  findAll() {
    return this.petsService.findAll();
  }

  @Get('my')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Получить своих животных',
    description: 'Возвращает список животных текущего пользователя',
  })
  @ApiResponse({
    status: 200,
    description: 'Список ваших животных',
  })
  @ApiResponse({
    status: 401,
    description: 'Необходима авторизация',
  })
  findMy(@CurrentUser() user: any) {
    return this.petsService.findByOwner(user.userId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Получить информацию о животном',
    description: 'Возвращает подробную информацию о животном по ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID животного',
    example: '697117d676bbc3be9cb8c710',
  })
  @ApiResponse({
    status: 200,
    description: 'Информация о животном',
  })
  @ApiResponse({
    status: 404,
    description: 'Животное не найдено',
  })
  findOne(@Param('id') id: string) {
    return this.petsService.findById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Обновить информацию о животном',
    description:
      'Обновление данных животного. Можно обновлять только своих животных.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID животного',
    example: '697117d676bbc3be9cb8c710',
  })
  @ApiResponse({
    status: 200,
    description: 'Информация обновлена',
  })
  @ApiResponse({
    status: 401,
    description: 'Необходима авторизация',
  })
  @ApiResponse({
    status: 403,
    description: 'Вы можете редактировать только своих животных',
  })
  @ApiResponse({
    status: 404,
    description: 'Животное не найдено',
  })
  update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() updatePetDto: UpdatePetDto,
  ) {
    return this.petsService.update(id, user.userId, updatePetDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENT)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Удалить животное',
    description:
      'Мягкое удаление животного (деактивация). Можно удалять только своих животных.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID животного',
    example: '697117d676bbc3be9cb8c710',
  })
  @ApiResponse({
    status: 204,
    description: 'Животное удалено',
  })
  @ApiResponse({
    status: 401,
    description: 'Необходима авторизация',
  })
  @ApiResponse({
    status: 403,
    description: 'Вы можете удалять только своих животных',
  })
  @ApiResponse({
    status: 404,
    description: 'Животное не найдено',
  })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.petsService.remove(id, user.userId);
  }
}
