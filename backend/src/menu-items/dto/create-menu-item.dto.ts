import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMenuItemDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  price: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  category_id: number;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  is_available?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  is_featured?: boolean;
}
