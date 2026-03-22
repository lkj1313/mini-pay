import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CreateSavingsWalletForm } from '@/features/create-savings-wallet/ui/create-savings-wallet-form';

const mockCreateSavingsWallet = jest.fn();
const mockToastSuccess = jest.fn();
const mockInvalidateQueries = jest.fn();

jest.mock('sonner', () => ({
  toast: {
    success: (...args: unknown[]) => mockToastSuccess(...args),
  },
}));

jest.mock('@/shared/api/wallet', () => ({
  createSavingsWallet: (...args: unknown[]) => mockCreateSavingsWallet(...args),
}));

function renderCreateSavingsWalletForm(onSuccess?: () => void) {
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
      <CreateSavingsWalletForm onSuccess={onSuccess} />
    </QueryClientProvider>,
  );
}

describe('CreateSavingsWalletForm', () => {
  beforeEach(() => {
    mockCreateSavingsWallet.mockReset();
    mockToastSuccess.mockReset();
    mockInvalidateQueries.mockReset();
  });

  it('정기 적금을 선택하면 자동 이체 금액 입력창이 나타난다', async () => {
    const user = userEvent.setup();

    renderCreateSavingsWalletForm();

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();

    await user.click(screen.getAllByRole('radio')[1]);

    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('정기 적금 정보를 올바르게 입력하면 제출한다', async () => {
    const user = userEvent.setup();
    const mockOnSuccess = jest.fn();

    mockCreateSavingsWallet.mockResolvedValue({
      wallet: {
        id: 'wallet-savings',
      },
    });

    renderCreateSavingsWalletForm(mockOnSuccess);

    await user.click(screen.getAllByRole('radio')[1]);
    await user.type(screen.getByRole('textbox'), '10000');
    await user.click(
      screen.getByRole('button', { name: /적금 계좌 만들기/i }),
    );

    await waitFor(() => {
      expect(mockCreateSavingsWallet).toHaveBeenCalledTimes(1);
      expect(mockCreateSavingsWallet).toHaveBeenNthCalledWith(
        1,
        {
          productType: 'FIXED',
          autoTransferAmount: 10000,
        },
        expect.anything(),
      );
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ['wallets', 'me'],
      });
      expect(mockOnSuccess).toHaveBeenCalledTimes(1);
    });
  });
});
