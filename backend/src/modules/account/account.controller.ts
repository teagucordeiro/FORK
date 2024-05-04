import { Controller, Body, HttpStatus, Post } from '@nestjs/common';
import { AccountService } from './account.service';

@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}
  @Post('create')
  async createAccount(@Body('number') number: string) {
    const account = await this.accountService.createAccount(Number(number));
    return {
      status: HttpStatus.CREATED,
      message: 'Account created!',
      account,
    };
  }
}
