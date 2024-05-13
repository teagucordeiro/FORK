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
import { AccountOptions } from './account.entity';

@ApiTags('accounts')
@Controller('accounts')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}
  @Post()
  async createAccount(
    @Body('number') number: string,
    @Body('balance') balance: string,
    @Body('type') type: AccountOptions,
  ) {
    if (!number) {
      throw new BadRequestException('Account number is required.');
    }

    if (!type) {
      throw new BadRequestException('Account type is required.');
    }

    const account = await this.accountService.createAccount(
      Number(number),
      type,
      Number(balance),
    );
    return {
      status: HttpStatus.CREATED,
      message: 'Account created!',
      account,
      balance,
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
    if (!number) {
      throw new BadRequestException('Account number is required.');
    }

    if (!amount) {
      throw new BadRequestException('Amount is required.');
    }

    if (Number(amount) < 0) {
      throw new BadRequestException('Amount should be greater than 0.');
    }

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

    if (Number(amount) < 0) {
      throw new BadRequestException('Amount should be greater than 0.');
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

    if (Number(amount) < 0) {
      throw new BadRequestException('Amount should be greater than 0.');
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

  @Patch(':number/yield-interest')
  async yieldInterestByAccount(
    @Param('number') number: number,
    @Body('interestRate') interestRate: number,
  ) {
    if (!interestRate) {
      throw new BadRequestException('Interest rate is required.');
    }

    const updatedAccounts = await this.accountService.yieldInterestByAccount(
      Number(number),
      Number(interestRate),
    );
    return {
      status: HttpStatus.OK,
      message: 'Interest yielded successfully!',
      updatedAccounts,
    };
  }

  @Patch('yield-interest')
  async yieldInterest(@Body('interestRate') interestRate: number) {
    if (!interestRate) {
      throw new BadRequestException('Interest rate is required.');
    }

    const updatedAccounts = await this.accountService.yieldInterest(
      Number(interestRate),
    );
    return {
      status: HttpStatus.OK,
      message: 'Interest yielded successfully!',
      updatedAccounts,
    };
  }
}
