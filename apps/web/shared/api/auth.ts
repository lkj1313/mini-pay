import { api } from '@/shared/api/client';
import type { User } from '@/shared/api/types';

export type LoginRequest = {
  email: string;
  password: string;
};

export type SignupRequest = {
  email: string;
  password: string;
  name: string;
};

export type MeResponse = {
  user: User;
};

export type LoginResponse = {
  user: User;
};

export type SignupResponse = User;

export type LogoutResponse = {
  ok: true;
};

export function login(body: LoginRequest) {
  return api.post<LoginResponse>('/auth/login', body);
}

export function signup(body: SignupRequest) {
  return api.post<SignupResponse>('/user', body);
}

export function getMe() {
  return api.get<MeResponse>('/auth/me');
}

export function logout() {
  return api.post<LogoutResponse>('/auth/logout');
}
