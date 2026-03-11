import { IsOptional, IsString, MaxLength } from 'class-validator';

export class AcknowledgeReservationDto {
  @IsOptional()
  @IsString()
  @MaxLength(300)
  admin_note?: string;
}
