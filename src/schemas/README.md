# MongoDB Schemas

Модели данных для хранения в MongoDB.

## Структура

### User (Пользователь)
Представляет клиентов и петситтеров в системе.

**Поля:**
- `name` - имя пользователя
- `email` - email (уникальный)
- `password` - хешированный пароль
- `phone` - номер телефона
- `role` - роль (`client` или `petsitter`)
- `address` - адрес (опционально)
- `bio` - информация о себе (опционально)
- `rating` - средний рейтинг (для петситтеров)
- `reviewsCount` - количество отзывов
- `isActive` - активен ли аккаунт

### Pet (Животное)
Информация о животных клиентов.

**Поля:**
- `ownerId` - ID владельца (ссылка на User)
- `name` - кличка животного
- `type` - тип (`dog`, `cat`, `bird`, `rabbit`, `other`)
- `breed` - порода
- `age` - возраст
- `size` - размер (`small`, `medium`, `large`)
- `weight` - вес (опционально)
- `specialNeeds` - особые потребности (опционально)
- `medicalInfo` - медицинская информация (опционально)
- `photo` - URL фотографии (опционально)
- `isActive` - активна ли карточка

### Request (Заявка)
Заявки на услуги по уходу за животными.

**Поля:**
- `clientId` - ID клиента (ссылка на User)
- `petId` - ID животного (ссылка на Pet)
- `petsitterId` - ID петситтера (ссылка на User, опционально)
- `serviceType` - тип услуги (`walking`, `care`, `overnight`, `grooming`)
- `startDate` - дата начала
- `endDate` - дата окончания
- `description` - описание (опционально)
- `address` - адрес оказания услуги
- `price` - стоимость
- `status` - статус (`pending`, `accepted`, `in_progress`, `completed`, `cancelled`)
- `notes` - заметки (опционально)
- `completedAt` - дата завершения (опционально)

### Review (Отзыв)
Отзывы клиентов о петситтерах.

**Поля:**
- `requestId` - ID заявки (ссылка на Request)
- `clientId` - ID клиента (ссылка на User)
- `petsitterId` - ID петситтера (ссылка на User)
- `rating` - оценка (от 1 до 5)
- `comment` - текст отзыва (опционально)
- `isVisible` - виден ли отзыв

## Использование

### Подключение модуля

```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema, Pet, PetSchema, Request, RequestSchema, Review, ReviewSchema } from './schemas';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Pet.name, schema: PetSchema },
      { name: Request.name, schema: RequestSchema },
      { name: Review.name, schema: ReviewSchema },
    ]),
  ],
})
export class YourModule {}
```

### Пример использования в сервисе

```typescript
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async create(createUserDto: any): Promise<User> {
    const createdUser = new this.userModel(createUserDto);
    return createdUser.save();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findById(id: string): Promise<User> {
    return this.userModel.findById(id).exec();
  }
}
```

## Индексы

Рекомендуемые индексы для оптимизации:

- `User`: email (unique), role
- `Pet`: ownerId, isActive
- `Request`: clientId, petsitterId, status, startDate
- `Review`: petsitterId, isVisible

## Необходимые зависимости

```bash
npm install @nestjs/mongoose mongoose
npm install @nestjs/config
```

## Переменные окружения

Добавьте в `.env` или `local.env`:

```
MONGODB_URI=mongodb://localhost:27017/petsitters
```
