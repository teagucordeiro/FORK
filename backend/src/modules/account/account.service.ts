import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Account } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { AccountEntity, AccountOptions } from './account.entity';
import { addPointsToBonusAccount } from 'src/utils/accounts';
@Injectable()
export class AccountService {
  constructor(private prisma: PrismaService) {}
  async createAccount(number: number, type: AccountOptions) {
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

    let newAccount: AccountEntity = {
      number: number,
      balance: 0,
      type,
    };

    if (type === 'Bonus') {
      newAccount = {
        ...newAccount,
        bonusScore: 10,
      };
    }

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

  async creditToAccount(number: number, amount: number) {
    const account = await this.getAccountByNumber(number);

    let data: Account = {
      ...account,
      balance: account.balance + amount,
    };

    if (account.type === 'Bonus') {
      data = {
        ...data,
        bonusScore: addPointsToBonusAccount({
          currentBonusAccount: account.bonusScore,
          operationType: 'credit',
          value: amount,
        }),
      };
    }

    delete data.id;

    const updatedAccount = await this.prisma.account.update({
      where: { number: account.number },
      data,
    });
    return updatedAccount;
  }

  async transferAmount(from: number, to: number, amount: number) {
    const fromAccount = await this.getAccountByNumber(from);
    const toAccount = await this.getAccountByNumber(to);

    if (!fromAccount) {
      throw new NotFoundException('From account not found.');
    }

    if (!toAccount) {
      throw new NotFoundException('To account not found.');
    }

    let toAccountData: Account = {
      ...toAccount,
      balance: toAccount.balance + amount,
    };

    if (toAccount.type === 'Bonus') {
      toAccountData = {
        ...toAccount,
        bonusScore: addPointsToBonusAccount({
          currentBonusAccount: toAccount.bonusScore,
          operationType: 'transfer',
          value: amount,
        }),
      };
    }

    const updatedFromAccount = await this.prisma.account.update({
      where: { number: fromAccount.number },
      data: {
        balance: fromAccount.balance - amount,
      },
    });

    const toAccountDataWithoutId = toAccountData;
    delete toAccountDataWithoutId.id;

    const updatedToAccount = await this.prisma.account.update({
      where: { number: toAccount.number },
      data: {
        ...toAccountDataWithoutId,
        balance: toAccountDataWithoutId.balance + amount,
      },
    });

    return {
      fromAccount: updatedFromAccount,
      toAccount: updatedToAccount,
    };
  }

  async yieldInterestByAccount(accountNumber: number, interestRate: number) {
    const account = await this.getAccountByNumber(accountNumber);

    const interest = account.balance * (interestRate / 100);
    const newBalance = account.balance + interest;

    return this.prisma.account.update({
      where: {
        id: account.id,
      },
      data: {
        balance: newBalance,
      },
    });
  }

  async yieldInterest(interestRate: number) {
    const savingsAccounts = await this.prisma.account.findMany({
      where: {
        type: 'Saving',
      },
    });

    const updatePromises = savingsAccounts.map((account) => {
      const interest = account.balance * (interestRate / 100);
      const newBalance = account.balance + interest;

      return this.prisma.account.update({
        where: {
          id: account.id,
        },
        data: {
          balance: newBalance,
        },
      });
    });

    return await Promise.all(updatePromises);
  }
}
