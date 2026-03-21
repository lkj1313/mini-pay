import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { TransferToSavingsDialog } from '@/features/transfer-to-savings/ui/transfer-to-savings-dialog';

function renderTransferToSavingsDialog() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <TransferToSavingsDialog>
        <button type="button">적금 이체 열기</button>
      </TransferToSavingsDialog>
    </QueryClientProvider>,
  );
}

describe('TransferToSavingsDialog', () => {
  it('트리거를 클릭하면 적금 이체 다이얼로그가 열린다', async () => {
    const user = userEvent.setup();

    renderTransferToSavingsDialog();

    await user.click(screen.getByRole('button', { name: '적금 이체 열기' }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getAllByRole('textbox')).toHaveLength(1);
  });
});
