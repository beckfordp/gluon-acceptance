import type { APIRequestContext } from '@playwright/test';
import { hasFields, readJson } from './shape';

export interface SignedUpUser {
  userId: string
  token: string
}

function isSignedUpUser(value: unknown): value is SignedUpUser {
  return hasFields(value, { userId: 'string', token: 'string' });
}

/** `POST /auth/signup`: a new user-service account. */
export async function signUp(
  request: APIRequestContext,
  userUrl: string,
  email: string,
  password: string,
): Promise<SignedUpUser> {
  const response = await request.post(`${userUrl}/auth/signup`, { data: { email, password } });
  return readJson(response, 'POST /auth/signup', isSignedUpUser);
}
