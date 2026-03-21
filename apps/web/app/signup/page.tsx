import { CheckCircle2, Landmark, ShieldCheck } from 'lucide-react';

import { SignupForm } from '@/features/signup';
import { AuthShell } from '@/shared/ui/auth-shell';

const signupHighlights = [
  {
    icon: ShieldCheck,
    title: '세션 기반 인증',
    description:
      '로그인 상태를 안전하게 유지하고, 유휴 시간 기준으로 세션을 관리합니다.',
  },
  {
    icon: Landmark,
    title: '메인 계좌 자동 생성',
    description:
      '회원가입과 동시에 메인 계좌가 준비되어 충전과 이체를 바로 시작할 수 있습니다.',
  },
  {
    icon: CheckCircle2,
    title: '명확한 거래 흐름',
    description:
      '직접 충전, 적금 이체, 사용자 송금 내역을 한눈에 확인할 수 있습니다.',
  },
];

export default function SignupPage() {
  return (
    <AuthShell
      eyebrow="Financial onboarding"
      title={
        <>
          안전한 자금 관리를
          <br />
          가장 간단한 시작으로.
        </>
      }
      description="미니페이는 계정 생성부터 메인 계좌 준비, 거래 흐름 확인까지 복잡한 설명 없이 빠르게 연결됩니다."
      highlights={signupHighlights}
    >
      <SignupForm />
    </AuthShell>
  );
}
