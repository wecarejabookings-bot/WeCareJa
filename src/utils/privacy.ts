/**
 * Privacy Utility for masking administrator identity
 * Ensures "Sydney Mattis" is only visible to the owner when logged in,
 * and appears as "Master Admin" / "Management" to everyone else.
 */

export interface ProfileLike {
  id?: string;
  name?: string;
  full_name?: string;
  fullName?: string;
  username?: string;
  email?: string;
  role?: string;
  title?: string;
}

export function isOwnerUser(currentUser: any): boolean {
  if (!currentUser) return false;
  const username = String(currentUser.username || '').toLowerCase();
  const email = String(currentUser.email || '').toLowerCase();
  const name = String(currentUser.name || currentUser.full_name || currentUser.fullName || '').toLowerCase();
  const id = String(currentUser.id || '').toLowerCase();
  const role = String(currentUser.role || '').toLowerCase();

  return (
    username === 'sydney' ||
    email === 'wecareja.bookings@gmail.com' ||
    email === 'sydney@wecareja.com' ||
    name.includes('sydney') ||
    id === '2e9a3a25-3404-47ed-a8f4-b0a7ecab3ba7' ||
    role === 'master_admin'
  );
}

export function isMasterAdminProfile(profile: any): boolean {
  if (!profile) return false;
  if (typeof profile === 'string') {
    const s = profile.toLowerCase();
    return s.includes('sydney') || s.includes('mattis');
  }
  const username = String(profile.username || '').toLowerCase();
  const email = String(profile.email || '').toLowerCase();
  const name = String(profile.name || profile.full_name || profile.fullName || '').toLowerCase();
  const id = String(profile.id || '').toLowerCase();
  const role = String(profile.role || '').toLowerCase();

  return (
    username === 'sydney' ||
    email === 'wecareja.bookings@gmail.com' ||
    email === 'sydney@wecareja.com' ||
    name.includes('sydney') ||
    id === '2e9a3a25-3404-47ed-a8f4-b0a7ecab3ba7' ||
    role === 'master_admin'
  );
}

/**
 * Returns the display name for a profile.
 * - If profile is Sydney / Master Admin, only owner sees "Sydney Mattis", others see "Master Admin".
 * - If profile is another user/nurse/client, returns their genuine name.
 */
export const getDisplayName = (profile: any, currentUser?: any): string => {
  if (!profile) return "Management";

  // If string passed directly
  if (typeof profile === 'string') {
    if (profile.toLowerCase().includes('sydney')) {
      if (isOwnerUser(currentUser)) {
        return profile;
      }
      return profile.replace(/Sydney\s+Mattis/gi, 'Master Admin').replace(/\bSydney\b/gi, 'Master Admin');
    }
    return profile;
  }

  const isSydney = isMasterAdminProfile(profile);
  const isOwner = isOwnerUser(currentUser) || (currentUser && currentUser.id === profile.id);

  if (isSydney) {
    if (isOwner) {
      return profile.full_name || profile.fullName || profile.name || "Master Admin";
    }
    return "Master Admin";
  }

  return profile.full_name || profile.fullName || profile.name || profile.username || "User";
};

/**
 * Text masker for UI strings, notes, and labels across the application
 */
export const maskAdminText = (text: string, currentUser?: any): string => {
  if (!text) return text;
  if (isOwnerUser(currentUser)) {
    return text;
  }
  return text
    .replace(/Sydney\s+Mattis/gi, 'Master Admin')
    .replace(/\bSydney\b/gi, 'Master Admin');
};

/**
 * Dropdown profile title: "My Profile" for owner, "Management Team" for others
 */
export const getProfileDropdownLabel = (profile: any, currentUser?: any): string => {
  const isOwner = isOwnerUser(currentUser) || (currentUser && profile && currentUser.id === profile.id);
  if (isOwner) {
    return "My Profile";
  }
  return "Management Team";
};
