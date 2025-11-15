import { useMemo, useState } from 'react';
import { AvatarCard } from './components/AvatarCard';
import { LiveWatchDemo } from './components/LiveWatchDemo';
import { TechniqueLocker } from './components/TechniqueLocker';
import { WalletConnect } from './components/WalletConnect';
import { mockAvatar } from './mockData';
import type { Avatar, Lang } from './types';
import { GamePage } from './components/GamePage';
import { AvatarMintPage } from './components/AvatarMintPage';

const navTabs = [
  { key: 'setup', labelEn: 'Start', labelJa: 'はじめる' },
  { key: 'home', labelEn: 'Home', labelJa: 'ホーム' },
  { key: 'live', labelEn: 'Live', labelJa: 'ライブ' },
  { key: 'locker', labelEn: 'Locker', labelJa: 'ロッカー' },
  { key: 'game', labelEn: 'Game', labelJa: 'ゲーム' },
  { key: 'plaza', labelEn: 'KIZUNA Plaza', labelJa: 'KIZUNAプラザ' },
] as const;

function App() {
  const [selectedAvatar] = useState<Avatar>(mockAvatar);
  const [view, setView] = useState<(typeof navTabs)[number]['key']>('home');
  const [lang, setLang] = useState<Lang>('ja');

  const featureHighlights = useMemo(
    () => [
      {
        icon: '📺',
        titleEn: 'Live Watch & Mint',
        titleJa: 'ライブ視聴＆技ミント',
        descEn: 'Watch live events and mint exclusive techniques with time-limited URLs.',
        descJa: 'ライブ配信を見ながら、時間限定パスで技をミント。',
      },
      {
        icon: '🎫',
        titleEn: 'Venue Stamps',
        titleJa: '会場スタンプ',
        descEn: 'Collect stamps by attending live events. Build your golden aura!',
        descJa: '現地来場でスタンプを集めて、オーラを育てる。',
      },
      {
        icon: '💖',
        titleEn: 'Support Favorites',
        titleJa: '推しサポート',
        descEn: 'Choose up to 3 favorites and unlock special name colors and emotes.',
        descJa: '最大3人まで推しを設定し、名前色やエモートを解放。',
      },
      {
        icon: '🏟️',
        titleEn: 'KIZUNA Plaza',
        titleJa: 'KIZUNA Plaza',
        descEn: 'Join the 2D social space, chat with fans, and battle with your techniques.',
        descJa: '2Dの広場で集まり、チャットやエモート、軽量バトルを楽しむ。',
      },
    ],
    []
  );

  const profileMetrics = useMemo(
    () => [
      { label: 'Equipped', value: `${selectedAvatar.equippedTechniques.length}`, color: 'text-yellow-400' },
      { label: 'Total Techniques', value: `${selectedAvatar.allTechniques.length}`, color: 'text-blue-400' },
      { label: 'Stamps', value: `${selectedAvatar.stamps.length}`, color: 'text-green-400' },
      { label: 'Aura Level', value: `${selectedAvatar.auraLevel} / 3`, color: 'text-yellow-200' },
    ],
    [selectedAvatar]
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black">
      {/* Header */}
      <header className="bg-black/50 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-600 bg-clip-text text-transparent leading-none">
                  絆
                </h1>
                <p className="text-[11px] text-gray-400 tracking-[0.18em] uppercase mt-1">
                  KIZUNA
                </p>
              </div>
              <span className="text-sm text-gray-400">
                {lang === 'ja' ? 'ONE Championship ファンプラットフォーム' : 'ONE Championship Fan Platform'}
              </span>
            </div>

            <nav className="flex gap-2 items-center">
              {navTabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setView(tab.key)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    view === tab.key
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {lang === 'ja' ? tab.labelJa : tab.labelEn}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setLang(lang === 'ja' ? 'en' : 'ja')}
                className="ml-2 px-3 py-1 text-xs rounded-lg border border-gray-700 bg-gray-900 text-gray-200 hover:bg-gray-800"
              >
                {lang === 'ja' ? 'EN' : '日本語'}
              </button>
              <div className="ml-2 pl-2 border-l border-gray-800">
                <WalletConnect />
              </div>
            </nav>
        </div>
      </div>
    </header>

      {/* Spotlight effect */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-screen"
          style={{
            background: 'radial-gradient(ellipse at top, rgba(255,255,255,0.05) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8 relative z-10 space-y-10">
        {view === 'setup' && <AvatarMintPage lang={lang} />}

        {view === 'home' && (
          <div className="space-y-10">
            <AvatarCard avatar={selectedAvatar} lang={lang} />
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 rounded-3xl border border-gray-800/70 bg-gradient-to-br from-gray-900 to-black/50 p-6 shadow-2xl">
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  {lang === 'ja' ? 'プロフィール' : 'Profile'}
                </p>
                <h2 className="mt-2 text-3xl font-bold text-white">{selectedAvatar.name}</h2>
                <p className="text-sm text-gray-400 mt-1">
                  {lang === 'ja' ? 'オーナー: ' : 'Owner: '}
                  {selectedAvatar.owner}
                </p>
                <div className="mt-6 grid grid-cols-2 gap-4">
                  {profileMetrics.map(metric => (
                    <div
                      key={metric.label}
                      className="rounded-2xl border border-gray-800/80 bg-gray-950/60 p-4 text-center"
                    >
                      <p className={`text-2xl font-bold ${metric.color}`}>{metric.value}</p>
                      <p className="text-xs uppercase tracking-wide text-gray-500">{metric.label}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6">
                  <p className="text-xs uppercase tracking-wide text-gray-500">Favorites</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedAvatar.favorites.map(fav => (
                      <span
                        key={fav.id}
                        className="rounded-full border border-gray-800 px-3 py-1 text-xs font-semibold text-gray-100"
                      >
                        {fav.icon} {fav.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="rounded-3xl border border-dashed border-gray-700/80 bg-gradient-to-b from-black to-gray-900/70 p-6 shadow-lg">
                <p className="text-sm text-gray-400">
                  {lang === 'ja' ? 'なぜ Shizuku なのか？' : 'Why Shizuku?'}
                </p>
                <p className="mt-2 text-gray-200">
                  {lang === 'ja'
                    ? 'Shizuku は ONE Championship のエネルギーを、しなやかな動きとレアな技、スタジアムスタンプの収集で体現します。このホーム画面では、その時点のステータスを一目で確認できます。'
                    : "Shizuku channels the ONE Championship energy with graceful movement, rare techniques, and stadium stamps. This home screen highlights her in-progress stats so fans can see what makes every appearance special."}
                </p>
                <div className="mt-4 space-y-3 text-sm text-gray-400">
                  <div>
                    <span className="font-semibold text-white">
                      {lang === 'ja' ? 'オーラ状態:' : 'Aura status:'}
                    </span>{' '}
                    Golden tide — Level 3
                  </div>
                  <div>
                    <span className="font-semibold text-white">
                      {lang === 'ja' ? '次のミント:' : 'Next Mint:'}
                    </span>{' '}
                    {lang === 'ja'
                      ? 'ライブ視聴ドロップやトークンゲート QR によってトリガー。'
                      : 'Triggered by live watch drops and token-gated QR codes.'}
                  </div>
                  <div>
                    <span className="font-semibold text-white">
                      {lang === 'ja' ? 'オンチェーン準備:' : 'On-chain ready:'}
                    </span>{' '}
                    {lang === 'ja'
                      ? 'アバター・技・スタンプデータは Move 向けスキーマで整理済み。'
                      : 'Move-friendly schema for avatar, technique, and stamp data.'}
                  </div>
                </div>
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {featureHighlights.map(card => (
                <div
                  key={card.title}
                  className="rounded-3xl border border-gray-800/60 bg-gray-950/60 p-6 text-sm shadow-xl"
                >
                  <div className="text-3xl">{card.icon}</div>
                  <h3 className="mt-3 text-lg font-semibold text-white">
                    {lang === 'ja' ? card.titleJa : card.titleEn}
                  </h3>
                  <p className="mt-2 text-gray-400">
                    {lang === 'ja' ? card.descJa : card.descEn}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'live' && (
          <div className="rounded-3xl border border-gray-800/60 bg-gray-950/50 p-6 shadow-2xl">
            <LiveWatchDemo lang={lang} />
          </div>
        )}

        {view === 'locker' && (
          <div className="rounded-3xl border border-gray-800/60 bg-gray-950/50 p-6 shadow-2xl">
            <TechniqueLocker techniques={selectedAvatar.allTechniques} lang={lang} />
          </div>
        )}

        {view === 'game' && <GamePage avatar={selectedAvatar} lang={lang} />}

        {view === 'plaza' && (
          <div className="rounded-3xl border border-gray-800/70 bg-gradient-to-br from-indigo-950 to-black/50 p-8 shadow-2xl">
            <div className="flex flex-col gap-6 lg:flex-row">
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-white">KIZUNA Plaza</h2>
                <p className="mt-2 text-gray-300">
                  {lang === 'ja'
                    ? 'SBT ホルダーが集うメタバースロビー。スタンプ数に応じたライティングやエモートで、ONE Championship の熱量を表現します。'
                    : 'Step into the metaverse lobby where SBT holders converge. This space mirrors the ONE Championship energy with decentralized movement, reactive lighting from stamp count, and emote-driven greetings.'}
                </p>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-gray-800 bg-black/40 p-4">
                    <h3 className="text-sm font-semibold uppercase text-gray-400">
                      {lang === 'ja' ? 'Chat' : 'Chat'}
                    </h3>
                    <p className="mt-2 text-sm text-gray-300">
                      Local radius chat bubbles, vocal chants, and Kaiju callouts keep the plaza alive.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-gray-800 bg-black/40 p-4">
                    <h3 className="text-sm font-semibold uppercase text-gray-400">Emotes</h3>
                    <p className="mt-2 text-sm text-gray-300">
                      Equip technique icons as emotes and watch them pop above avatars during plaza battles.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-gray-800 bg-black/40 p-4">
                    <h3 className="text-sm font-semibold uppercase text-gray-400">Battle</h3>
                    <p className="mt-2 text-sm text-gray-300">
                      One-turn duels settle in the plaza, with results optionally pushed on-chain for
                      leaderboards.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-gray-800 bg-black/40 p-4">
                    <h3 className="text-sm font-semibold uppercase text-gray-400">
                      {lang === 'ja' ? 'Photo Ops' : 'Photo Ops'}
                    </h3>
                    <p className="mt-2 text-sm text-gray-300">
                      Capture a Walrus-backed snapshot and encrypt with Seal for VIP sharing.
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex-1 overflow-hidden rounded-3xl border border-purple-700/80 bg-gradient-to-br from-black to-purple-950/80 p-4 shadow-2xl">
                <img
                  src="/KIZUNA.png"
                  alt="KIZUNA Plaza preview"
                  className="h-full w-full rounded-2xl border border-purple-500/60 object-cover"
                />
                <p className="mt-3 text-xs uppercase tracking-wider text-purple-300">
                  Concept art for the KIZUNA Plaza metaverse lobby
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Tech stack footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-gray-800">
        <div className="text-center text-gray-500 text-sm space-y-2">
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <span className="px-3 py-1 bg-gray-900 rounded-full">Sui Blockchain</span>
            <span className="px-3 py-1 bg-gray-900 rounded-full">Walrus Storage</span>
            <span className="px-3 py-1 bg-gray-900 rounded-full">Seal Encryption</span>
            <span className="px-3 py-1 bg-gray-900 rounded-full">zkLogin</span>
          </div>
          <p className="mt-4">Built for ONE Championship Hackathon</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
