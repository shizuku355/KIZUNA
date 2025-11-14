import { suiClient } from './suiClient';
import type { Technique, VenueStamp, Favorite } from '../types';

/**
 * Fetch all dynamic fields from an Avatar object
 * Based on Sui Dynamic Fields documentation: https://docs.sui.io/concepts/dynamic-fields
 */
export async function getDynamicFields(avatarObjectId: string) {
  try {
    const dynamicFields = await suiClient.getDynamicFields({
      parentId: avatarObjectId,
    });

    return dynamicFields.data;
  } catch (error) {
    console.error('Error fetching dynamic fields:', error);
    return [];
  }
}

/**
 * Fetch a specific dynamic field object by its name
 */
export async function getDynamicFieldObject(
  avatarObjectId: string,
  fieldName: string
) {
  try {
    const field = await suiClient.getDynamicFieldObject({
      parentId: avatarObjectId,
      name: {
        type: 'vector<u8>',
        value: Array.from(new TextEncoder().encode(fieldName)),
      },
    });

    return field.data;
  } catch (error) {
    console.error(`Error fetching dynamic field ${fieldName}:`, error);
    return null;
  }
}

/**
 * Parse Technique from Sui dynamic field data
 */
export function parseTechnique(fieldData: any): Technique | null {
  try {
    const content = fieldData.content;
    if (!content || !content.fields) return null;

    const fields = content.fields;

    return {
      id: fieldData.objectId || fields.id?.id || '',
      name: fields.name || '',
      category: parseCategoryFromU8(fields.category),
      rarity: parseRarityFromU8(fields.rarity),
      equipped: fields.equipped || false,
      iconUrl: getIconForTechnique(fields.name, fields.category),
    };
  } catch (error) {
    console.error('Error parsing technique:', error);
    return null;
  }
}

/**
 * Parse VenueStamp from Sui dynamic field data
 */
export function parseVenueStamp(fieldData: any): VenueStamp | null {
  try {
    const content = fieldData.content;
    if (!content || !content.fields) return null;

    const fields = content.fields;

    return {
      eventId: fields.event_id || '',
      eventName: fields.event_name || `Event ${fields.event_id}`,
      date: fields.date_iso || '',
      venue: fields.venue || '',
      color: generateColorFromEventId(fields.event_id),
    };
  } catch (error) {
    console.error('Error parsing venue stamp:', error);
    return null;
  }
}

/**
 * Parse Favorite from Sui dynamic field data
 */
export function parseFavorite(fieldData: any): Favorite | null {
  try {
    const content = fieldData.content;
    if (!content || !content.fields) return null;

    const fields = content.fields;

    return {
      kind: parseKindFromU8(fields.kind),
      id: fields.fav_id || '',
      name: fields.name || fields.fav_id || '',
      color: generateColorFromId(fields.fav_id),
      icon: getIconForFavorite(fields.kind),
    };
  } catch (error) {
    console.error('Error parsing favorite:', error);
    return null;
  }
}

/**
 * Fetch all Techniques from Avatar's dynamic fields
 */
export async function getAvatarTechniques(avatarObjectId: string): Promise<Technique[]> {
  try {
    const fields = await getDynamicFields(avatarObjectId);
    const techniques: Technique[] = [];

    for (const field of fields) {
      // Filter for technique fields (you may need to adjust this based on your Move implementation)
      if (field.name.type.includes('Technique') || isTechniqueKey(field.name.value)) {
        const fieldData = await suiClient.getDynamicFieldObject({
          parentId: avatarObjectId,
          name: field.name,
        });

        if (fieldData.data) {
          const technique = parseTechnique(fieldData.data);
          if (technique) {
            techniques.push(technique);
          }
        }
      }
    }

    return techniques;
  } catch (error) {
    console.error('Error fetching avatar techniques:', error);
    return [];
  }
}

/**
 * Fetch all VenueStamps from Avatar's dynamic fields
 */
export async function getAvatarStamps(avatarObjectId: string): Promise<VenueStamp[]> {
  try {
    const fields = await getDynamicFields(avatarObjectId);
    const stamps: VenueStamp[] = [];

    for (const field of fields) {
      if (field.name.type.includes('VenueStamp') || isStampKey(field.name.value)) {
        const fieldData = await suiClient.getDynamicFieldObject({
          parentId: avatarObjectId,
          name: field.name,
        });

        if (fieldData.data) {
          const stamp = parseVenueStamp(fieldData.data);
          if (stamp) {
            stamps.push(stamp);
          }
        }
      }
    }

    return stamps;
  } catch (error) {
    console.error('Error fetching avatar stamps:', error);
    return [];
  }
}

/**
 * Fetch all Favorites from Avatar's dynamic fields
 */
export async function getAvatarFavorites(avatarObjectId: string): Promise<Favorite[]> {
  try {
    const fields = await getDynamicFields(avatarObjectId);
    const favorites: Favorite[] = [];

    for (const field of fields) {
      if (field.name.type.includes('Favorite') || isFavoriteKey(field.name.value)) {
        const fieldData = await suiClient.getDynamicFieldObject({
          parentId: avatarObjectId,
          name: field.name,
        });

        if (fieldData.data) {
          const favorite = parseFavorite(fieldData.data);
          if (favorite) {
            favorites.push(favorite);
          }
        }
      }
    }

    return favorites;
  } catch (error) {
    console.error('Error fetching avatar favorites:', error);
    return [];
  }
}

// Helper functions

function parseCategoryFromU8(category: number): 'striking' | 'grappling' | 'defense' | 'special' {
  const map = ['striking', 'grappling', 'defense', 'special'] as const;
  return map[category] || 'special';
}

function parseRarityFromU8(rarity: number): 'common' | 'rare' | 'epic' | 'legendary' {
  const map = ['common', 'rare', 'epic', 'legendary'] as const;
  return map[rarity] || 'common';
}

function parseKindFromU8(kind: number): 'fighter' | 'sport' | 'team' | 'country' {
  const map = ['fighter', 'sport', 'team', 'country'] as const;
  return map[kind] || 'fighter';
}

function isTechniqueKey(value: any): boolean {
  // Check if the key looks like a technique key (e.g., "2025-11-15_flying_knee")
  if (typeof value === 'string') {
    return value.includes('_') || !!value.match(/^\d{4}-\d{2}-\d{2}/);
  }
  return false;
}

function isStampKey(value: any): boolean {
  // Check if the key looks like an event ID
  if (typeof value === 'string') {
    return value.toLowerCase().startsWith('one') || value.includes('event');
  }
  return false;
}

function isFavoriteKey(value: any): boolean {
  // Check if the key looks like a favorite ID
  if (typeof value === 'string') {
    return value.includes('fav_') || value.includes('favorite');
  }
  return false;
}

function getIconForTechnique(_name: string, category: number): string {
  const categoryIcons = ['👊', '🤼', '🛡️', '⭐'];
  return categoryIcons[category] || '❓';
}

function getIconForFavorite(kind: number): string {
  const kindIcons = ['🥊', '🥋', '🏆', '🏴'];
  return kindIcons[kind] || '❓';
}

function generateColorFromEventId(eventId: string): string {
  const colors = ['#ff4444', '#44ff44', '#4444ff', '#ff44ff', '#ffaa44', '#44ffff'];
  const hash = eventId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

function generateColorFromId(id: string): string {
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 60%)`;
}
