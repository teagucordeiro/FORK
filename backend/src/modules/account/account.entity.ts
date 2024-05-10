export type AccountOptions = 'Default' | 'Bonus' | 'Saving';

export class AccountEntity {
  id?: string;
  balance: number;
  number: number;
  type: AccountOptions;
  bonusScore?: number;
}
