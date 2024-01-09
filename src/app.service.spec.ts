import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';
import axios from 'axios';
import { SpamQueryDto } from './dto/spam.dto';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('isSpam', () => {
  let service: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppService],
    }).compile();

    service = module.get<AppService>(AppService);
    mockedAxios.get.mockReset();
  });
  it('should return false for content without links', async () => {
    const spamQueryDto = new SpamQueryDto();
    spamQueryDto.content = 'Test string without any links';
    spamQueryDto.spamLinkDomains = ['www.spam.com'];
    spamQueryDto.redirectionDepth = 2;
    await expect(service.isSpam(spamQueryDto)).resolves.toBe(false);
  });

  it('should return true for content with a spam link', async () => {
    const spamQueryDto = new SpamQueryDto();
    spamQueryDto.content = 'Check https://www.spam.com';
    spamQueryDto.spamLinkDomains = ['spam.com'];
    spamQueryDto.redirectionDepth = 0;

    mockedAxios.get.mockResolvedValueOnce({
      status: 200,
      data: 'Mocked response',
    });

    await expect(service.isSpam(spamQueryDto)).resolves.toBe(true);
  });

  it('should follow redirects and identify spam', async () => {
    const spamQueryDto = new SpamQueryDto();
    spamQueryDto.content = 'Check this site https://redirect.to/spam';
    spamQueryDto.spamLinkDomains = ['spam.com'];
    spamQueryDto.redirectionDepth = 2;

    mockedAxios.get.mockResolvedValueOnce({
      status: 302,
      headers: { location: 'https://www.spam.com' },
    });

    mockedAxios.get.mockResolvedValueOnce({
      status: 200,
      data: 'Mocked response',
    });

    await expect(service.isSpam(spamQueryDto)).resolves.toBe(true);
  });

  it('should detect spam link in HTML content', async () => {
    const spamQueryDto = new SpamQueryDto();
    spamQueryDto.content = 'Check spam https://github.com';
    spamQueryDto.spamLinkDomains = ['docs.github.com'];
    spamQueryDto.redirectionDepth = 1;

    mockedAxios.get.mockResolvedValueOnce({
      status: 200,
      data: '<html><body><a href="https://docs.github.com">GitHub Docs</a></body></html>',
    });

    await expect(service.isSpam(spamQueryDto)).resolves.toBe(true);
  });
});
