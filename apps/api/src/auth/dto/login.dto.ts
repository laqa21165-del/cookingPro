import { IsOptional, IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  code!: string;

  @IsOptional()
  @IsString()
  nickname?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  mockOpenId?: string;
}
