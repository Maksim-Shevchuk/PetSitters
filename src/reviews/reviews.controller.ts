import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
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
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../schemas';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Оставить отзыв о петситтере',
    description:
      'Клиент оставляет отзыв после завершения заявки. Можно оставить только один отзыв на заявку.',
  })
  @ApiResponse({
    status: 201,
    description: 'Отзыв успешно создан',
    schema: {
      example: {
        _id: '697117d676bbc3be9cb8c730',
        requestId: '697117d676bbc3be9cb8c720',
        clientId: '697117d676bbc3be9cb8c700',
        petsitterId: '697117d676bbc3be9cb8c703',
        rating: 5,
        comment: 'Отличный петситтер! Рекомендую!',
        isVisible: true,
        createdAt: '2026-01-21T19:30:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Необходима авторизация' })
  @ApiResponse({ status: 403, description: 'Доступно только клиентам' })
  @ApiResponse({
    status: 400,
    description: 'Отзыв уже оставлен или заявка не завершена',
  })
  create(@CurrentUser() user: any, @Body() createReviewDto: CreateReviewDto) {
    return this.reviewsService.create(user.userId, createReviewDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Получить список отзывов',
    description:
      'Возвращает список отзывов с возможностью фильтрации по петситтеру',
  })
  @ApiQuery({
    name: 'petsitterId',
    required: false,
    description: 'ID петситтера для фильтрации',
  })
  @ApiResponse({ status: 200, description: 'Список отзывов' })
  findAll(@Query('petsitterId') petsitterId?: string) {
    return this.reviewsService.findAll(
      petsitterId ? { petsitterId, isVisible: true } : { isVisible: true },
    );
  }

  @Get('petsitter/:id')
  @ApiOperation({
    summary: 'Получить отзывы о петситтере',
    description: 'Возвращает все видимые отзывы о конкретном петситтере',
  })
  @ApiParam({
    name: 'id',
    description: 'ID петситтера',
  })
  @ApiResponse({
    status: 200,
    description: 'Список отзывов о петситтере',
  })
  findByPetsitter(@Param('id') petsitterId: string) {
    return this.reviewsService.findByPetsitter(petsitterId);
  }

  @Get('petsitter/:id/statistics')
  @ApiOperation({
    summary: 'Получить статистику отзывов петситтера',
    description:
      'Возвращает общую статистику: средний рейтинг, количество отзывов, распределение оценок',
  })
  @ApiParam({
    name: 'id',
    description: 'ID петситтера',
  })
  @ApiResponse({
    status: 200,
    description: 'Статистика отзывов',
    schema: {
      example: {
        totalReviews: 15,
        averageRating: 4.73,
        ratingDistribution: {
          5: 10,
          4: 3,
          3: 2,
          2: 0,
          1: 0,
        },
      },
    },
  })
  getStatistics(@Param('id') petsitterId: string) {
    return this.reviewsService.getStatistics(petsitterId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Получить отзыв по ID',
    description: 'Возвращает подробную информацию об отзыве',
  })
  @ApiParam({
    name: 'id',
    description: 'ID отзыва',
  })
  @ApiResponse({ status: 200, description: 'Информация об отзыве' })
  @ApiResponse({ status: 404, description: 'Отзыв не найден' })
  findOne(@Param('id') id: string) {
    return this.reviewsService.findById(id);
  }

  @Patch(':id/toggle-visibility')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PETSITTER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Скрыть/показать отзыв',
    description:
      'Петситтер может скрыть или показать отзыв о себе. Скрытые отзывы не отображаются в общем списке.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID отзыва',
  })
  @ApiResponse({ status: 200, description: 'Видимость отзыва изменена' })
  @ApiResponse({ status: 401, description: 'Необходима авторизация' })
  @ApiResponse({ status: 403, description: 'Доступно только петситтерам' })
  toggleVisibility(@Param('id') id: string, @CurrentUser() user: any) {
    return this.reviewsService.toggleVisibility(id, user.userId);
  }
}
