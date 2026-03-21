'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';

import {
  signupSchema,
  type SignupFormValues,
} from '@/features/signup/model/signup-schema';
import { useSignupMutation } from '@/features/signup/model/use-signup-mutation';
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

export function SignupForm() {
  const signupMutation = useSignupMutation();
  const form = useForm<SignupFormValues>({
    resolver: createZodResolver(signupSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  const isPending = isSubmitting || signupMutation.isPending;

  const onSubmit = handleSubmit(async (values) => {
    await signupMutation.mutateAsync(values);
  });

  return (
    <Card className="w-full max-w-[470px]">
      <CardHeader className="space-y-3">
        <div className="inline-flex w-fit rounded-full border border-primary/12 bg-primary/8 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Mini Pay
        </div>
        <CardTitle className="text-3xl leading-tight">
          회원가입하고
          <br />
          바로 메인 계좌를 시작하세요.
        </CardTitle>
        <CardDescription className="max-w-sm">
          이름, 이메일, 비밀번호만 입력하면 가입과 동시에 메인 계좌가
          생성됩니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="name">이름</Label>
            <Input
              id="name"
              placeholder="이름을 입력하세요"
              autoComplete="name"
              aria-invalid={Boolean(errors.name)}
              disabled={isPending}
              {...register('name')}
            />
            {errors.name ? (
              <p className="text-sm font-medium text-destructive">
                {errors.name.message}
              </p>
            ) : null}
          </div>

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
              placeholder="8자 이상 비밀번호"
              autoComplete="new-password"
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

          {signupMutation.error ? (
            <div className="rounded-2xl border border-destructive/18 bg-destructive/6 px-4 py-3 text-sm font-medium text-destructive">
              {signupMutation.error.message}
            </div>
          ) : null}

          <Button className="h-12 w-full text-sm" type="submit" disabled={isPending}>
            {isPending ? '가입 중...' : '회원가입'}
          </Button>
        </form>

        <div className="mt-6 flex items-center justify-between gap-4 border-t border-border/70 pt-5 text-sm text-muted-foreground">
          <span>이미 계정이 있나요?</span>
          <Link
            className="font-semibold text-primary underline-offset-4 hover:underline"
            href="/login"
          >
            로그인
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
