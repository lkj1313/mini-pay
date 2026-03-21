import { toast } from 'sonner';

import { ApiError, type ApiErrorPayload } from '@/shared/api/types';
import { env } from '@/shared/config/env';

type NextRequestOptions = {
  revalidate?: number | false;
  tags?: string[];
};

export type RequestOptions = {
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
  cookie?: string;
  params?: Record<string, string | number | boolean | undefined | null>;
  cache?: RequestCache;
  next?: NextRequestOptions;
  skipErrorToast?: boolean;
};

function buildUrlWithParams(
  url: string,
  params?: RequestOptions['params'],
): string {
  if (!params) {
    return url;
  }

  const filteredParams = Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null,
    ),
  );

  if (Object.keys(filteredParams).length === 0) {
    return url;
  }

  const queryString = new URLSearchParams(
    Object.fromEntries(
      Object.entries(filteredParams).map(([key, value]) => [
        key,
        String(value),
      ]),
    ),
  ).toString();

  return `${url}?${queryString}`;
}

export async function getServerCookies() {
  if (typeof window !== 'undefined') {
    return '';
  }

  const { cookies } = await import('next/headers');

  try {
    const cookieStore = await cookies();

    return cookieStore
      .getAll()
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join('; ');
  } catch {
    return '';
  }
}

function getErrorMessage(payload: unknown, fallback: string) {
  if (
    payload &&
    typeof payload === 'object' &&
    'message' in payload &&
    payload.message
  ) {
    const message = payload.message;

    if (Array.isArray(message)) {
      return String(message[0] ?? fallback);
    }

    return String(message);
  }

  return fallback;
}

function isSessionUnauthorized(status: number, message: string) {
  return status === 401 && message.includes('세션');
}

async function fetchApi<T>(
  url: string,
  options: RequestOptions = {},
): Promise<T> {
  const {
    method = 'GET',
    headers = {},
    body,
    cookie,
    params,
    cache = 'no-store',
    next,
    skipErrorToast = false,
  } = options;

  let cookieHeader = cookie;

  if (typeof window === 'undefined' && !cookie) {
    cookieHeader = await getServerCookies();
  }

  const fullUrl = buildUrlWithParams(`${env.API_URL}${url}`, params);

  const response = await fetch(fullUrl, {
    method,
    headers: {
      Accept: 'application/json',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
    cache,
    next,
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message = getErrorMessage(
      payload,
      response.statusText || '요청에 실패했습니다.',
    );
    const sessionUnauthorized = isSessionUnauthorized(response.status, message);

    if (typeof window !== 'undefined') {
      if (sessionUnauthorized) {
        window.dispatchEvent(new CustomEvent('mini-pay:session-unauthorized'));
      } else if (!skipErrorToast) {
        toast.error(message);
      }
    }

    throw new ApiError(
      response.status,
      message,
      (payload as ApiErrorPayload | null) ?? undefined,
    );
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('mini-pay:session-activity'));
  }

  return payload as T;
}

export const api = {
  get<T>(url: string, options?: RequestOptions): Promise<T> {
    return fetchApi<T>(url, { ...options, method: 'GET' });
  },
  post<T>(url: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return fetchApi<T>(url, { ...options, method: 'POST', body });
  },
  put<T>(url: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return fetchApi<T>(url, { ...options, method: 'PUT', body });
  },
  patch<T>(url: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return fetchApi<T>(url, { ...options, method: 'PATCH', body });
  },
  delete<T>(url: string, options?: RequestOptions): Promise<T> {
    return fetchApi<T>(url, { ...options, method: 'DELETE' });
  },
};
