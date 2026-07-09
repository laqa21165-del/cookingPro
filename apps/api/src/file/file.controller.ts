import { Controller, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../common/types';
import { FileService } from './file.service';

@ApiTags('file')
@ApiBearerAuth()
@Controller('files')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('upload')
  upload(@CurrentUser() user: AuthenticatedUser, @Req() request: any) {
    return this.fileService.upload(user.userId, request);
  }
}
