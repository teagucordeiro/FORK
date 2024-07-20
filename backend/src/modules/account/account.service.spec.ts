import { Test, TestingModule } from '@nestjs/testing';
import { AccountService } from './account.service';
import { PrismaService } from '../../prisma.service';
import {
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Account } from '@prisma/client';
import { AccountEntity } from './account.entity';

describe('AccountService', () => {
  let service: AccountService;

  const mockPrismaService = {
    account: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AccountService>(AccountService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAccount', () => {
    it('should throw ConflictException if account number already exists', async () => {
      mockPrismaService.account.findFirst.mockImplementation(() => ({
        number: 123,
      }));
      await expect(service.createAccount(123, 'Default', 1000)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw BadRequestException if initial balance is required but not provided', async () => {
      mockPrismaService.account.findFirst.mockImplementation(() => null);
      await expect(service.createAccount(123, 'Default', 0)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should create a new Saving account successfully', async () => {
      mockPrismaService.account.findFirst.mockImplementation(() => null);
      const newAccount: AccountEntity = {
        number: 123,
        type: 'Saving',
        balance: 1000,
      };
      mockPrismaService.account.create.mockImplementation(() => newAccount);
      const result = await service.createAccount(123, 'Saving', 1000);
      expect(result).toEqual(newAccount);
    });

    it('should create a new Default account successfully', async () => {
      mockPrismaService.account.findFirst.mockImplementation(() => null);
      const newAccount: AccountEntity = {
        number: 123,
        type: 'Default',
        balance: 1000,
      };
      mockPrismaService.account.create.mockImplementation(() => newAccount);
      const result = await service.createAccount(123, 'Default', 1000);
      expect(result).toEqual(newAccount);
    });

    it('should create a new Bonus account successfully', async () => {
      mockPrismaService.account.findFirst.mockImplementation(() => null);
      const newAccount: AccountEntity = {
        number: 123,
        type: 'Bonus',
        balance: 1000,
        bonusScore: 10,
      };
      mockPrismaService.account.create.mockImplementation(() => newAccount);
      const result = await service.createAccount(123, 'Bonus', 1000);
      expect(result).toEqual(newAccount);
    });
  });

  describe('getAccountByNumber', () => {
    it('should throw NotFoundException if account does not exist', async () => {
      mockPrismaService.account.findFirst.mockImplementation(() => null);
      await expect(service.getAccountByNumber(123)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return the account if it exists', async () => {
      const account = { number: 123, balance: 1000, type: 'Saving' } as Account;
      mockPrismaService.account.findFirst.mockImplementation(() => account);
      const result = await service.getAccountByNumber(123);
      expect(result).toEqual(account);
    });
  });

  describe('debitFromAccount', () => {
    it('should throw BadRequestException if balance is insufficient', async () => {
      const account = { number: 123, balance: 500, type: 'Default' } as Account;
      mockPrismaService.account.findFirst.mockImplementation(() => account);
      await expect(service.debitFromAccount(123, 1000)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should debit amount from account successfully', async () => {
      const account = {
        number: 123,
        balance: 1000,
        type: 'Default',
      } as Account;
      mockPrismaService.account.findFirst.mockImplementation(() => account);
      const updatedAccount = {
        number: 123,
        balance: 900,
        type: 'Default',
      } as Account;
      mockPrismaService.account.update.mockImplementation(() => updatedAccount);
      const result = await service.debitFromAccount(123, 100);
      expect(result.balance).toBe(900);
    });
  });

  describe('creditToAccount', () => {
    it('should credit amount to Default account successfully', async () => {
      const account = {
        number: 123,
        balance: 1000,
        type: 'Default',
      } as Account;
      mockPrismaService.account.findFirst.mockImplementation(() => account);
      const updatedAccount = {
        number: 123,
        balance: 1500,
        type: 'Default',
      } as Account;
      mockPrismaService.account.update.mockImplementation(() => updatedAccount);
      const result = await service.creditToAccount(123, 500);
      expect(result.balance).toBe(1500);
    });

    it('should credit amount to Bonus account and add bonus points successfully', async () => {
      const account = {
        number: 123,
        balance: 1000,
        type: 'Bonus',
        bonusScore: 10,
      } as Account;
      mockPrismaService.account.findFirst.mockImplementation(() => account);
      const updatedAccount = {
        number: 123,
        balance: 1500,
        type: 'Bonus',
        bonusScore: 15,
      } as Account;
      mockPrismaService.account.update.mockImplementation(() => updatedAccount);
      const result = await service.creditToAccount(123, 500);
      expect(result.balance).toBe(1500);
      expect(result.bonusScore).toBe(15);
    });
  });

  describe('transferAmount', () => {
    it('should throw BadRequestException if balance is insufficient', async () => {
      const fromAccount = {
        number: 123,
        balance: 500,
        type: 'Default',
      } as Account;
      const toAccount = {
        number: 456,
        balance: 1000,
        type: 'Default',
      } as Account;
      mockPrismaService.account.findFirst
        .mockResolvedValueOnce(fromAccount)
        .mockResolvedValueOnce(toAccount);
      await expect(service.transferAmount(123, 456, 1000)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should transfer amount between accounts successfully', async () => {
      const fromAccount = {
        number: 123,
        balance: 1000,
        type: 'Default',
      } as Account;
      const toAccount = {
        number: 456,
        balance: 1000,
        type: 'Default',
      } as Account;
      mockPrismaService.account.findFirst
        .mockResolvedValueOnce(fromAccount)
        .mockResolvedValueOnce(toAccount);
      const updatedFromAccount = {
        number: 123,
        balance: 500,
        type: 'Default',
      } as Account;
      const updatedToAccount = {
        number: 456,
        balance: 1500,
        type: 'Default',
      } as Account;
      mockPrismaService.account.update
        .mockResolvedValueOnce(updatedFromAccount)
        .mockResolvedValueOnce(updatedToAccount);
      const result = await service.transferAmount(123, 456, 500);
      expect(result.fromAccount.balance).toBe(500);
      expect(result.toAccount.balance).toBe(1500);
    });

    it('should transfer amount and add bonus points to Bonus account successfully', async () => {
      const fromAccount = {
        number: 123,
        balance: 1000,
        type: 'Default',
      } as Account;
      const toAccount = {
        number: 456,
        balance: 1000,
        type: 'Bonus',
        bonusScore: 10,
      } as Account;
      mockPrismaService.account.findFirst
        .mockResolvedValueOnce(fromAccount)
        .mockResolvedValueOnce(toAccount);
      const updatedFromAccount = {
        number: 123,
        balance: 500,
        type: 'Default',
      } as Account;
      const updatedToAccount = {
        number: 456,
        balance: 1500,
        type: 'Bonus',
        bonusScore: 15,
      } as Account;
      mockPrismaService.account.update
        .mockResolvedValueOnce(updatedFromAccount)
        .mockResolvedValueOnce(updatedToAccount);
      const result = await service.transferAmount(123, 456, 500);
      expect(result.fromAccount.balance).toBe(500);
      expect(result.toAccount.balance).toBe(1500);
      expect(result.toAccount.bonusScore).toBe(15);
    });
  });

  describe('yieldInterestByAccount', () => {
    it('should yield interest for account successfully', async () => {
      const account = {
        id: '1',
        number: 123,
        balance: 1000,
        type: 'Saving',
      } as Account;
      mockPrismaService.account.findFirst.mockImplementation(() => account);
      const updatedAccount = { ...account, balance: 1050 };
      mockPrismaService.account.update.mockImplementation(() => updatedAccount);
      const result = await service.yieldInterestByAccount(123, 5);
      expect(result.balance).toBe(1050);
    });
  });

  describe('yieldInterest', () => {
    it('should yield interest for all saving accounts successfully', async () => {
      const accounts = [
        { id: '1', number: 123, balance: 1000, type: 'Saving' } as Account,
        { id: '2', number: 456, balance: 2000, type: 'Saving' } as Account,
      ];
      mockPrismaService.account.findMany.mockImplementation(() => accounts);
      const updatedAccounts = [
        { ...accounts[0], balance: 1050 },
        { ...accounts[1], balance: 2100 },
      ];
      mockPrismaService.account.update
        .mockImplementationOnce(() => updatedAccounts[0])
        .mockImplementationOnce(() => updatedAccounts[1]);
      const result = await service.yieldInterest(5);
      expect(result[0].balance).toBe(1050);
      expect(result[1].balance).toBe(2100);
    });
  });
});
