import { Body, Controller, Post } from '@nestjs/common';
import { MailService } from './mail.service';

@Controller('test-mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post()
  async test(@Body() body: any) {
    return this.mailService.sendInternalAlert(body.to, body.payload);
  }
}