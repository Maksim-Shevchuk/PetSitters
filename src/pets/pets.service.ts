import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Pet, PetDocument } from '../schemas';
import { CreatePetDto, UpdatePetDto } from './dto';

@Injectable()
export class PetsService {
  constructor(@InjectModel(Pet.name) private petModel: Model<PetDocument>) {}

  async create(ownerId: string, createPetDto: CreatePetDto): Promise<Pet> {
    const newPet = new this.petModel({
      ...createPetDto,
      ownerId,
    });
    return newPet.save();
  }

  async findAll(): Promise<Pet[]> {
    return this.petModel
      .find({ isActive: true })
      .populate('ownerId', 'name email')
      .exec();
  }

  async findByOwner(ownerId: string): Promise<Pet[]> {
    return this.petModel.find({ ownerId, isActive: true }).exec();
  }

  async findById(id: string): Promise<Pet> {
    const pet = await this.petModel
      .findById(id)
      .populate('ownerId', 'name email phone')
      .exec();
    if (!pet) {
      throw new NotFoundException('Животное не найдено');
    }
    return pet;
  }

  async update(
    id: string,
    userId: string,
    updatePetDto: UpdatePetDto,
  ): Promise<Pet> {
    const pet = await this.findById(id);

    // Проверяем, что пользователь является владельцем
    if (pet.ownerId.toString() !== userId) {
      throw new ForbiddenException(
        'Вы можете редактировать только своих животных',
      );
    }

    const updatedPet = await this.petModel
      .findByIdAndUpdate(id, updatePetDto, { new: true })
      .populate('ownerId', 'name email phone')
      .exec();

    if (!updatedPet) {
      throw new NotFoundException('Животное не найдено');
    }

    return updatedPet;
  }

  async remove(id: string, userId: string): Promise<void> {
    const pet = await this.findById(id);

    // Проверяем, что пользователь является владельцем
    if (pet.ownerId.toString() !== userId) {
      throw new ForbiddenException('Вы можете удалять только своих животных');
    }

    // Мягкое удаление - просто деактивируем
    await this.petModel.findByIdAndUpdate(id, { isActive: false });
  }

  async checkOwnership(petId: string, userId: string): Promise<boolean> {
    const pet = await this.petModel.findById(petId).exec();
    if (!pet) {
      throw new NotFoundException('Животное не найдено');
    }
    return pet.ownerId.toString() === userId;
  }
}
