import { z } from 'zod/v4';

export const loginSchema = z.object({
  email: z.email('올바른 이메일 형식이어야 합니다.'),
  password: z.string().min(8, '비밀번호는 최소 8자 이상이어야 합니다.'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
