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
    return Math.trunc(param.value / 200);
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
