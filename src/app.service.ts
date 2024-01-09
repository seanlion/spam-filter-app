import { Injectable } from '@nestjs/common';
import { SpamQueryDto } from './dto/spam.dto';

@Injectable()
export class AppService {
  async isSpam(spamQueryDto: SpamQueryDto): Promise<boolean> {
    return true;
  }
}
