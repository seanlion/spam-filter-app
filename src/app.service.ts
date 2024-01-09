import { Injectable } from '@nestjs/common';
import { SpamQueryDto } from './dto/spam.dto';
import axios from 'axios';

@Injectable()
export class AppService {
  async isSpam(spamQueryDto: SpamQueryDto): Promise<boolean> {
    const { content, spamLinkDomains, redirectionDepth } = spamQueryDto;

    const urls = this.extractURLsFromContent(content);
    const results = await Promise.all(
      urls.map(
        async (url) =>
          await this.checkUrlIsSpam(url, redirectionDepth, spamLinkDomains),
      ),
    );

    return results.some((isSpam) => isSpam);
  }

  private extractURLsFromContent(content: string): RegExpMatchArray | [] {
    return content.match(/https?:\/\/[^ ]+/g) ?? [];
  }

  private async checkUrlIsSpam(
    url: string,
    depth: number,
    spamLinkDomains: string[],
  ): Promise<boolean> {
    const domain = new URL(url).hostname.replace('www.', '');
    if (spamLinkDomains.includes(domain)) {
      return true;
    }
    if (depth === 0) {
      return false;
    }
    try {
      const response = await axios.get(url, {
        maxRedirects: 0,
        validateStatus: () => true,
      });

      if (response.status === 301 || response.status === 302) {
        return this.checkUrlIsSpam(
          response.headers.location,
          depth - 1,
          spamLinkDomains,
        );
      } else {
        const matches = [...response.data.matchAll(/<a href="([^"]*)"/gi)];
        for (const match of matches) {
          const href = match[1];
          return this.checkUrlIsSpam(href, depth - 1, spamLinkDomains);
        }
      }
    } catch (error) {
      console.error('An error occurred while following redirections', error);
    }
    return false;
  }
}
