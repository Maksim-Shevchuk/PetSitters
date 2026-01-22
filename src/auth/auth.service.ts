import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto, RegisterDto } from './dto';
import { User } from '../schemas';

export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    // Создаем пользователя
    const user = await this.usersService.create(registerDto);

    // Генерируем токен
    const payload = {
      sub: (user as any)._id,
      email: user.email,
      role: user.role,
    };
    const access_token = await this.jwtService.signAsync(payload);

    return {
      access_token,
      user: {
        id: (user as any)._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    // Ищем пользователя
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    // Проверяем пароль
    const isPasswordValid = await this.usersService.validatePassword(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    // Проверяем активность аккаунта
    if (!user.isActive) {
      throw new UnauthorizedException('Аккаунт деактивирован');
    }

    // Генерируем токен
    const payload = {
      sub: (user as any)._id,
      email: user.email,
      role: user.role,
    };
    const access_token = await this.jwtService.signAsync(payload);

    return {
      access_token,
      user: {
        id: (user as any)._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async validateUser(userId: string): Promise<User> {
    return this.usersService.findById(userId);
  }
}
