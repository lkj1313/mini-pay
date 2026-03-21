import { render, screen } from '@testing-library/react';

import TransactionsPage from '@/app/transactions/page';

const mockUseTransactionsQuery = jest.fn();

jest.mock('next/link', () => {
  return function MockLink({
    href,
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  };
});

jest.mock('@/entities/transaction', () => ({
  useTransactionsQuery: () => mockUseTransactionsQuery(),
}));

describe('TransactionsPage', () => {
  beforeEach(() => {
    mockUseTransactionsQuery.mockReset();
  });

  it('거래내역이 없으면 빈 상태를 보여준다', () => {
    mockUseTransactionsQuery.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      isFetching: false,
      refetch: jest.fn(),
    });

    render(<TransactionsPage />);

    expect(
      screen.getByText('아직 거래내역이 없습니다.'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: '지갑에서 거래 시작하기' }),
    ).toHaveAttribute('href', '/wallets');
  });

  it('거래내역이 있으면 리스트를 보여준다', () => {
    mockUseTransactionsQuery.mockReturnValue({
      data: [
        {
          id: 'tx-1',
          fromWalletId: null,
          toWalletId: 'wallet-1',
          amount: '50000',
          type: 'SELF_DEPOSIT',
          status: 'SUCCESS',
          description: '본인 직접 충전',
          createdAt: '2026-03-21T10:00:00.000Z',
          counterpartyName: '본인',
        },
      ],
      isLoading: false,
      isError: false,
      isFetching: false,
      refetch: jest.fn(),
    });

    render(<TransactionsPage />);

    expect(screen.getByText('직접 충전')).toBeInTheDocument();
    expect(screen.getByText('본인 직접 충전')).toBeInTheDocument();
    expect(screen.getByText('상대: 본인')).toBeInTheDocument();
    expect(screen.getByText('50,000원')).toBeInTheDocument();
    expect(screen.getByText('거래 ID: tx-1')).toBeInTheDocument();
  });
});
