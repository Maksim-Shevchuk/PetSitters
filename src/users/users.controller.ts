import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../schemas/user.schema';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Получить свой профиль',
    description: 'Возвращает информацию о текущем авторизованном пользователе',
  })
  @ApiResponse({
    status: 200,
    description: 'Профиль пользователя',
    schema: {
      example: {
        _id: '697117d676bbc3be9cb8c700',
        name: 'Иван Петрович',
        email: 'ivan@example.com',
        role: 'client',
        phone: '+7 (999) 123-45-67',
        address: 'г. Москва, ул. Ленина, 10',
        isActive: true,
        rating: 0,
        reviewsCount: 0,
        createdAt: '2026-01-21T19:00:00.000Z',
        updatedAt: '2026-01-21T19:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Необходима авторизация' })
  async getProfile(@CurrentUser() user: any) {
    return this.usersService.findById(user.userId);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Обновить свой профиль',
    description:
      'Обновляет информацию текущего пользователя. Нельзя изменить email, пароль, роль.',
  })
  @ApiResponse({
    status: 200,
    description: 'Профиль успешно обновлен',
  })
  @ApiResponse({ status: 401, description: 'Необходима авторизация' })
  async updateProfile(
    @CurrentUser() user: any,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(user.userId, updateProfileDto);
  }

  @Get('petsitters')
  @ApiOperation({
    summary: 'Получить список петситтеров',
    description:
      'Возвращает список всех активных петситтеров с их рейтингами. Используется для выбора исполнителя.',
  })
  @ApiQuery({
    name: 'minRating',
    required: false,
    description: 'Минимальный рейтинг',
    example: 4.0,
  })
  @ApiResponse({
    status: 200,
    description: 'Список петситтеров',
    schema: {
      example: [
        {
          _id: '697117d676bbc3be9cb8c703',
          name: 'Мария Петрова',
          email: 'maria@example.com',
          phone: '+7 (999) 765-43-21',
          bio: 'Профессиональный кинолог с опытом работы 5 лет',
          rating: 4.8,
          reviewsCount: 15,
        },
      ],
    },
  })
  async getPetsitters(@Query('minRating') minRating?: number) {
    const petsitters = await this.usersService.findPetsitters();
    
    if (minRating) {
      return petsitters.filter((ps) => ps.rating >= minRating);
    }
    
    return petsitters;
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Получить пользователя по ID',
    description: 'Возвращает публичную информацию о пользователе (без пароля)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID пользователя',
  })
  @ApiResponse({
    status: 200,
    description: 'Информация о пользователе',
  })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  async getUserById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Get()
  @ApiOperation({
    summary: 'Получить список пользователей',
    description: 'Возвращает список всех активных пользователей',
  })
  @ApiQuery({
    name: 'role',
    required: false,
    description: 'Фильтр по роли (client или petsitter)',
    enum: ['client', 'petsitter'],
  })
  @ApiResponse({
    status: 200,
    description: 'Список пользователей',
  })
  async getAllUsers(@Query('role') role?: UserRole) {
    const users = await this.usersService.findAll();
    
    if (role) {
      return users.filter((user) => user.role === role);
    }
    
    return users;
  }

  @Delete('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Деактивировать свой аккаунт',
    description:
      'Деактивирует аккаунт текущего пользователя. Аккаунт не удаляется, но помечается как неактивный.',
  })
  @ApiResponse({
    status: 200,
    description: 'Аккаунт успешно деактивирован',
    schema: {
      example: {
        message: 'Аккаунт успешно деактивирован',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Необходима авторизация' })
  async deactivateAccount(@CurrentUser() user: any) {
    await this.usersService.deactivate(user.userId);
    return {
      message: 'Аккаунт успешно деактивирован',
    };
  }
}
