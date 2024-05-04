import { Injectable, ConflictException } from '@nestjs/common';
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
}
