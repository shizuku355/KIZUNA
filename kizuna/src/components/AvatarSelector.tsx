import { useEffect, useState } from 'react';
// import { useAvatarData } from '../hooks/useAvatarData';
import { listAvatars } from '../services/avatarService';
import type { Avatar } from '../types';

interface AvatarSelectorProps {
  onAvatarSelect: (avatar: Avatar) => void;
}

export const AvatarSelector = ({ onAvatarSelect }: AvatarSelectorProps) => {
  const [mode, setMode] = useState<'mock' | 'sui'>('mock');
  const [avatarObjectId, setAvatarObjectId] = useState('');
  const [selectedMock, setSelectedMock] = useState<'girl' | 'boy'>('girl');
  const [mockAvatars, setMockAvatars] = useState<Avatar[]>([]);

  // Fetch real Sui data when in 'sui' mode (temporarily disabled)
  // const { data: suiAvatar, isLoading, error } = useAvatarData(
  //   mode === 'sui' ? avatarObjectId : null,
  //   mode === 'sui' && !!avatarObjectId
  // );
  let suiAvatar: Avatar | null = null;
  let isLoading: boolean = false;

  useEffect(() => {
    (async () => {
      const all = await listAvatars();
      setMockAvatars(all);
      // Set initial selection
      const initial = all.find(a => a.imageUrl.includes('girl')) ?? all[0];
      if (initial) onAvatarSelect(initial);
    })();
  }, [onAvatarSelect]);

  const handleModeChange = (newMode: 'mock' | 'sui') => {
    setMode(newMode);
    if (newMode === 'mock') {
      const target = mockAvatars.find(a =>
        selectedMock === 'girl' ? a.imageUrl.includes('girl') : a.imageUrl.includes('boy')
      ) ?? mockAvatars[0];
      if (target) onAvatarSelect(target);
    }
  };

  const handleMockSelect = (mock: 'girl' | 'boy') => {
    setSelectedMock(mock);
    if (mode === 'mock') {
      const target = mockAvatars.find(a =>
        mock === 'girl' ? a.imageUrl.includes('girl') : a.imageUrl.includes('boy')
      ) ?? mockAvatars[0];
      if (target) onAvatarSelect(target);
    }
  };

  const handleSuiLoad = () => {
    if (suiAvatar) {
      onAvatarSelect(suiAvatar);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Mode toggle */}
      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={() => handleModeChange('mock')}
          className={`px-6 py-3 rounded-xl font-semibold transition-all ${
            mode === 'mock'
              ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white scale-105 shadow-lg'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          📱 Mock Data (Demo)
        </button>
        <button
          onClick={() => handleModeChange('sui')}
          className={`px-6 py-3 rounded-xl font-semibold transition-all ${
            mode === 'sui'
              ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white scale-105 shadow-lg'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          ⛓️ Sui Blockchain
        </button>
      </div>

      {/* Mock mode - avatar selection */}
      {mode === 'mock' && (
        <div className="flex justify-center gap-4">
          <button
            onClick={() => handleMockSelect('girl')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              selectedMock === 'girl'
                ? 'bg-pink-600 text-white scale-105 shadow-lg'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            👧 Girl Avatar
          </button>
          <button
            onClick={() => handleMockSelect('boy')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              selectedMock === 'boy'
                ? 'bg-blue-600 text-white scale-105 shadow-lg'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            👦 Boy Avatar
          </button>
        </div>
      )}

      {/* Sui mode - object ID input */}
      {mode === 'sui' && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <label className="block text-sm font-semibold mb-2">
              Avatar Object ID (Sui Testnet)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={avatarObjectId}
                onChange={(e) => setAvatarObjectId(e.target.value)}
                placeholder="0x..."
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSuiLoad}
                disabled={!avatarObjectId || isLoading}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? 'Loading...' : 'Load Avatar'}
              </button>
            </div>

            {/* Error and success messages will be handled when Sui integration is enabled */}

            <div className="mt-4 text-xs text-gray-500">
              <p className="mb-2">
                <strong>Note:</strong> To load an avatar from Sui blockchain, you need:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>An Avatar SBT minted on Sui Testnet</li>
                <li>The Avatar object ID (0x...)</li>
                <li>The Avatar should have Dynamic Fields for Techniques, Stamps, and Favorites</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
