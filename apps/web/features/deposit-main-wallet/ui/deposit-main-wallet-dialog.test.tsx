import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { DepositMainWalletDialog } from '@/features/deposit-main-wallet/ui/deposit-main-wallet-dialog';

function renderDepositMainWalletDialog() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <DepositMainWalletDialog>
        <button type="button">충전 열기</button>
      </DepositMainWalletDialog>
    </QueryClientProvider>,
  );
}

describe('DepositMainWalletDialog', () => {
  it('트리거를 클릭하면 충전 다이얼로그가 열린다', async () => {
    const user = userEvent.setup();

    renderDepositMainWalletDialog();

    await user.click(screen.getByRole('button', { name: '충전 열기' }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getAllByRole('textbox')).toHaveLength(1);
  });
});
