import { ArrowRightLeft, Landmark, ShieldCheck } from 'lucide-react';

import { LoginForm } from '@/features/login';
import { AuthShell } from '@/shared/ui/auth-shell';

const loginHighlights = [
  {
    icon: ShieldCheck,
    title: '안정적인 세션 흐름',
    description:
      '로그인 이후에도 계좌 상태와 인증 흐름이 같은 기준으로 유지됩니다.',
  },
  {
    icon: Landmark,
    title: '메인·적금 계좌 연결',
    description:
      '메인 계좌 조회와 적금 계좌 흐름이 한 화면 맥락 안에서 자연스럽게 이어집니다.',
  },
  {
    icon: ArrowRightLeft,
    title: '송금과 거래내역 확인',
    description:
      '로그인 후 충전, 이체, 거래내역을 같은 규칙과 피드백으로 사용할 수 있습니다.',
  },
];

type LoginPageProps = {
  searchParams?: Promise<{
    email?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const initialEmail = resolvedSearchParams?.email ?? '';

  return (
    <AuthShell
      eyebrow="Secure session access"
      title={
        <>
          다시 로그인하고
          <br />
          내 계좌 흐름을 이어가세요.
        </>
      }
      description="미니페이는 로그인 이후에도 조회, 충전, 이체 흐름이 같은 보안 규칙 안에서 자연스럽게 이어지도록 설계되어 있습니다."
      highlights={loginHighlights}
    >
      <LoginForm initialEmail={initialEmail} />
    </AuthShell>
  );
}
