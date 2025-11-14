import type { Avatar } from '../types';

interface AvatarCardProps {
  avatar: Avatar;
}

const AuraGlow = ({ level }: { level: number }) => {
  if (level === 0) return null;

  const colors = ['', 'rgba(255, 215, 0, 0.3)', 'rgba(255, 215, 0, 0.5)', 'rgba(255, 215, 0, 0.7)'];
  const borderWidths = [0, 4, 6, 8];

  return (
    <div
      className="absolute inset-0 rounded-2xl pointer-events-none"
      style={{
        boxShadow: `0 0 ${20 + level * 10}px ${colors[level]}, inset 0 0 ${10 + level * 5}px ${colors[level]}`,
        border: `${borderWidths[level]}px solid rgba(255, 215, 0, 0.6)`,
      }}
    />
  );
};

export const AvatarCard = ({ avatar }: AvatarCardProps) => {
  return (
    <div className="relative w-full max-w-2xl mx-auto p-8">
      {/* Aura glow for venue attendees */}
      <AuraGlow level={avatar.auraLevel} />

      {/* Main card */}
      <div className="relative bg-gradient-to-b from-gray-900 to-black rounded-2xl p-8 shadow-2xl">
        {/* Name and favorites */}
        <div className="text-center mb-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <h2 className="text-2xl font-bold">{avatar.name}</h2>
            {avatar.favorites.map((fav, i) => (
              <span key={i} className="text-xl" title={fav.name}>
                {fav.icon}
              </span>
            ))}
          </div>
          <p className="text-gray-400 text-sm">{avatar.owner}</p>
        </div>

        {/* Center avatar only (square, large) */}
        <div className="relative mb-8">
          <div className="flex items-center justify-center">
            <div className="relative w-96 h-96 overflow-hidden shadow-2xl border border-gray-700 bg-black">
              <img
                src={avatar.imageUrl}
                alt={avatar.name}
                className="absolute inset-0 w-full h-full object-contain"
              />
            </div>
          </div>
        </div>

        {/* Stats (stamp UI removed) */}
        <div className="flex justify-around mb-6 text-center">
          <div>
            <div className="text-2xl font-bold text-yellow-400">{avatar.equippedTechniques.length}</div>
            <div className="text-xs text-gray-400">Equipped</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-400">{avatar.allTechniques.length}</div>
            <div className="text-xs text-gray-400">Total Techniques</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-pink-400">{avatar.favorites.length}</div>
            <div className="text-xs text-gray-400">Favorites</div>
          </div>
        </div>

        {/* Stamp band removed (handled on-chain SVG in future) */}

        {/* Venue crest indicator (keep) */}
        {avatar.auraLevel > 0 && (
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <span className="text-yellow-400 text-xs font-semibold">VENUE WARRIOR</span>
            <div className="flex gap-1">
              {[...Array(avatar.auraLevel)].map((_, i) => (
                <div key={i} className="w-2 h-2 bg-yellow-400 rounded-full" />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
