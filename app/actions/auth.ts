'use server';

import { signIn } from '@/auth';
import bcrypt from 'bcryptjs';
import { AuthError } from 'next-auth';
import prisma from '@/prisma/client';

export async function signUpAction(formData: FormData) {
  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email and password are required' };
  }

  if (!firstName || !lastName) {
    return { error: 'First name and last name are required' };
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return { error: 'User with this email already exists' };
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  try {
    await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    return { error: 'Something went wrong. Please try again.' };
  }

  // Sign in the user after successful registration
  // This will automatically redirect to /admin
  await signIn('credentials', {
    email,
    password,
    redirectTo: '/admin',
  });
}

export async function signInAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const callbackUrl = (formData.get('callbackUrl') as string) || '/admin';

  if (!email || !password) {
    return { error: 'Email and password are required' };
  }

  try {
    await signIn('credentials', {
      email,
      password,
      redirectTo: callbackUrl,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { error: 'Invalid email or password' };
        default:
          return { error: 'Something went wrong. Please try again.' };
      }
    }
    throw error;
  }
}
