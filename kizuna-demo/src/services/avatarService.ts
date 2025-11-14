import type { Avatar } from '../types';
import { mockAvatar, mockAvatarBoy } from '../mockData';

// Placeholder service layer for future Move integration.
// Swap implementations here to fetch from Sui / server APIs later.

const avatars: Avatar[] = [mockAvatar, mockAvatarBoy];

export async function listAvatars(): Promise<Avatar[]> {
  return avatars;
}

export async function getAvatarById(id: string): Promise<Avatar | undefined> {
  return avatars.find(a => a.id === id);
}

export async function getDefaultAvatar(): Promise<Avatar> {
  return mockAvatar;
}

