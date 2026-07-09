import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../common/types';
import { ConfirmBindingDto } from './dto/confirm-binding.dto';
import { ShareBindingDto } from './dto/share-binding.dto';
import { BindingService } from './binding.service';

@ApiTags('binding')
@ApiBearerAuth()
@Controller('bindings')
export class BindingController {
  constructor(private readonly bindingService: BindingService) {}

  @Get()
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.bindingService.listForUser(user.userId);
  }

  @Post('share')
  share(@CurrentUser() user: AuthenticatedUser, @Body() _dto: ShareBindingDto) {
    return this.bindingService.createShareLink(user.userId);
  }

  @Post('confirm')
  confirm(@CurrentUser() user: AuthenticatedUser, @Body() dto: ConfirmBindingDto) {
    return this.bindingService.confirmShareLink(user.userId, dto.token);
  }

  @Delete(':chefId')
  remove(@CurrentUser() user: AuthenticatedUser, @Param('chefId') chefId: string) {
    return this.bindingService.removeBinding(user.userId, chefId);
  }
}
