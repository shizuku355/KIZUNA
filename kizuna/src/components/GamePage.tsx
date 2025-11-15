import type { Avatar, Technique, Lang } from '../types';

const TECHNIQUE_ICONS: Record<string, string> = {
  Strike: '/strike.png',
  Grapple: '/grapple.png',
  Counter: '/counter.png',
};

type GamePageProps = {
  avatar: Avatar;
  lang: Lang;
};

export function GamePage({ avatar, lang }: GamePageProps) {
  const equipped = avatar.equippedTechniques.slice(0, 3);

  return (
    <div className="rounded-3xl border border-gray-800/70 bg-gradient-to-br from-gray-950 to-black/70 p-6 shadow-2xl space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-yellow-500/50 bg-black/70 min-h-[320px]">
        <div className="pointer-events-none absolute inset-0 opacity-60">
          <div className="h-full w-full bg-[radial-gradient(circle_at_top,_rgba(255,166,77,0.25),_transparent_40%)]" />
          <img src="/game_bg.png" alt="KIZUNA battle arena" className="h-full w-full object-cover mix-blend-screen" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
        </div>

        <div className="relative z-10 flex h-full flex-col justify-between p-4 md:p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-yellow-300">
                {lang === 'ja' ? 'Game' : 'Game'}
              </p>
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                {lang === 'ja' ? 'テクニックバトル' : 'Technique Battle'}
              </h2>
              <p className="mt-1 text-xs md:text-sm text-gray-300">
                {lang === 'ja'
                  ? '3 スロットのロードアウトで Strike / Grapple / Counter を選び、ラウンド勝敗を競うイメージを表現。'
                  : 'Pick Strike / Grapple / Counter for each of your 3 slots and imagine the round-by-round showdown.'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-xs text-gray-300">
                <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400">Aura</p>
                <p className="text-sm font-semibold text-white">Level {avatar.auraLevel}</p>
              </div>
              <div className="flex items-center gap-2">
                <img
                  src="/avatars/man3.png"
                  alt="Opponent avatar"
                  className="h-12 w-12 rounded-full border border-gray-600 object-cover"
                />
                <img
                  src="/avatars/woman3.png"
                  alt="Player avatar"
                  className="h-12 w-12 rounded-full border border-yellow-400 object-cover"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 pt-4 md:pt-6">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-gray-400">
              <span>{lang === 'ja' ? 'R O U N D S' : 'ROUNDS'}</span>
              <span>{lang === 'ja' ? 'Best of 3' : 'Best of 3'}</span>
            </div>
            <div className="flex gap-3">
              {['Round 1', 'Round 2', 'Round 3'].map((roundLabel, index) => (
                <div
                  key={roundLabel}
                  className="flex-1 rounded-2xl border border-gray-700/80 bg-black/60 p-3 text-center text-xs uppercase tracking-[0.3em] text-gray-300"
                >
                  <p className="text-2xs">ROUND</p>
                  <p className="mt-1 text-sm font-semibold text-white">{index + 1}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 grid gap-4 md:grid-cols-3">
            {['slot_1', 'slot_2', 'slot_3'].map((slotLabel, idx) => {
              const tech = equipped[idx] as Technique | undefined;
              return (
                <div
                  key={slotLabel}
                  className="relative overflow-hidden rounded-2xl border border-yellow-500/80 bg-black/60 p-3 md:p-4"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-600/10 to-transparent" />
                  <div className="relative z-10 flex flex-col gap-2">
                    <div className="flex items-center justify-between text-[10px] uppercase tracking-wide text-gray-300">
                      <span>{slotLabel.toUpperCase()}</span>
                      <span className="px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-200 border border-yellow-500/40">
                        Battle Slot
                      </span>
                    </div>
                    {tech ? (
                      <div className="space-y-1">
                        <div className="text-sm md:text-lg font-semibold text-white">{tech.name}</div>
                        <div className="flex items-center gap-2 text-[11px] text-gray-200">
                          <img
                            src={TECHNIQUE_ICONS[tech.category] ?? '/strike.png'}
                            alt={`${tech.category} icon`}
                            className="h-5 w-5 rounded-full border border-yellow-400/40 bg-black/60 p-1"
                          />
                          <span className="font-semibold text-yellow-300">{tech.category}</span>
                          <span className="text-[10px] text-gray-400">Lv 01</span>
                        </div>
                        <p className="text-[11px] text-gray-300">
                          {lang === 'ja'
                            ? '威力が高いアタック・防御・カウンターを切り替える。'
                            : 'Toggle between offense, grapple control, and counter bursts.'}
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs md:text-sm text-gray-400">
                        {lang === 'ja'
                          ? 'ロッカーから技を選んでセット。'
                          : 'Choose a technique from the locker.'}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="space-y-4 md:flex md:space-y-0 md:gap-4">
        <div className="flex-1 rounded-2xl border border-gray-800/80 bg-gray-950/60 p-4 text-sm text-gray-300 space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-gray-400">
            {lang === 'ja' ? 'Technique Icons' : 'Technique Icons'}
          </p>
          <div className="flex items-center gap-4 justify-between">
            {(['Strike', 'Grapple', 'Counter'] as const).map(attr => (
              <div key={attr} className="flex flex-col items-center gap-1 text-[11px] text-gray-300">
                <div className="h-12 w-12 rounded-full border border-yellow-500/40 bg-black/60 p-3 shadow-lg">
                  <img src={TECHNIQUE_ICONS[attr]} alt={attr} className="h-full w-full object-contain" />
                </div>
                <span className="font-semibold text-white">{attr}</span>
                <span className="text-[10px] text-gray-500">
                  {attr === 'Strike'
                    ? lang === 'ja'
                      ? '殴る'
                      : 'Strike'
                    : attr === 'Grapple'
                      ? lang === 'ja'
                        ? '技をかける'
                        : 'Grapple'
                      : lang === 'ja'
                        ? 'カウンター'
                        : 'Counter'}
                </span>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-gray-500">
            {lang === 'ja'
              ? 'ゲームではこの 3 属性の三すくみでラウンドに勝敗がつき、オーラやスタンプに反映される。'
              : 'These three attributes form the rock-paper-scissors triangle that decides each round and feeds your aura.'}
          </p>
        </div>
        <div className="flex-1 rounded-2xl border border-yellow-500/70 bg-gradient-to-br from-yellow-500/10 to-transparent p-4 text-sm text-gray-200 space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-yellow-200">
            {lang === 'ja' ? 'Battle Highlight' : 'Battle Highlight'}
          </p>
          <p className="text-[11px] text-gray-200">
            {lang === 'ja'
              ? '右のウーマンアバターが Strike を出し、左のマンアバターが Counter を返した。最終ラウンドの勝敗は Aura にスコアされる。'
              : 'The woman avatar plays Strike while the man avatar counters—illustrating how round outcomes translate into aura boosts.'}
          </p>
          <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-yellow-300">
            <span>{lang === 'ja' ? 'WIN RATE' : 'WIN RATE'}</span>
            <span className="text-sm font-semibold text-white">2 / 3</span>
          </div>
          <div className="h-2 rounded-full bg-yellow-500/30">
            <div className="h-full w-2/3 rounded-full bg-yellow-400" />
          </div>
        </div>
      </div>

      <div className="md:flex md:items-start md:gap-4">
        <div className="flex-1 rounded-3xl border border-purple-500/70 bg-black p-4">
          <h3 className="text-lg font-semibold text-white mb-2">
            {lang === 'ja' ? 'GAME イメージ' : 'GAME visual'}
          </h3>
          <div className="flex justify-center">
            <div className="overflow-hidden rounded-2xl border border-gray-700 bg-black w-3/4">
              <img src="/game.png" alt="Technique battle visual" className="w-full block object-cover" />
            </div>
          </div>
          <p className="mt-3 text-sm text-gray-300">
            {lang === 'ja'
              ? 'そのままゲーム画面として見せられる、Strike / Grapple / Counter の一斉発動イメージ。無加工でどアップ表示することで、ライブ感を演出します。'
              : 'A direct shot of the Strike / Grapple / Counter explosion. Displaying it full-size without effects makes the battle feel like a real gameplay screen.'}
          </p>
        </div>
        <div className="flex-1 rounded-3xl border border-gray-800/70 bg-gray-950/60 p-4 mt-4 md:mt-0">
          <p className="text-xs uppercase tracking-[0.3em] text-gray-400">
            {lang === 'ja' ? 'テクニックバトル' : 'Technique Battle'}
          </p>
          <h3 className="text-xl font-bold text-white mt-1">
            {lang === 'ja'
              ? '3 スロットで技を配置'
              : 'Choose a loadout of 3 techniques'}
          </h3>
          <p className="text-xs text-gray-500 mt-2">
            {lang === 'ja'
              ? 'この枠内では三すくみを意識した UI を整え、ラウンド制のバトルらしさを演出。'
              : 'This panel keeps track of the rock-paper-scissors flow, making each round feel like a proper match.'}
          </p>
          <div className="mt-4 space-y-2 text-sm text-gray-300">
            <p>- {lang === 'ja' ? 'Strike は攻撃特化' : 'Strike: aggressive finish'}</p>
            <p>- {lang === 'ja' ? 'Grapple は制圧' : 'Grapple: control and grip'}</p>
            <p>- {lang === 'ja' ? 'Counter は翻弄' : 'Counter: turn the tables'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
