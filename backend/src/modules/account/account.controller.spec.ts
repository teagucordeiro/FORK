import { Test, TestingModule } from '@nestjs/testing';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import {
  BadRequestException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';

describe('AccountController', () => {
  let controller: AccountController;

  const mockAccountService = {
    createAccount: jest.fn(),
    getAccountByNumber: jest.fn(),
    debitFromAccount: jest.fn(),
    creditToAccount: jest.fn(),
    transferAmount: jest.fn(),
    yieldInterestByAccount: jest.fn(),
    yieldInterest: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountController],
      providers: [
        {
          provide: AccountService,
          useValue: mockAccountService,
        },
      ],
    }).compile();

    controller = module.get<AccountController>(AccountController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAccountDetails', () => {
    it('should return account details successfully', async () => {
      const result = { number: 123, balance: 1000, type: 'Saving' };
      mockAccountService.getAccountByNumber.mockResolvedValue(result);

      const response = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await controller.getAccountDetails('123', response as any);

      expect(response.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(response.json).toHaveBeenCalledWith(result);
    });

    it('should throw NotFoundException if account is not found', async () => {
      mockAccountService.getAccountByNumber.mockResolvedValue(null);

      const response = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await expect(
        controller.getAccountDetails('123', response as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAccountBalance', () => {
    it('should return the account balance for Saving account', async () => {
      const result = { number: 123, balance: 1000, type: 'Saving' };
      mockAccountService.getAccountByNumber.mockResolvedValue(result);
      const response = await controller.getAccountBalance('123');
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.balance).toBe(1000);
    });

    it('should return the account balance for Default account', async () => {
      const result = { number: 123, balance: 1000, type: 'Default' };
      mockAccountService.getAccountByNumber.mockResolvedValue(result);
      const response = await controller.getAccountBalance('123');
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.balance).toBe(1000);
    });

    it('should return the account balance for Bonus account', async () => {
      const result = { number: 123, balance: 1000, type: 'Bonus' };
      mockAccountService.getAccountByNumber.mockResolvedValue(result);
      const response = await controller.getAccountBalance('123');
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.balance).toBe(1000);
    });
  });

  describe('creditToAccount', () => {
    it('should throw BadRequestException if amount is not provided', async () => {
      await expect(controller.creditToAccount('123', '')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if amount is negative', async () => {
      await expect(controller.creditToAccount('123', '-100')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should credit amount to Default account successfully', async () => {
      const result = { number: 123, balance: 1100 };
      mockAccountService.creditToAccount.mockResolvedValue(result);
      const response = await controller.creditToAccount('123', '100');
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.message).toBe('Amount credited to account successfully!');
      expect(response.updatedAccount.balance).toBe(1100);
    });

    it('should credit amount to Bonus account and add bonus points successfully', async () => {
      const result = { number: 123, balance: 1100, bonusScore: 15 };
      mockAccountService.creditToAccount.mockResolvedValue(result);
      const response = await controller.creditToAccount('123', '100');
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.message).toBe('Amount credited to account successfully!');
      expect(response.updatedAccount.balance).toBe(1100);
      expect(response.updatedAccount.bonusScore).toBe(15);
    });
  });

  describe('debitFromAccount', () => {
    it('should throw BadRequestException if amount is not provided', async () => {
      await expect(controller.debitFromAccount('123', '')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if amount is negative', async () => {
      await expect(controller.debitFromAccount('123', '-100')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if balance is insufficient', async () => {
      mockAccountService.debitFromAccount.mockRejectedValue(
        new BadRequestException('Insufficient balance.'),
      );
      await expect(controller.debitFromAccount('123', '1000')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should debit amount from account successfully', async () => {
      const result = { number: 123, balance: 900 };
      mockAccountService.debitFromAccount.mockResolvedValue(result);
      const response = await controller.debitFromAccount('123', '100');
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.message).toBe(
        'Amount debited from account successfully!',
      );
      expect(response.updatedAccount.balance).toBe(900);
    });
  });

  describe('transferAmount', () => {
    it('should throw BadRequestException if toNumber or amount are not provided', async () => {
      await expect(controller.transferAmount('123', '', '100')).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.transferAmount('123', '456', '')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if amount is negative', async () => {
      await expect(
        controller.transferAmount('123', '456', '-100'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if balance is insufficient', async () => {
      mockAccountService.transferAmount.mockRejectedValue(
        new BadRequestException('Insufficient balance.'),
      );
      await expect(
        controller.transferAmount('123', '456', '1000'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should transfer amount between accounts successfully', async () => {
      const result = {
        fromAccount: { number: 123, balance: 900 },
        toAccount: { number: 456, balance: 1100 },
      };
      mockAccountService.transferAmount.mockResolvedValue(result);
      const response = await controller.transferAmount('123', '456', '100');
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.message).toBe('Amount transferred successfully!');
      expect(response.updatedAccounts.fromAccount.balance).toBe(900);
      expect(response.updatedAccounts.toAccount.balance).toBe(1100);
    });

    it('should transfer amount and add bonus points to Bonus account successfully', async () => {
      const result = {
        fromAccount: { number: 123, balance: 900 },
        toAccount: { number: 456, balance: 1100, bonusScore: 15 },
      };
      mockAccountService.transferAmount.mockResolvedValue(result);
      const response = await controller.transferAmount('123', '456', '100');
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.message).toBe('Amount transferred successfully!');
      expect(response.updatedAccounts.fromAccount.balance).toBe(900);
      expect(response.updatedAccounts.toAccount.balance).toBe(1100);
      expect(response.updatedAccounts.toAccount.bonusScore).toBe(15);
    });
  });

  describe('yieldInterestByAccount', () => {
    it('should throw BadRequestException if interest rate is not provided', async () => {
      await expect(
        controller.yieldInterestByAccount(123, null),
      ).rejects.toThrow(BadRequestException);
    });

    it('should yield interest for account successfully', async () => {
      const result = { number: 123, balance: 1050 };
      mockAccountService.yieldInterestByAccount.mockResolvedValue(result);
      const response = await controller.yieldInterestByAccount(123, 5);
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.message).toBe('Interest yielded successfully!');
      expect(response.updatedAccounts.balance).toBe(1050);
    });
  });

  describe('yieldInterest', () => {
    it('should throw BadRequestException if interest rate is not provided', async () => {
      await expect(controller.yieldInterest(null)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should yield interest for all saving accounts successfully', async () => {
      const result = [
        { number: 123, balance: 1050, type: 'Saving' },
        { number: 456, balance: 2100, type: 'Saving' },
      ];
      mockAccountService.yieldInterest.mockResolvedValue(result);
      const response = await controller.yieldInterest(5);
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.message).toBe('Interest yielded successfully!');
      expect(response.updatedAccounts).toEqual(result);
    });
  });
});
