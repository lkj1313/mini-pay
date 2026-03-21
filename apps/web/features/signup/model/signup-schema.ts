import { z } from 'zod/v4';

export const signupSchema = z.object({
  name: z.string().trim().min(2, '이름은 최소 2자 이상이어야 합니다.'),
  email: z.email('올바른 이메일 형식이어야 합니다.'),
  password: z.string().min(8, '비밀번호는 최소 8자 이상이어야 합니다.'),
});

export type SignupFormValues = z.infer<typeof signupSchema>;
