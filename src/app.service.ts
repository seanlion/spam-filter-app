import { Injectable } from '@nestjs/common';
import { SpamQueryDto } from './dto/spam.dto';
import axios from 'axios';
import { JSDOM } from 'jsdom';

@Injectable()
export class AppService {
  async isSpam(spamQueryDto: SpamQueryDto): Promise<boolean> {
    const { content, spamLinkDomains, redirectionDepth } = spamQueryDto;

    const urls = this.extractURLsFromContent(content);

    for (const url of urls) {
      const finalUrl = await this.followRedirections(url, redirectionDepth);
      if (this.checkIfSpam(finalUrl, spamLinkDomains)) {
        return true;
      }
    }

    return false;
  }

  private extractURLsFromContent(content: string): RegExpMatchArray | [] {
    return content.match(/https?:\/\/[^ ]+/g) ?? [];
  }

  private checkIfSpam(url: string, spamLinkDomains: string[]): boolean {
    return true;
  }

  private getDomain(url: string): string {
    return '';
  }

  private async followRedirections(
    url: string,
    depth: number,
  ): Promise<string> {
    return '';
  }
}
