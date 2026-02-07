'use server';

import { signIn, signOut } from '@/auth';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { AuthError } from 'next-auth';
import { redirect } from 'next/navigation';
import prisma from '@/prisma/client';
import { sendPasswordResetEmail } from '@/lib/email';
import { mainUrl } from '@/lib/url';

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
  const redirectTo = (formData.get('redirectTo') as string) || '/account';
  await signIn('credentials', {
    email,
    password,
    redirectTo,
  });
}

export async function signInAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const callbackUrl = (formData.get('callbackUrl') as string) || '/account';

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

export async function signOutAction() {
  await signOut({ redirect: true, redirectTo: '/' });
}

export async function forgotPasswordAction(formData: FormData) {
  const email = (formData.get('email') as string)?.trim().toLowerCase();

  if (!email) {
    return { error: 'Email is required' };
  }

  // Always return success to prevent email enumeration
  const successMessage = 'If an account exists with that email, we sent a password reset link.';

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return { success: successMessage };
    }

    // Delete any existing tokens for this email
    await prisma.passwordResetToken.deleteMany({ where: { email } });

    // Create new token
    const token = crypto.randomUUID();
    await prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    });

    const resetUrl = mainUrl(`/auth/reset-password/${token}`);
    await sendPasswordResetEmail({ to: email, resetUrl });

    return { success: successMessage };
  } catch (error) {
    console.error('Forgot password error:', error);
    return { error: 'Something went wrong. Please try again.' };
  }
}

export async function resetPasswordAction(formData: FormData) {
  const token = formData.get('token') as string;
  const password = formData.get('password') as string;

  if (!token || !password) {
    return { error: 'Token and password are required' };
  }

  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters' };
  }

  try {
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      return { error: 'Invalid or expired reset link' };
    }

    if (resetToken.expires < new Date()) {
      await prisma.passwordResetToken.delete({ where: { id: resetToken.id } });
      return { error: 'Reset link has expired. Please request a new one.' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { email: resetToken.email },
      data: { password: hashedPassword },
    });

    // Clean up token
    await prisma.passwordResetToken.delete({ where: { id: resetToken.id } });
  } catch (error) {
    console.error('Reset password error:', error);
    return { error: 'Something went wrong. Please try again.' };
  }

  redirect('/auth/signin?message=Password reset successfully. Please sign in.');
}
