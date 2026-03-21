import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { LoginForm } from '@/features/login/ui/login-form';

const mockPush = jest.fn();
const mockLogin = jest.fn();
const mockToastSuccess = jest.fn();
const mockInvalidateQueries = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: (...args: unknown[]) => mockPush(...args),
  }),
}));

jest.mock('sonner', () => ({
  toast: {
    success: (...args: unknown[]) => mockToastSuccess(...args),
  },
}));

jest.mock('@/shared/api/auth', () => ({
  login: (...args: unknown[]) => mockLogin(...args),
}));

function renderLoginForm(initialEmail?: string) {
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
      <LoginForm initialEmail={initialEmail} />
    </QueryClientProvider>,
  );
}

describe('LoginForm', () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockLogin.mockReset();
    mockToastSuccess.mockReset();
    mockInvalidateQueries.mockReset();
  });

  it('잘못된 이메일을 입력한 뒤 포커스를 벗어나면 검증 에러를 보여준다', async () => {
    const user = userEvent.setup();

    renderLoginForm();

    await user.type(screen.getByLabelText('이메일'), 'wrong-email');
    await user.tab();

    expect(
      screen.getByText('올바른 이메일 형식이어야 합니다.'),
    ).toBeInTheDocument();
  });

  it('유효한 로그인 값을 입력하면 제출하고 로그인 후 이동한다', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValue({ user: { id: 'user-1' } });

    renderLoginForm('user@example.com');

    expect(screen.getByLabelText('이메일')).toHaveValue('user@example.com');

    await user.type(screen.getByLabelText('비밀번호'), 'password123');
    await user.click(screen.getByRole('button', { name: '로그인' }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledTimes(1);
      expect(mockLogin.mock.calls[0]?.[0]).toEqual({
        email: 'user@example.com',
        password: 'password123',
      });
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ['auth', 'me'],
      });
      expect(mockToastSuccess).toHaveBeenCalledWith('로그인되었습니다.');
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });
});
