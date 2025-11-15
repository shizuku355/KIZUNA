import type { Avatar, Technique, VenueStamp, Favorite } from './types';

const mockTechniques: Technique[] = [
  {
    id: 'tech1',
    name: 'Flying Knee',
    category: 'striking',
    rarity: 'legendary',
    equipped: true,
    iconUrl: '🦵',
  },
  {
    id: 'tech2',
    name: 'Spinning Elbow',
    category: 'striking',
    rarity: 'epic',
    equipped: true,
    iconUrl: '💪',
  },
  {
    id: 'tech3',
    name: 'Rear Naked Choke',
    category: 'grappling',
    rarity: 'rare',
    equipped: true,
    iconUrl: '🤼',
  },
  {
    id: 'tech4',
    name: 'Armbar',
    category: 'grappling',
    rarity: 'epic',
    equipped: true,
    iconUrl: '💪',
  },
  {
    id: 'tech5',
    name: 'Head Movement',
    category: 'defense',
    rarity: 'common',
    equipped: true,
    iconUrl: '👤',
  },
  {
    id: 'tech6',
    name: 'Counter Strike',
    category: 'striking',
    rarity: 'rare',
    equipped: true,
    iconUrl: '👊',
  },
  {
    id: 'tech7',
    name: 'Takedown Defense',
    category: 'defense',
    rarity: 'epic',
    equipped: true,
    iconUrl: '🛡️',
  },
  {
    id: 'tech8',
    name: 'Ground Pound',
    category: 'grappling',
    rarity: 'common',
    equipped: false,
    iconUrl: '✊',
  },
  {
    id: 'tech9',
    name: 'Switch Kick',
    category: 'striking',
    rarity: 'rare',
    equipped: false,
    iconUrl: '🦶',
  },
  {
    id: 'tech10',
    name: 'Superman Punch',
    category: 'striking',
    rarity: 'legendary',
    equipped: false,
    iconUrl: '🥊',
  },
];

const mockStamps: VenueStamp[] = [
  {
    eventId: 'one168',
    eventName: 'ONE 168: Denver',
    date: '2024-09-06',
    venue: 'Ball Arena, Denver',
    color: '#ff4444',
  },
  {
    eventId: 'one167',
    eventName: 'ONE 167: Bangkok',
    date: '2024-08-02',
    venue: 'Impact Arena, Bangkok',
    color: '#44ff44',
  },
  {
    eventId: 'one166',
    eventName: 'ONE 166: Qatar',
    date: '2024-07-05',
    venue: 'Lusail Sports Arena',
    color: '#4444ff',
  },
  {
    eventId: 'one165',
    eventName: 'ONE 165: Tokyo',
    date: '2024-06-15',
    venue: 'Saitama Super Arena',
    color: '#ff44ff',
  },
  {
    eventId: 'one164',
    eventName: 'ONE 164: Manila',
    date: '2024-05-20',
    venue: 'Mall of Asia Arena',
    color: '#ffaa44',
  },
  {
    eventId: 'one163',
    eventName: 'ONE 163: Singapore',
    date: '2024-04-10',
    venue: 'Singapore Indoor Stadium',
    color: '#44ffff',
  },
];

const mockFavorites: Favorite[] = [
  {
    kind: 'fighter',
    id: 'fighter1',
    name: 'Rodtang',
    color: '#ff0000',
    icon: '🥊',
  },
  {
    kind: 'country',
    id: 'jp',
    name: 'Japan',
    color: '#ffffff',
    icon: '🇯🇵',
  },
  {
    kind: 'sport',
    id: 'muaythai',
    name: 'Muay Thai',
    color: '#ffd700',
    icon: '🥋',
  },
];

export const mockAvatar: Avatar = {
  id: 'avatar1',
  owner: '0x1234...5678',
  imageUrl: '/sample_avatar2.png',
  equippedTechniques: mockTechniques.filter(t => t.equipped),
  allTechniques: mockTechniques,
  stamps: mockStamps,
  favorites: mockFavorites,
  auraLevel: 3,
  name: 'Shizuku',
};

export const mockAvatarBoy: Avatar = {
  id: 'avatar2',
  owner: '0xabcd...efgh',
  imageUrl: '/boy_avatar.png',
  equippedTechniques: mockTechniques.filter(t => t.equipped).slice(0, 5),
  allTechniques: mockTechniques,
  stamps: mockStamps.slice(0, 3),
  favorites: mockFavorites.slice(0, 2),
  auraLevel: 2,
  name: 'Rising Fighter',
};
