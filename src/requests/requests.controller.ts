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
import { RequestsService } from './requests.service';
import { CreateRequestDto, UpdateRequestDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../schemas';
import { RequestStatus } from '../schemas';

@ApiTags('requests')
@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Создать заявку на услугу',
    description:
      'Создание новой заявки на выгул или уход за животным. Доступно только клиентам для своих животных.',
  })
  @ApiResponse({
    status: 201,
    description: 'Заявка успешно создана',
    schema: {
      example: {
        _id: '697117d676bbc3be9cb8c720',
        clientId: '697117d676bbc3be9cb8c700',
        petId: '697117d676bbc3be9cb8c710',
        serviceType: 'walking',
        startDate: '2026-01-25T10:00:00.000Z',
        endDate: '2026-01-25T12:00:00.000Z',
        address: 'г. Москва, ул. Примерная, д. 1',
        price: 500,
        status: 'pending',
        createdAt: '2026-01-21T18:45:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Необходима авторизация' })
  @ApiResponse({ status: 403, description: 'Доступно только клиентам' })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  create(@CurrentUser() user: any, @Body() createRequestDto: CreateRequestDto) {
    return this.requestsService.create(user.userId, createRequestDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Получить список всех заявок',
    description:
      'Возвращает список заявок с возможностью фильтрации по статусу',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: RequestStatus,
    description: 'Фильтр по статусу',
  })
  @ApiResponse({ status: 200, description: 'Список заявок' })
  findAll(@Query('status') status?: RequestStatus) {
    return this.requestsService.findAll(status ? { status } : undefined);
  }

  @Get('pending')
  @ApiOperation({
    summary: 'Получить список заявок в ожидании',
    description: 'Возвращает все заявки со статусом "pending" для петситтеров',
  })
  @ApiResponse({ status: 200, description: 'Список доступных заявок' })
  findPending() {
    return this.requestsService.findPending();
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Получить свои заявки',
    description:
      'Для клиента - созданные заявки, для петситтера - принятые заявки',
  })
  @ApiResponse({ status: 200, description: 'Список ваших заявок' })
  @ApiResponse({ status: 401, description: 'Необходима авторизация' })
  findMy(@CurrentUser() user: any) {
    if (user.role === 'client') {
      return this.requestsService.findByClient(user.userId);
    } else {
      return this.requestsService.findByPetsitter(user.userId);
    }
  }

  @Get('statistics')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Получить статистику по заявкам',
    description: 'Статистика заявок текущего пользователя',
  })
  @ApiResponse({
    status: 200,
    description: 'Статистика',
    schema: {
      example: {
        total: 10,
        byStatus: {
          pending: 2,
          accepted: 1,
          in_progress: 3,
          completed: 3,
          cancelled: 1,
        },
      },
    },
  })
  getStatistics(@CurrentUser() user: any) {
    return this.requestsService.getStatistics(user.userId, user.role);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Получить информацию о заявке',
    description: 'Возвращает подробную информацию о заявке по ID',
  })
  @ApiParam({ name: 'id', description: 'ID заявки' })
  @ApiResponse({ status: 200, description: 'Информация о заявке' })
  @ApiResponse({ status: 404, description: 'Заявка не найдена' })
  findOne(@Param('id') id: string) {
    return this.requestsService.findById(id);
  }

  @Post(':id/accept')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PETSITTER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Принять заявку',
    description:
      'Петситтер принимает заявку в работу. Доступно только петситтерам.',
  })
  @ApiParam({ name: 'id', description: 'ID заявки' })
  @ApiResponse({ status: 200, description: 'Заявка принята' })
  @ApiResponse({ status: 401, description: 'Необходима авторизация' })
  @ApiResponse({ status: 403, description: 'Доступно только петситтерам' })
  @ApiResponse({
    status: 400,
    description: 'Заявка уже принята или недоступна',
  })
  acceptRequest(@Param('id') id: string, @CurrentUser() user: any) {
    return this.requestsService.acceptRequest(id, user.userId);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Обновить статус заявки',
    description:
      'Изменение статуса заявки. Доступно клиенту и петситтеру с ограничениями.',
  })
  @ApiParam({ name: 'id', description: 'ID заявки' })
  @ApiResponse({ status: 200, description: 'Статус обновлен' })
  @ApiResponse({ status: 401, description: 'Необходима авторизация' })
  @ApiResponse({ status: 403, description: 'Нет прав для изменения статуса' })
  @ApiResponse({ status: 400, description: 'Недопустимый переход статуса' })
  updateStatus(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() updateRequestDto: UpdateRequestDto,
  ) {
    return this.requestsService.updateStatus(
      id,
      user.userId,
      user.role,
      updateRequestDto,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENT)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Отменить заявку',
    description: 'Отмена заявки клиентом. Доступно только владельцу заявки.',
  })
  @ApiParam({ name: 'id', description: 'ID заявки' })
  @ApiResponse({ status: 204, description: 'Заявка отменена' })
  @ApiResponse({ status: 401, description: 'Необходима авторизация' })
  @ApiResponse({
    status: 403,
    description: 'Только клиент может отменить заявку',
  })
  @ApiResponse({
    status: 400,
    description: 'Нельзя отменить завершенную заявку',
  })
  cancelRequest(@Param('id') id: string, @CurrentUser() user: any) {
    return this.requestsService.cancelRequest(id, user.userId);
  }
}
