import { Module } from '@nestjs/common';
import { BindingController } from './binding.controller';
import { BindingService } from './binding.service';

@Module({
  controllers: [BindingController],
  providers: [BindingService],
  exports: [BindingService],
})
export class BindingModule {}
