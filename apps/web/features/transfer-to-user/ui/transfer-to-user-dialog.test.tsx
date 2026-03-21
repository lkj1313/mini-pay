import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { TransferToUserDialog } from '@/features/transfer-to-user/ui/transfer-to-user-dialog';

function renderTransferToUserDialog() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <TransferToUserDialog>
        <button type="button">사용자 송금 열기</button>
      </TransferToUserDialog>
    </QueryClientProvider>,
  );
}

describe('TransferToUserDialog', () => {
  it('트리거를 클릭하면 사용자 송금 다이얼로그가 열린다', async () => {
    const user = userEvent.setup();

    renderTransferToUserDialog();

    await user.click(screen.getByRole('button', { name: '사용자 송금 열기' }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getAllByRole('textbox')).toHaveLength(2);
  });
});
