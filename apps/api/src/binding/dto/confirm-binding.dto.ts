import { IsString } from 'class-validator';

export class ConfirmBindingDto {
  @IsString()
  token!: string;
}
