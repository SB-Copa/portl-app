'use server';

import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import prisma from '@/prisma/client';
import { getCurrentUser } from '@/lib/auth';

export async function updateProfileAction(formData: FormData) {
  const user = await getCurrentUser();

  if (!user?.id) {
    return { error: 'You must be logged in to update your profile' };
  }

  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;
  const email = formData.get('email') as string;

  if (!firstName || !lastName || !email) {
    return { error: 'First name, last name, and email are required' };
  }

  // Check if email is taken by another user
  if (email !== user.email) {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser && existingUser.id !== user.id) {
      return { error: 'Email is already taken' };
    }
  }

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        firstName,
        lastName,
        email,
      },
    });

    revalidatePath('/[tenant]/profile');
    return { success: true };
  } catch (error) {
    console.error('Profile update error:', error);
    return { error: 'Failed to update profile. Please try again.' };
  }
}

export async function updatePasswordAction(formData: FormData) {
  const user = await getCurrentUser();

  if (!user?.id) {
    return { error: 'You must be logged in to update your password' };
  }

  const currentPassword = formData.get('currentPassword') as string;
  const newPassword = formData.get('newPassword') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: 'All fields are required' };
  }

  if (newPassword !== confirmPassword) {
    return { error: 'New passwords do not match' };
  }

  if (newPassword.length < 8) {
    return { error: 'Password must be at least 8 characters' };
  }

  // Get user with password
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (!dbUser || !dbUser.password) {
    return { error: 'Invalid user' };
  }

  // Verify current password
  const isValid = await bcrypt.compare(currentPassword, dbUser.password);
  if (!isValid) {
    return { error: 'Current password is incorrect' };
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Password update error:', error);
    return { error: 'Failed to update password. Please try again.' };
  }
}
