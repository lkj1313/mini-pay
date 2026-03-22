import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CreateSavingsWalletDialog } from '@/features/create-savings-wallet/ui/create-savings-wallet-dialog';

function renderCreateSavingsWalletDialog() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <CreateSavingsWalletDialog>
        <button type="button">적금 만들기 열기</button>
      </CreateSavingsWalletDialog>
    </QueryClientProvider>,
  );
}

describe('CreateSavingsWalletDialog', () => {
  it('트리거를 클릭하면 적금 계좌 생성 다이얼로그가 열린다', async () => {
    const user = userEvent.setup();

    renderCreateSavingsWalletDialog();

    await user.click(screen.getByRole('button', { name: '적금 만들기 열기' }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(2);
  });
});
