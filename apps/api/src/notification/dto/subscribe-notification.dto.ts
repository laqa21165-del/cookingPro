import { IsString } from 'class-validator';

export class SubscribeNotificationDto {
  @IsString()
  templateId!: string;
}
