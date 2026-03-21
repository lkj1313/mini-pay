import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { SignupForm } from '@/features/signup/ui/signup-form';

const mockPush = jest.fn();
const mockSignup = jest.fn();
const mockToastSuccess = jest.fn();

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
  signup: (...args: unknown[]) => mockSignup(...args),
}));

function renderSignupForm() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <SignupForm />
    </QueryClientProvider>,
  );
}

describe('SignupForm', () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockSignup.mockReset();
    mockToastSuccess.mockReset();
  });

  it('이름 필드에 잘못된 값을 입력한 뒤 포커스를 벗어나면 검증 에러를 보여준다', async () => {
    const user = userEvent.setup();

    renderSignupForm();

    await user.type(screen.getByLabelText('이름'), '홍');
    await user.tab();

    expect(
      screen.getByText('이름은 최소 2자 이상이어야 합니다.'),
    ).toBeInTheDocument();
  });

  it('유효한 회원가입 값을 입력하면 제출한다', async () => {
    const user = userEvent.setup();
    mockSignup.mockResolvedValue(undefined);

    renderSignupForm();

    await user.type(screen.getByLabelText('이름'), '홍길동');
    await user.type(screen.getByLabelText('이메일'), 'user@example.com');
    await user.type(screen.getByLabelText('비밀번호'), 'password123');
    await user.click(screen.getByRole('button', { name: '회원가입' }));

    await waitFor(() => {
      expect(mockSignup).toHaveBeenCalledTimes(1);
      expect(mockSignup.mock.calls[0]?.[0]).toEqual({
        name: '홍길동',
        email: 'user@example.com',
        password: 'password123',
      });
    });
  });
});
