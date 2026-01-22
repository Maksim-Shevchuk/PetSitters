import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

export enum UserRole {
  CLIENT = 'client',
  PETSITTER = 'petsitter',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true, enum: UserRole, type: String })
  role: UserRole;

  @Prop()
  address?: string;

  @Prop()
  bio?: string;

  @Prop({ default: 0 })
  rating: number;

  @Prop({ default: 0 })
  reviewsCount: number;

  @Prop({ default: true })
  isActive: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
