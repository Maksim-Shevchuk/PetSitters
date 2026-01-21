import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Review, ReviewDocument } from '../schemas';
import { RequestsService } from '../requests/requests.service';
import { UsersService } from '../users/users.service';
import { CreateReviewDto } from './dto';
import { RequestStatus } from '../schemas';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
    private requestsService: RequestsService,
    private usersService: UsersService,
  ) {}

  async create(
    clientId: string,
    createReviewDto: CreateReviewDto,
  ): Promise<Review> {
    // Проверяем, что заявка существует
    const request = await this.requestsService.findById(
      createReviewDto.requestId,
    );

    // Проверяем, что клиент является владельцем заявки
    if (request.clientId.toString() !== clientId) {
      throw new ForbiddenException(
        'Вы можете оставлять отзывы только на свои заявки',
      );
    }

    // Проверяем, что заявка завершена
    if (request.status !== RequestStatus.COMPLETED) {
      throw new BadRequestException(
        'Отзыв можно оставить только на завершенную заявку',
      );
    }

    // Проверяем, что у заявки есть петситтер
    if (!request.petsitterId) {
      throw new BadRequestException('У заявки нет петситтера');
    }

    // Проверяем, что отзыв еще не оставлен
    const existingReview = await this.reviewModel.findOne({
      requestId: createReviewDto.requestId,
    });
    if (existingReview) {
      throw new BadRequestException('Отзыв на эту заявку уже оставлен');
    }

    // Создаем отзыв
    const newReview = new this.reviewModel({
      ...createReviewDto,
      clientId,
      petsitterId: request.petsitterId,
    });

    const savedReview = await newReview.save();

    // Обновляем рейтинг петситтера
    await this.updatePetsitterRating(request.petsitterId.toString());

    return savedReview;
  }

  async findAll(filters?: {
    petsitterId?: string;
    isVisible?: boolean;
  }): Promise<Review[]> {
    const query: any = {};

    if (filters?.petsitterId) {
      query.petsitterId = filters.petsitterId;
    }

    if (filters?.isVisible !== undefined) {
      query.isVisible = filters.isVisible;
    }

    return this.reviewModel
      .find(query)
      .populate('clientId', 'name')
      .populate('petsitterId', 'name rating reviewsCount')
      .populate('requestId', 'serviceType startDate endDate')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByPetsitter(petsitterId: string): Promise<Review[]> {
    return this.findAll({ petsitterId, isVisible: true });
  }

  async findById(id: string): Promise<Review> {
    const review = await this.reviewModel
      .findById(id)
      .populate('clientId', 'name')
      .populate('petsitterId', 'name rating reviewsCount')
      .populate('requestId', 'serviceType startDate endDate')
      .exec();

    if (!review) {
      throw new NotFoundException('Отзыв не найден');
    }

    return review;
  }

  async toggleVisibility(
    reviewId: string,
    petsitterId: string,
  ): Promise<Review> {
    const review = await this.findById(reviewId);

    // Только петситтер, на которого оставлен отзыв, может скрыть/показать его
    if (review.petsitterId.toString() !== petsitterId) {
      throw new ForbiddenException(
        'Вы можете управлять только своими отзывами',
      );
    }

    const updatedReview = await this.reviewModel
      .findByIdAndUpdate(
        reviewId,
        { isVisible: !review.isVisible },
        { new: true },
      )
      .populate('clientId', 'name')
      .populate('petsitterId', 'name rating')
      .exec();

    return updatedReview!;
  }

  async getStatistics(petsitterId: string): Promise<any> {
    const reviews = await this.reviewModel.find({ petsitterId }).exec();

    if (reviews.length === 0) {
      return {
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: {
          5: 0,
          4: 0,
          3: 0,
          2: 0,
          1: 0,
        },
      };
    }

    const ratingDistribution = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    let totalRating = 0;
    reviews.forEach((review) => {
      totalRating += review.rating;
      ratingDistribution[review.rating as keyof typeof ratingDistribution]++;
    });

    return {
      totalReviews: reviews.length,
      averageRating: +(totalRating / reviews.length).toFixed(2),
      ratingDistribution,
    };
  }

  private async updatePetsitterRating(petsitterId: string): Promise<void> {
    const reviews = await this.reviewModel.find({ petsitterId }).exec();

    if (reviews.length === 0) {
      return;
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = +(totalRating / reviews.length).toFixed(2);

    await this.usersService.updateRating(
      petsitterId,
      averageRating,
      reviews.length,
    );
  }
}
