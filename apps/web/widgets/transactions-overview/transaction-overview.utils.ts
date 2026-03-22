import type {
  Transaction,
  TransactionStatus,
  TransactionType,
} from '@/shared/api/types';

const currencyFormatter = new Intl.NumberFormat('ko-KR');

export function formatMoney(value: number | string) {
  return `${currencyFormatter.format(Number(value))}원`;
}

export function getTransactionTypeLabel(type: TransactionType) {
  switch (type) {
    case 'SELF_DEPOSIT':
      return '직접 충전';
    case 'MAIN_TO_SAVINGS':
      return '적금 이체';
    case 'USER_TRANSFER':
      return '사용자 송금';
    case 'SAVINGS_INTEREST':
      return '적금 이자';
    default:
      return type;
  }
}

export function getTransactionStatusLabel(status: TransactionStatus) {
  switch (status) {
    case 'PENDING':
      return '대기';
    case 'SUCCESS':
      return '완료';
    case 'FAILED':
      return '실패';
    case 'CANCELED':
      return '취소';
    default:
      return status;
  }
}

export function getTransactionDescription(transaction: Transaction) {
  if (transaction.description) {
    return transaction.description;
  }

  switch (transaction.type) {
    case 'SELF_DEPOSIT':
      return '본인 직접 충전';
    case 'MAIN_TO_SAVINGS':
      return '메인 계좌에서 적금 계좌로 이동';
    case 'USER_TRANSFER':
      return transaction.counterpartyName
        ? `${transaction.counterpartyName} 관련 송금`
        : '사용자 간 송금';
    case 'SAVINGS_INTEREST':
      return '적금 이자 지급';
    default:
      return '거래';
  }
}

export function getTransactionCounterparty(transaction: Transaction) {
  if (transaction.type === 'SELF_DEPOSIT') {
    return '본인';
  }

  if (transaction.type === 'SAVINGS_INTEREST') {
    return '시스템';
  }

  return transaction.counterpartyName ?? '상대 정보 없음';
}
