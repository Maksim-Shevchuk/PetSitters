import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type RequestDocument = HydratedDocument<Request>;

export enum ServiceType {
  WALKING = 'walking',
  CARE = 'care',
  OVERNIGHT = 'overnight',
  GROOMING = 'grooming',
}

export enum RequestStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Schema({ timestamps: true })
export class Request {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  clientId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Pet', required: true })
  petId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  petsitterId?: Types.ObjectId;

  @Prop({ required: true, enum: ServiceType, type: String })
  serviceType: ServiceType;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop()
  description?: string;

  @Prop()
  address: string;

  @Prop({ required: true })
  price: number;

  @Prop({
    required: true,
    enum: RequestStatus,
    type: String,
    default: RequestStatus.PENDING,
  })
  status: RequestStatus;

  @Prop()
  notes?: string;

  @Prop()
  completedAt?: Date;
}

export const RequestSchema = SchemaFactory.createForClass(Request);
