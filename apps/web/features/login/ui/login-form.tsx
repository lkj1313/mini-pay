'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';

import {
  loginSchema,
  type LoginFormValues,
} from '@/features/login/model/login-schema';
import { useLoginMutation } from '@/features/login/model/use-login-mutation';
import { createZodResolver } from '@/shared/lib/zod-resolver';
import { Button } from '@/shared/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';

type LoginFormProps = {
  initialEmail?: string;
};

export function LoginForm({ initialEmail = '' }: LoginFormProps) {
  const loginMutation = useLoginMutation();
  const form = useForm<LoginFormValues>({
    resolver: createZodResolver(loginSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      email: initialEmail,
      password: '',
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  const isPending = isSubmitting || loginMutation.isPending;

  const onSubmit = handleSubmit(async (values) => {
    await loginMutation.mutateAsync(values);
  });

  return (
    <Card className="w-full max-w-[470px]">
      <CardHeader className="space-y-3">
        <div className="inline-flex w-fit rounded-full border border-primary/12 bg-primary/8 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Mini Pay
        </div>
        <CardTitle className="text-3xl leading-tight">
          다시 로그인하고
          <br />내 계좌 흐름을 이어가세요.
        </CardTitle>
        <CardDescription className="max-w-sm">
          세션 기반 인증으로 내 계좌, 거래내역, 이체 흐름을 같은 맥락에서 이어서
          사용할 수 있습니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              type="email"
              placeholder="user@example.com"
              autoComplete="email"
              aria-invalid={Boolean(errors.email)}
              disabled={isPending}
              {...register('email')}
            />
            {errors.email ? (
              <p className="text-sm font-medium text-destructive">
                {errors.email.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">비밀번호</Label>
            <Input
              id="password"
              type="password"
              placeholder="비밀번호를 입력하세요"
              autoComplete="current-password"
              aria-invalid={Boolean(errors.password)}
              disabled={isPending}
              {...register('password')}
            />
            {errors.password ? (
              <p className="text-sm font-medium text-destructive">
                {errors.password.message}
              </p>
            ) : null}
          </div>

          {loginMutation.error ? (
            <div className="rounded-2xl border border-destructive/18 bg-destructive/6 px-4 py-3 text-sm font-medium text-destructive">
              {loginMutation.error.message}
            </div>
          ) : null}

          <Button
            className="h-12 w-full text-sm"
            type="submit"
            disabled={isPending}
          >
            {isPending ? '로그인 중...' : '로그인'}
          </Button>
        </form>

        <div className="mt-6 flex items-center justify-between gap-4 border-t border-border/70 pt-5 text-sm text-muted-foreground">
          <span>처음 오셨나요?</span>
          <Link
            className="font-semibold text-primary underline-offset-4 hover:underline"
            href="/signup"
          >
            회원가입
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
