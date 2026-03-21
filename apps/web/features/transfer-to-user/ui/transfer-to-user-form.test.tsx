import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { TransferToUserForm } from '@/features/transfer-to-user/ui/transfer-to-user-form';

const mockTransferToUser = jest.fn();
const mockToastSuccess = jest.fn();
const mockInvalidateQueries = jest.fn();

jest.mock('sonner', () => ({
  toast: {
    success: (...args: unknown[]) => mockToastSuccess(...args),
  },
}));

jest.mock('@/shared/api/wallet', () => ({
  transferToUser: (...args: unknown[]) => mockTransferToUser(...args),
}));

function renderTransferToUserForm(onSuccess?: () => void) {
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
      <TransferToUserForm onSuccess={onSuccess} />
    </QueryClientProvider>,
  );
}

describe('TransferToUserForm', () => {
  beforeEach(() => {
    mockTransferToUser.mockReset();
    mockToastSuccess.mockReset();
    mockInvalidateQueries.mockReset();
  });

  it('잘못된 이메일을 입력하고 포커스를 벗어나면 검증 에러를 보여준다', async () => {
    const user = userEvent.setup();

    renderTransferToUserForm();

    await user.type(screen.getByLabelText('받는 사용자 이메일'), 'wrong-email');
    await user.tab();

    expect(
      screen.getByText('올바른 이메일 형식이어야 합니다.'),
    ).toBeInTheDocument();
  });

  it('유효한 사용자 송금 값을 입력하면 제출한다', async () => {
    const user = userEvent.setup();
    const mockOnSuccess = jest.fn();

    mockTransferToUser.mockResolvedValue({
      transaction: {
        amount: '50000',
      },
    });

    renderTransferToUserForm(mockOnSuccess);

    await user.type(
      screen.getByLabelText('받는 사용자 이메일'),
      'friend@example.com',
    );
    await user.type(screen.getByLabelText('송금 금액'), '50000');
    await user.click(screen.getByRole('button', { name: '사용자에게 송금하기' }));

    await waitFor(() => {
      expect(mockTransferToUser).toHaveBeenCalledTimes(1);
      expect(mockTransferToUser.mock.calls[0]?.[0]).toEqual({
        toEmail: 'friend@example.com',
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
