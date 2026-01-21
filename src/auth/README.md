# API Аутентификации

Модуль для регистрации и входа пользователей (клиентов и петситтеров).

## Эндпоинты

### 1. Регистрация пользователя

**POST** `/auth/register`

#### Тело запроса:
```json
{
  "name": "Иван Иванов",
  "email": "ivan@example.com",
  "password": "password123",
  "phone": "+79001234567",
  "role": "client",
  "address": "г. Москва, ул. Примерная, д. 1",
  "bio": "Люблю животных"
}
```

#### Поля:
- `name` (обязательно) - имя пользователя
- `email` (обязательно) - email (должен быть уникальным)
- `password` (обязательно) - пароль (минимум 6 символов)
- `phone` (обязательно) - номер телефона
- `role` (обязательно) - роль: `client` или `petsitter`
- `address` (опционально) - адрес
- `bio` (опционально) - информация о себе

#### Ответ (200):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Иван Иванов",
    "email": "ivan@example.com",
    "role": "client"
  }
}
```

#### Ошибки:
- `409 Conflict` - пользователь с таким email уже существует
- `400 Bad Request` - невалидные данные

---

### 2. Вход в систему

**POST** `/auth/login`

#### Тело запроса:
```json
{
  "email": "ivan@example.com",
  "password": "password123"
}
```

#### Ответ (200):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Иван Иванов",
    "email": "ivan@example.com",
    "role": "client"
  }
}
```

#### Ошибки:
- `401 Unauthorized` - неверный email или пароль
- `401 Unauthorized` - аккаунт деактивирован

---

## Использование токена

Полученный `access_token` нужно передавать в заголовке запросов:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Защита роутов

### Требовать авторизацию:
```typescript
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Get('protected')
getProtected() {
  return 'Этот роут доступен только авторизованным пользователям';
}
```

### Требовать определенную роль:
```typescript
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { Roles } from './auth/decorators/roles.decorator';
import { UserRole } from './schemas/user.schema';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.PETSITTER)
@Get('petsitters-only')
getPetsittersOnly() {
  return 'Только для петситтеров';
}
```

### Получить текущего пользователя:
```typescript
import { CurrentUser } from './auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Get('me')
getMe(@CurrentUser() user: any) {
  return user; // { userId: '...', email: '...', role: '...' }
}
```

---

## Примеры запросов

### Регистрация клиента (PowerShell):
```powershell
$body = @{
    name = "Иван Иванов"
    email = "ivan@example.com"
    password = "password123"
    phone = "+79001234567"
    role = "client"
    address = "г. Москва"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3110/auth/register" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

### Регистрация петситтера (curl):
```bash
curl -X POST http://localhost:3110/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Мария Петрова",
    "email": "maria@example.com",
    "password": "password123",
    "phone": "+79009876543",
    "role": "petsitter",
    "bio": "Опыт работы с животными 5 лет"
  }'
```

### Вход (curl):
```bash
curl -X POST http://localhost:3110/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ivan@example.com",
    "password": "password123"
  }'
```

### Использование токена (curl):
```bash
curl http://localhost:3110/some-protected-route \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Безопасность

- Пароли хешируются с помощью bcrypt (10 раундов)
- JWT токены действительны 7 дней
- **ВАЖНО:** Измените `JWT_SECRET` в production на безопасное значение!
