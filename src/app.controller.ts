import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { SpamQueryDto } from './dto/spam.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/check_spam')
  async checkSpam(
    @Query('query') spamQueryDto: SpamQueryDto,
  ): Promise<boolean> {
    return await this.appService.isSpam(spamQueryDto);
  }
}
