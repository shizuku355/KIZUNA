export interface Technique {
  id: string;
  name: string;
  category: 'striking' | 'grappling' | 'defense' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  equipped: boolean;
  iconUrl?: string;
}

export interface VenueStamp {
  eventId: string;
  eventName: string;
  date: string;
  venue: string;
  color: string;
}

export interface Favorite {
  kind: 'fighter' | 'sport' | 'team' | 'country';
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface Avatar {
  id: string;
  owner: string;
  imageUrl: string;
  equippedTechniques: Technique[];
  allTechniques: Technique[];
  stamps: VenueStamp[];
  favorites: Favorite[];
  auraLevel: 0 | 1 | 2 | 3;
  name: string;
}
