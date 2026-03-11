import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  display_order?: number;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
