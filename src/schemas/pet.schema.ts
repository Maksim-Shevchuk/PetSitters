import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PetDocument = HydratedDocument<Pet>;

export enum PetType {
  DOG = 'dog',
  CAT = 'cat',
  BIRD = 'bird',
  RABBIT = 'rabbit',
  OTHER = 'other',
}

export enum PetSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
}

@Schema({ timestamps: true })
export class Pet {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  ownerId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: PetType, type: String })
  type: PetType;

  @Prop({ required: true })
  breed: string;

  @Prop({ required: true })
  age: number;

  @Prop({ required: true, enum: PetSize, type: String })
  size: PetSize;

  @Prop()
  weight?: number;

  @Prop()
  specialNeeds?: string;

  @Prop()
  medicalInfo?: string;

  @Prop()
  photo?: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const PetSchema = SchemaFactory.createForClass(Pet);
