import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Request,
  RequestDocument,
  RequestStatus,
} from '../schemas';
import { PetsService } from '../pets/pets.service';
import { CreateRequestDto, UpdateRequestDto } from './dto';

@Injectable()
export class RequestsService {
  constructor(
    @InjectModel(Request.name) private requestModel: Model<RequestDocument>,
    private petsService: PetsService,
  ) {}

  async create(
    clientId: string,
    createRequestDto: CreateRequestDto,
  ): Promise<Request> {
    // Проверяем, что животное существует и принадлежит клиенту
    const isOwner = await this.petsService.checkOwnership(
      createRequestDto.petId,
      clientId,
    );
    if (!isOwner) {
      throw new ForbiddenException(
        'Вы можете создавать заявки только для своих животных',
      );
    }

    // Проверяем даты
    const startDate = new Date(createRequestDto.startDate);
    const endDate = new Date(createRequestDto.endDate);

    if (endDate <= startDate) {
      throw new BadRequestException(
        'Дата окончания должна быть позже даты начала',
      );
    }

    if (startDate < new Date()) {
      throw new BadRequestException('Дата начала не может быть в прошлом');
    }

    const newRequest = new this.requestModel({
      ...createRequestDto,
      clientId,
      status: RequestStatus.PENDING,
    });

    return newRequest.save();
  }

  async findAll(filters?: { status?: RequestStatus }): Promise<Request[]> {
    const query: any = {};
    if (filters?.status) {
      query.status = filters.status;
    }

    return this.requestModel
      .find(query)
      .populate('clientId', 'name email phone')
      .populate('petId', 'name type breed age')
      .populate('petsitterId', 'name email phone rating')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findPending(): Promise<Request[]> {
    return this.requestModel
      .find({ status: RequestStatus.PENDING })
      .populate('clientId', 'name email phone')
      .populate('petId', 'name type breed age size')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByClient(clientId: string): Promise<Request[]> {
    return this.requestModel
      .find({ clientId })
      .populate('petId', 'name type breed')
      .populate('petsitterId', 'name rating')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByPetsitter(petsitterId: string): Promise<Request[]> {
    return this.requestModel
      .find({ petsitterId })
      .populate('clientId', 'name email phone')
      .populate('petId', 'name type breed age')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findById(id: string): Promise<Request> {
    const request = await this.requestModel
      .findById(id)
      .populate('clientId', 'name email phone address')
      .populate('petId')
      .populate('petsitterId', 'name email phone rating reviewsCount')
      .exec();

    if (!request) {
      throw new NotFoundException('Заявка не найдена');
    }

    return request;
  }

  async acceptRequest(
    requestId: string,
    petsitterId: string,
  ): Promise<Request> {
    const request = await this.findById(requestId);

    if (request.status !== RequestStatus.PENDING) {
      throw new BadRequestException(
        'Можно принимать только заявки в статусе "ожидает"',
      );
    }

    if (request.petsitterId) {
      throw new BadRequestException(
        'Эта заявка уже принята другим петситтером',
      );
    }

    const updatedRequest = await this.requestModel
      .findByIdAndUpdate(
        requestId,
        {
          petsitterId,
          status: RequestStatus.ACCEPTED,
        },
        { new: true },
      )
      .populate('clientId', 'name email phone')
      .populate('petId', 'name type breed')
      .populate('petsitterId', 'name rating')
      .exec();

    return updatedRequest!;
  }

  async updateStatus(
    requestId: string,
    userId: string,
    userRole: string,
    updateRequestDto: UpdateRequestDto,
  ): Promise<Request> {
    const request = await this.findById(requestId);

    // Проверяем права доступа
    const isClient = request.clientId.toString() === userId;
    const isPetsitter = request.petsitterId?.toString() === userId;

    if (!isClient && !isPetsitter) {
      throw new ForbiddenException('Вы можете обновлять только свои заявки');
    }

    // Валидация переходов статусов
    if (updateRequestDto.status) {
      this.validateStatusTransition(
        request.status,
        updateRequestDto.status,
        userRole,
      );
    }

    // Если заявка завершается, добавляем дату завершения
    const updateData: any = { ...updateRequestDto };
    if (updateRequestDto.status === RequestStatus.COMPLETED) {
      updateData.completedAt = new Date();
    }

    const updatedRequest = await this.requestModel
      .findByIdAndUpdate(requestId, updateData, { new: true })
      .populate('clientId', 'name email')
      .populate('petId', 'name type')
      .populate('petsitterId', 'name rating')
      .exec();

    return updatedRequest!;
  }

  async cancelRequest(requestId: string, userId: string): Promise<void> {
    const request = await this.findById(requestId);

    // Только клиент может отменить заявку
    if (request.clientId.toString() !== userId) {
      throw new ForbiddenException('Только клиент может отменить заявку');
    }

    // Нельзя отменить завершенную заявку
    if (request.status === RequestStatus.COMPLETED) {
      throw new BadRequestException('Нельзя отменить завершенную заявку');
    }

    await this.requestModel.findByIdAndUpdate(requestId, {
      status: RequestStatus.CANCELLED,
    });
  }

  private validateStatusTransition(
    currentStatus: RequestStatus,
    newStatus: RequestStatus,
    userRole: string,
  ): void {
    const validTransitions: Record<RequestStatus, RequestStatus[]> = {
      [RequestStatus.PENDING]: [
        RequestStatus.ACCEPTED,
        RequestStatus.CANCELLED,
      ],
      [RequestStatus.ACCEPTED]: [
        RequestStatus.IN_PROGRESS,
        RequestStatus.CANCELLED,
      ],
      [RequestStatus.IN_PROGRESS]: [
        RequestStatus.COMPLETED,
        RequestStatus.CANCELLED,
      ],
      [RequestStatus.COMPLETED]: [],
      [RequestStatus.CANCELLED]: [],
    };

    const allowedStatuses = validTransitions[currentStatus];
    if (!allowedStatuses.includes(newStatus)) {
      throw new BadRequestException(
        `Недопустимый переход статуса из "${currentStatus}" в "${newStatus}"`,
      );
    }

    // Только петситтер может менять статус на "в работе" или "завершено"
    if (
      (newStatus === RequestStatus.IN_PROGRESS ||
        newStatus === RequestStatus.COMPLETED) &&
      userRole !== 'petsitter'
    ) {
      throw new ForbiddenException(
        'Только петситтер может изменить статус на "в работе" или "завершено"',
      );
    }
  }

  async getStatistics(userId: string, role: string): Promise<any> {
    const query =
      role === 'client' ? { clientId: userId } : { petsitterId: userId };

    const [total, pending, accepted, inProgress, completed, cancelled] =
      await Promise.all([
        this.requestModel.countDocuments(query),
        this.requestModel.countDocuments({
          ...query,
          status: RequestStatus.PENDING,
        }),
        this.requestModel.countDocuments({
          ...query,
          status: RequestStatus.ACCEPTED,
        }),
        this.requestModel.countDocuments({
          ...query,
          status: RequestStatus.IN_PROGRESS,
        }),
        this.requestModel.countDocuments({
          ...query,
          status: RequestStatus.COMPLETED,
        }),
        this.requestModel.countDocuments({
          ...query,
          status: RequestStatus.CANCELLED,
        }),
      ]);

    return {
      total,
      byStatus: {
        pending,
        accepted,
        in_progress: inProgress,
        completed,
        cancelled,
      },
    };
  }
}
