import {
  AccountEntity,
  AccountOptions,
} from 'src/modules/account/account.entity';

type operationBetweenAccountsTypes = 'credit' | 'transfer';

interface IcalculateBonusByOperationTypeAttributes {
  operationType: operationBetweenAccountsTypes;
  value: number;
}

export function calculateBonusByOperationType(
  param: IcalculateBonusByOperationTypeAttributes,
) {
  if (param.operationType === 'credit') {
    return Math.trunc(param.value / 100);
  }

  if (param.operationType === 'transfer') {
    return Math.trunc(param.value / 150);
  }
}

interface IAddPointsToBonusAccountAttributes
  extends IcalculateBonusByOperationTypeAttributes {
  currentBonusAccount: number;
}

export function addPointsToBonusAccount(
  param: IAddPointsToBonusAccountAttributes,
) {
  return (
    param.currentBonusAccount +
    calculateBonusByOperationType({
      operationType: param.operationType,
      value: param.value,
    })
  );
}

export function isCheckingAccount(accountType: AccountOptions) {
  return ['Bonus', 'Default'].includes(accountType);
}

export function isDefaultOrBonusWithExcessiveDebt(
  account: AccountEntity,
  amount: number,
) {
  if (!isCheckingAccount(account.type)) {
    return false;
  }

  const newBalance = account.balance - amount;
  return newBalance < -1000;
}
