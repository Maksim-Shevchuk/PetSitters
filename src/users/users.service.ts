import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(userData: Partial<User>): Promise<User> {
    // Проверяем, существует ли уже пользователь с таким email
    const existingUser = await this.userModel.findOne({
      email: userData.email,
    });
    if (existingUser) {
      throw new ConflictException('Пользователь с таким email уже существует');
    }

    if (!userData.password) {
      throw new ConflictException('Пароль обязателен');
    }

    // Хешируем пароль
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    // Создаем пользователя
    const newUser = new this.userModel({
      ...userData,
      password: hashedPassword,
    });

    return newUser.save();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findById(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }
    return user;
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find({ isActive: true }).exec();
  }

  async findPetsitters(): Promise<User[]> {
    return this.userModel.find({ role: 'petsitter', isActive: true }).exec();
  }

  async validatePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async updateRating(
    userId: string,
    newRating: number,
    reviewsCount: number,
  ): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, {
      rating: newRating,
      reviewsCount,
    });
  }

  async updateProfile(
    userId: string,
    updateData: Partial<User>,
  ): Promise<User> {
    // Разрешенные для обновления поля
    const allowedFields: (keyof User)[] = ['name', 'phone', 'address', 'bio'];
    const updates: Partial<User> = {};

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        (updates as Record<string, unknown>)[field] = updateData[field];
      }
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(userId, updates as Record<string, unknown>, {
        new: true,
      })
      .select('-password')
      .exec();

    if (!updatedUser) {
      throw new NotFoundException('Пользователь не найден');
    }

    return updatedUser;
  }

  async deactivate(userId: string): Promise<void> {
    await this.findById(userId); // Проверка существования
    await this.userModel.findByIdAndUpdate(userId, { isActive: false });
  }
}
