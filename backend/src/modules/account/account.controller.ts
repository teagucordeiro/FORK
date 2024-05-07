import {
  Controller,
  Body,
  Get,
  HttpStatus,
  Post,
  Param,
  BadRequestException,
  Patch,
} from '@nestjs/common';
import { AccountService } from './account.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('accounts')
@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}
  @Post('create')
  async createAccount(@Body('number') number: string) {
    if (!number) {
      throw new BadRequestException('Account number is required.');
    }

    const account = await this.accountService.createAccount(Number(number));
    return {
      status: HttpStatus.CREATED,
      message: 'Account created!',
      account,
    };
  }

  @Get(':number/balance')
  async getAccountBalance(@Param('number') number: string) {
    const account = await this.accountService.getAccountByNumber(
      Number(number),
    );
    return {
      status: HttpStatus.OK,
      balance: account.balance,
    };
  }

  @Patch(':number/debit')
  async debitFromAccount(
    @Param('number') number: string,
    @Body('amount') amount: string,
  ) {
    const updatedAccount = await this.accountService.debitFromAccount(
      Number(number),
      Number(amount),
    );

    return {
      status: HttpStatus.OK,
      message: 'Amount debited from account successfully!',
      updatedAccount: {
        number: updatedAccount.number,
        balance: updatedAccount.balance,
      },
    };
  }

  @Patch(':number/credit')
  async creditToAccount(
    @Param('number') number: string,
    @Body('amount') amount: string,
  ) {
    if (!amount) {
      throw new BadRequestException('Amount is required.');
    }

    const updatedAccount = await this.accountService.creditToAccount(
      Number(number),
      Number(amount),
    );

    return {
      status: HttpStatus.OK,
      message: 'Amount credited to account successfully!',
      updatedAccount: {
        number: updatedAccount.number,
        balance: updatedAccount.balance,
      },
    };
  }

  @Patch(':fromNumber/transfer')
  async transferAmount(
    @Param('fromNumber') fromNumber: string,
    @Body('toNumber') toNumber: string,
    @Body('amount') amount: string,
  ) {
    if (!toNumber || !amount) {
      throw new BadRequestException(
        'To account number and amount are required.',
      );
    }

    const updatedAccounts = await this.accountService.transferAmount(
      Number(fromNumber),
      Number(toNumber),
      Number(amount),
    );

    return {
      status: HttpStatus.OK,
      message: 'Amount transferred successfully!',
      updatedAccounts,
    };
  }
}
