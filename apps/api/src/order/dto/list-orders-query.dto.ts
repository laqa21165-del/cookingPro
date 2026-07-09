import { IsIn, IsOptional } from 'class-validator';

export class ListOrdersQueryDto {
  @IsOptional()
  @IsIn(['customer', 'chef', 'all'])
  role?: 'customer' | 'chef' | 'all';

  @IsOptional()
  @IsIn(['pending', 'completed'])
  status?: 'pending' | 'completed';
}
