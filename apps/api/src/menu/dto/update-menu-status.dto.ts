import { IsIn } from 'class-validator';

export class UpdateMenuStatusDto {
  @IsIn(['active', 'inactive'])
  status!: 'active' | 'inactive';
}
