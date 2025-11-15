import type { Avatar, Technique, Lang } from '../types';

type GamePageProps = {
  avatar: Avatar;
  lang: Lang;
};

export function GamePage({ avatar, lang }: GamePageProps) {
  const equipped = avatar.equippedTechniques.slice(0, 3);

  return (
    <div className="rounded-3xl border border-gray-800/70 bg-gradient-to-br from-gray-950 to-black/70 p-6 shadow-2xl space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-yellow-500/50 bg-black/70 min-h-[260px]">
        <div className="pointer-events-none absolute inset-0 opacity-70">
          <img src="/game_bg.png" alt="KIZUNA battle arena" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        </div>

        <div className="relative z-10 flex h-full flex-col justify-between p-4 md:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-yellow-300">
                {lang === 'ja' ? 'Game' : 'Game'}
              </p>
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                {lang === 'ja' ? 'テクニックバトル' : 'Technique Battle'}
              </h2>
              <p className="mt-1 text-xs md:text-sm text-gray-300">
                {lang === 'ja'
                  ? '3 スロットに技をセットして、じゃんけん方式で勝負。ここではロードアウトとラウンドの流れを体感する。'
                  : 'Set 3 techniques into battle slots and play a rock-paper-scissors style duel. This view focuses on loadout and round flow.'}
              </p>
            </div>
            <div className="hidden md:flex flex-col items-end text-xs text-gray-300">
              <span className="text-[10px] uppercase tracking-wide text-gray-400">Avatar</span>
              <span className="text-sm font-semibold text-white">{avatar.name}</span>
              <span className="text-[11px] text-gray-400">Aura Lv. {avatar.auraLevel} / 3</span>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 md:gap-4">
            <p className="text-[11px] uppercase tracking-wide text-gray-300">
              {lang === 'ja' ? 'Battle Slots' : 'Battle Slots'}
            </p>
            <div className="grid gap-3 md:grid-cols-3">
              {['slot_1', 'slot_2', 'slot_3'].map((slotLabel, idx) => {
                const tech = equipped[idx] as Technique | undefined;
                return (
                  <div
                    key={slotLabel}
                    className="rounded-2xl border border-yellow-500/70 bg-black/70/80 p-3 md:p-4 flex flex-col gap-2 backdrop-blur-sm"
                  >
                    <div className="flex items-center justify-between text-[10px] uppercase tracking-wide text-gray-300">
                      <span>{slotLabel.toUpperCase()}</span>
                      <span className="px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-300 border border-yellow-500/40">
                        Battle Slot
                      </span>
                    </div>
                    {tech ? (
                      <>
                        <div className="text-sm md:text-lg font-semibold text-white truncate">
                          {tech.name}
                        </div>
                        <div className="text-[11px] text-gray-300">
                          Attr:{' '}
                          <span className="font-semibold text-yellow-300">
                            {tech.category}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="text-xs md:text-sm text-gray-400">
                        {lang === 'ja'
                          ? 'ロッカーから技を選んでセット。'
                          : 'Choose a technique from the locker.'}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2 text-sm text-gray-300">
        <p>
          {lang === 'ja'
            ? 'この画面では、KIZUNA アバターが持つ技の中から 3 つを選んで「ロードアウト」を組み、1 ラウンドごとに Strike / Grapple / Counter の三すくみで勝敗を決めるデモを行う。'
            : 'Here you pick 3 techniques from your KIZUNA avatar to form a loadout and run a 3-round rock-paper-scissors demo using Strike / Grapple / Counter.'}
        </p>
        <p className="text-xs text-gray-500">
          {lang === 'ja'
            ? 'v1 はフェアなじゃんけんロジックに絞り、オーラや戦績による補正は行わない。将来的には、この結果を Move コントラクトの record_battle に送り、オンチェーン戦績として記録する。'
            : 'In v1 we keep the logic fair and simple, without aura or history bonuses. Later, these results can be sent to the Move record_battle function to be stored on-chain.'}
        </p>
      </div>
    </div>
  );
}
