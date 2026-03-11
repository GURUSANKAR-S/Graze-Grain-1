import { IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateAvailabilityDto {
  @Type(() => Boolean)
  @IsBoolean()
  is_available: boolean;
}
