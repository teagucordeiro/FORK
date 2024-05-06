import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class AccountService {
  constructor(private prisma: PrismaService) {}

  async createAccount(number: number) {
    const existingAccount = await this.prisma.account.findFirst({
      where: {
        number,
      },
    });

    if (existingAccount) {
      throw new ConflictException(
        'There is already an account created with this number.',
      );
    }

    const newAccount = {
      number: number,
      balance: 0,
    };

    return this.prisma.account.create({
      data: newAccount,
    });
  }

  async getAccountByNumber(number: number) {
    const account = await this.prisma.account.findFirst({
      where: {
        number,
      },
    });

    if (!account) {
      throw new NotFoundException('Account not found.');
    }

    return account;
  }

  async debitFromAccount(number: number, amount: number) {
    const account = await this.getAccountByNumber(number);

    const updatedAccount = await this.prisma.account.update({
      where: { number: account.number },
      data: {
        balance: account.balance - amount,
      },
    });

    return updatedAccount;
  }
}
