import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateReservationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  customer_name: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9+\-\s()]{7,30}$/)
  phone: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  reservation_date: string;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  reservation_time: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  guest_count: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  special_request?: string;
}
