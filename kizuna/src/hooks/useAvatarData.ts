import { useQuery } from '@tanstack/react-query';
import { suiClient } from '../lib/suiClient';
import {
  getAvatarTechniques,
  getAvatarStamps,
  getAvatarFavorites,
} from '../lib/dynamicFields';
import type { Avatar } from '../types';

/**
 * Fetch Avatar object and its dynamic fields from Sui blockchain
 */
export function useAvatarData(avatarObjectId: string | null, enabled: boolean = true) {
  return useQuery({
    queryKey: ['avatar', avatarObjectId],
    queryFn: async () => {
      if (!avatarObjectId) {
        throw new Error('Avatar object ID is required');
      }

      // Fetch the Avatar object itself
      const avatarObject = await suiClient.getObject({
        id: avatarObjectId,
        options: {
          showContent: true,
          showOwner: true,
        },
      });

      if (!avatarObject.data) {
        throw new Error('Avatar not found');
      }

      const content = avatarObject.data.content;
      if (content?.dataType !== 'moveObject') {
        throw new Error('Invalid avatar object');
      }

      const fields = content.fields as any;

      // Fetch dynamic fields in parallel
      const [techniques, stamps, favorites] = await Promise.all([
        getAvatarTechniques(avatarObjectId),
        getAvatarStamps(avatarObjectId),
        getAvatarFavorites(avatarObjectId),
      ]);

      // Separate equipped and all techniques
      const equippedTechniques = techniques.filter(t => t.equipped);

      // Build the Avatar object
      const owner = avatarObject.data.owner;
      const ownerAddress = owner && typeof owner === 'object' && 'AddressOwner' in owner
        ? owner.AddressOwner
        : '';

      const avatar: Avatar = {
        id: avatarObjectId,
        owner: ownerAddress,
        imageUrl: fields.image_url || '/girl_avatar.png', // Fallback to default
        equippedTechniques,
        allTechniques: techniques,
        stamps,
        favorites,
        auraLevel: (fields.aura_level || 0) as 0 | 1 | 2 | 3,
        name: fields.name || 'Warrior',
      };

      return avatar;
    },
    enabled: enabled && !!avatarObjectId,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });
}

/**
 * Fetch only Techniques from an Avatar
 */
export function useAvatarTechniques(avatarObjectId: string | null) {
  return useQuery({
    queryKey: ['techniques', avatarObjectId],
    queryFn: async () => {
      if (!avatarObjectId) return [];
      return getAvatarTechniques(avatarObjectId);
    },
    enabled: !!avatarObjectId,
    staleTime: 30000,
  });
}

/**
 * Fetch only VenueStamps from an Avatar
 */
export function useAvatarStamps(avatarObjectId: string | null) {
  return useQuery({
    queryKey: ['stamps', avatarObjectId],
    queryFn: async () => {
      if (!avatarObjectId) return [];
      return getAvatarStamps(avatarObjectId);
    },
    enabled: !!avatarObjectId,
    staleTime: 30000,
  });
}

/**
 * Fetch only Favorites from an Avatar
 */
export function useAvatarFavorites(avatarObjectId: string | null) {
  return useQuery({
    queryKey: ['favorites', avatarObjectId],
    queryFn: async () => {
      if (!avatarObjectId) return [];
      return getAvatarFavorites(avatarObjectId);
    },
    enabled: !!avatarObjectId,
    staleTime: 30000,
  });
}

/**
 * Check if an address owns an Avatar SBT
 */
export function useHasAvatar(address: string | null) {
  return useQuery({
    queryKey: ['hasAvatar', address],
    queryFn: async () => {
      if (!address) return null;

      // Query all objects owned by the address
      const ownedObjects = await suiClient.getOwnedObjects({
        owner: address,
        options: {
          showType: true,
        },
      });

      // Find Avatar object (adjust the type check based on your Move package)
      const avatarObject = ownedObjects.data.find(obj => {
        const type = obj.data?.type;
        return type?.includes('Avatar') || type?.includes('::avatar::Avatar');
      });

      return avatarObject?.data?.objectId || null;
    },
    enabled: !!address,
    staleTime: 60000,
  });
}
