import type { WalletStatus, WalletType } from '@/shared/api/types';

const currencyFormatter = new Intl.NumberFormat('ko-KR');

export function formatMoney(value: number | string) {
  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue)) {
    return `${value}원`;
  }

  return `${currencyFormatter.format(parsedValue)}원`;
}

export function getWalletLabel(type: WalletType) {
  return type === 'MAIN' ? '메인 계좌' : '적금 계좌';
}

export function getStatusLabel(status: WalletStatus) {
  switch (status) {
    case 'ACTIVE':
      return '정상';
    case 'FROZEN':
      return '동결';
    case 'CLOSED':
      return '종료';
    default:
      return status;
  }
}
