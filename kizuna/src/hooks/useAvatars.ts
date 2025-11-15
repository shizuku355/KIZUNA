import { useEffect, useMemo, useState } from 'react';
import type { Avatar } from '../types';
import { getDefaultAvatar, listAvatars } from '../services/avatarService';

export function useAvatars() {
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const all = await listAvatars();
      setAvatars(all);
      if (!selectedId) {
        const def = await getDefaultAvatar();
        setSelectedId(def.id);
      }
    })();
  }, []);

  const selected = useMemo(
    () => avatars.find(a => a.id === selectedId) ?? avatars[0],
    [avatars, selectedId]
  );

  return {
    avatars,
    selected,
    select: (id: string) => setSelectedId(id),
  };
}

