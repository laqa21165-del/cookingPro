import { IsArray, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class CreateOrderItemDto {
  @IsString()
  menuItemId!: string;

  @Min(1)
  quantity!: number;
}

export class CreateOrderDto {
  @IsString()
  chefId!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];

  @IsString()
  paymentText!: string;
}

export class CompleteOrderDto {
  @IsOptional()
  @IsString()
  chefReply?: string;
}
