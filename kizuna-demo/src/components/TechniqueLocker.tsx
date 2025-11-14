import type { Technique } from '../types';
import { useState } from 'react';

interface TechniqueLockerProps {
  techniques: Technique[];
}

const getRarityColor = (rarity: string) => {
  const colors = {
    common: 'from-gray-500 to-gray-600',
    rare: 'from-blue-500 to-blue-600',
    epic: 'from-purple-500 to-purple-600',
    legendary: 'from-yellow-500 to-orange-600',
  };
  return colors[rarity as keyof typeof colors] || colors.common;
};

const getCategoryIcon = (category: string) => {
  const icons = {
    striking: '👊',
    grappling: '🤼',
    defense: '🛡️',
    special: '⭐',
  };
  return icons[category as keyof typeof icons] || '❓';
};

export const TechniqueLocker = ({ techniques }: TechniqueLockerProps) => {
  const [filter, setFilter] = useState<'all' | 'equipped' | 'unequipped'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredTechniques = techniques.filter(tech => {
    if (filter === 'equipped' && !tech.equipped) return false;
    if (filter === 'unequipped' && tech.equipped) return false;
    if (categoryFilter !== 'all' && tech.category !== categoryFilter) return false;
    return true;
  });

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="bg-gray-900 rounded-2xl p-6 shadow-2xl">
        <h2 className="text-2xl font-bold mb-4 text-center">Technique Locker</h2>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              All ({techniques.length})
            </button>
            <button
              onClick={() => setFilter('equipped')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filter === 'equipped' ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Equipped ({techniques.filter(t => t.equipped).length})
            </button>
            <button
              onClick={() => setFilter('unequipped')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filter === 'unequipped' ? 'bg-orange-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Available ({techniques.filter(t => !t.equipped).length})
            </button>
          </div>

          <div className="flex gap-2">
            {['all', 'striking', 'grappling', 'defense', 'special'].map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  categoryFilter === cat ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {cat === 'all' ? 'All' : getCategoryIcon(cat)}
              </button>
            ))}
          </div>
        </div>

        {/* Technique grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredTechniques.map(tech => (
            <div
              key={tech.id}
              className={`relative bg-gradient-to-br ${getRarityColor(tech.rarity)}
                         rounded-xl p-4 shadow-lg hover:scale-105 transition-transform cursor-pointer
                         ${tech.equipped ? 'ring-2 ring-green-400' : ''}`}
            >
              {tech.equipped && (
                <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                  ✓
                </div>
              )}
              <div className="text-4xl text-center mb-2">{tech.iconUrl}</div>
              <div className="text-center">
                <div className="font-bold text-sm mb-1">{tech.name}</div>
                <div className="text-xs opacity-75 flex items-center justify-center gap-1">
                  <span>{getCategoryIcon(tech.category)}</span>
                  <span className="capitalize">{tech.category}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredTechniques.length === 0 && (
          <div className="text-center text-gray-500 py-12">
            No techniques found with current filters
          </div>
        )}
      </div>
    </div>
  );
};
