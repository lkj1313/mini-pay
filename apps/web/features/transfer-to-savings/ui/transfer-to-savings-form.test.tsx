import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { TransferToSavingsForm } from '@/features/transfer-to-savings/ui/transfer-to-savings-form';

const mockTransferToSavings = jest.fn();
const mockToastSuccess = jest.fn();
const mockInvalidateQueries = jest.fn();

jest.mock('sonner', () => ({
  toast: {
    success: (...args: unknown[]) => mockToastSuccess(...args),
  },
}));

jest.mock('@/shared/api/wallet', () => ({
  transferToSavings: (...args: unknown[]) => mockTransferToSavings(...args),
}));

function renderTransferToSavingsForm(onSuccess?: () => void) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  jest
    .spyOn(queryClient, 'invalidateQueries')
    .mockImplementation(mockInvalidateQueries);

  return render(
    <QueryClientProvider client={queryClient}>
      <TransferToSavingsForm onSuccess={onSuccess} />
    </QueryClientProvider>,
  );
}

describe('TransferToSavingsForm', () => {
  beforeEach(() => {
    mockTransferToSavings.mockReset();
    mockToastSuccess.mockReset();
    mockInvalidateQueries.mockReset();
  });

  it('이체 금액 필드에 빈 값을 두고 포커스를 벗어나면 검증 에러를 보여준다', async () => {
    const user = userEvent.setup();

    renderTransferToSavingsForm();

    await user.click(screen.getByLabelText('이체 금액'));
    await user.tab();

    expect(screen.getByText('이체 금액을 입력해주세요.')).toBeInTheDocument();
  });

  it('유효한 이체 금액을 입력하면 적금 계좌 이체를 제출한다', async () => {
    const user = userEvent.setup();
    const mockOnSuccess = jest.fn();

    mockTransferToSavings.mockResolvedValue({
      transaction: {
        amount: '50000',
      },
    });

    renderTransferToSavingsForm(mockOnSuccess);

    await user.type(screen.getByLabelText('이체 금액'), '50000');
    await user.click(
      screen.getByRole('button', { name: '적금 계좌로 이체하기' }),
    );

    await waitFor(() => {
      expect(mockTransferToSavings).toHaveBeenCalledTimes(1);
      expect(mockTransferToSavings).toHaveBeenNthCalledWith(1, {
        amount: 50000,
      });
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ['wallets', 'me'],
      });
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ['transactions', 'me'],
      });
      expect(mockOnSuccess).toHaveBeenCalledTimes(1);
    });
  });
});
