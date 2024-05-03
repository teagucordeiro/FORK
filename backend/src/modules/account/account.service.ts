import { Injectable, ConflictException } from '@nestjs/common';

@Injectable()
export class AccountService {
  private accounts = [];

  createAccount(number: number) {
    const existingAccount = this.accounts.find(
      (account) => account.number === number,
    );
    if (existingAccount) {
      throw new ConflictException(
        'There is already an account created with this number.',
      );
    }
    const newAccount = {
      number: number,
      balance: 0,
    };
    this.accounts.push(newAccount);
    return newAccount;
  }
}
