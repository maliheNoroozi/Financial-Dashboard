'use server';

import { signIn, signOut } from '@/auth';
import { AuthError } from 'next-auth';

type FormState = string | undefined;

export async function SignIn(
  formState: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
  }
}

export async function SignOut() {
  await signOut();
}
