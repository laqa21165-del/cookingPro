import { IsOptional, IsString } from 'class-validator';

export class CreateReviewDto {
  @IsString()
  orderId!: string;

  @IsString()
  content!: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}
