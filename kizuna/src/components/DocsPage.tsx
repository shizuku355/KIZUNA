import type { Lang } from '../types';

type Props = {
  lang: Lang;
};

export function DocsPage({ lang }: Props) {
  const isJa = lang === 'ja';

  return (
    <div className="space-y-8 text-gray-100">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-wide text-gray-500">
          {isJa ? 'プロジェクトドキュメント' : 'Project Documentation'}
        </p>
        <h2 className="text-3xl font-bold">
          {isJa ? 'KIZUNA README' : 'KIZUNA README'}
        </h2>
        <p className="text-sm text-gray-400 max-w-3xl">
          {isJa
            ? 'KIZUNA は ONE Championship ファン活動を dNFT（Soulbound Avatar）として可視化する Web3 プロジェクトです。このページではコンセプトと主要要素をまとめています。'
            : 'KIZUNA turns ONE Championship fandom into a living dNFT (Soulbound Avatar). This page summarizes the core concept and main building blocks.'}
        </p>
      </header>

      {/* Concept */}
      <section className="space-y-3 rounded-3xl border border-gray-800/70 bg-gray-950/60 p-6">
        <h3 className="text-xl font-semibold">
          {isJa ? 'コンセプト' : 'Concept'}
        </h3>
        <p className="text-sm text-gray-300">
          {isJa
            ? 'KIZUNA は、ライブ視聴・会場来場・ゲーム・推し登録といった行動をすべて一つの Soulbound Avatar に集約し、オーラとして進化させる「ONE Championship ファン OS」です。'
            : 'KIZUNA works as a “fan OS” for ONE Championship, aggregating your live watching, venue attendance, game results, and favorites into a single Soulbound Avatar whose aura evolves over time.'}
        </p>
        <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
          <li>
            {isJa
              ? 'ライブ視聴で限定わざ（Techniques）をミント'
              : 'Mint limited Techniques while watching live streams.'}
          </li>
          <li>
            {isJa
              ? '会場 QR でスタンプ（Venue Stamps）を獲得'
              : 'Earn venue stamps via QR codes at arenas.'}
          </li>
          <li>
            {isJa
              ? '最大 3 つの推し（Favorites）を登録し、応援履歴を残す'
              : 'Register up to three Favorites and build a history of support.'}
          </li>
          <li>
            {isJa
              ? 'KIZUNA Plaza でファンや選手と交流'
              : 'Meet other fans and fighters in the KIZUNA Plaza.'}
          </li>
        </ul>
      </section>

      {/* Avatar SBT */}
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] items-start rounded-3xl border border-gray-800/70 bg-gray-950/60 p-6">
        <div className="space-y-3">
          <h3 className="text-xl font-semibold">
            {isJa ? 'アバター SBT' : 'The Avatar (SBT)'}
          </h3>
          <p className="text-sm text-gray-300">
            {isJa
              ? 'ウォレット接続後に 1 体だけミントできる譲渡不可の Soulbound Avatar です。オンチェーンでは技・スタンプ・推し・バトル戦績・オーラレベルなどをトラッキングします。'
              : 'After connecting a wallet, users mint a single non-transferable Soulbound Avatar. On-chain it tracks techniques, venue stamps, favorites, battle stats, and aura level.'}
          </p>
          <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
            <li>{isJa ? '装備中・所有中の Techniques' : 'Equipped and owned Techniques'}</li>
            <li>{isJa ? '会場スタンプ（来場履歴）' : 'Venue stamps (attendance history)'}</li>
            <li>{isJa ? 'Favorites（最大 3 スロット）' : 'Favorites (up to three slots)'}</li>
            <li>{isJa ? 'バトル戦績と Aura レベル (0–3)' : 'Battle stats and Aura level (0–3)'}</li>
          </ul>
          <p className="text-sm text-gray-300">
            {isJa
              ? 'アバターのビジュアルは Walrus に Blob として保存され、Move コントラクト側には Walrus Blob ID のみを保持します。画像差し替えは Blob ID を更新するだけで完了し、コントラクトの再デプロイは不要です。'
              : 'Avatar visuals are stored on Walrus as blobs; the Move contract stores only the Walrus Blob ID. Updating the avatar image is as simple as changing this blob reference, without redeploying contracts.'}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-800 bg-black/60 p-4">
          <img
            src="/sample_avatar2.png"
            alt="KIZUNA Avatar sample"
            className="w-full rounded-xl border border-gray-700 object-cover"
          />
          <p className="mt-3 text-xs text-gray-400">
            {isJa
              ? 'Walrus 上の Blob として管理されるアバター画像の一例。'
              : 'Example of an avatar image managed as a Walrus blob.'}
          </p>
        </div>
      </section>

      {/* Aura */}
      <section className="space-y-4 rounded-3xl border border-gray-800/70 bg-gray-950/60 p-6">
        <h3 className="text-xl font-semibold">
          {isJa ? 'dNFT オーラ（3 段階）' : 'dNFT Aura (Three Stages)'}
        </h3>
        <p className="text-sm text-gray-300">
          {isJa
            ? 'オーラはファン活動の可視化レイヤーです。スタンプ数・装備技数・視聴スコア・Favorites などからスコアを計算し、0〜3 段階のオーラレベルにマッピングします。'
            : 'Aura is the visual representation of fandom. The contract aggregates stamps, equipped techniques, watch score, and favorites into a score that maps to aura levels 0–3.'}
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2 text-center">
            <p className="text-sm font-semibold">
              {isJa ? 'オーラ レベル 1' : 'Aura Level 1'}
            </p>
            <img
              src="/Level1.png"
              alt="Aura Level 1"
              className="mx-auto rounded-xl border border-gray-700 object-cover"
            />
          </div>
          <div className="space-y-2 text-center">
            <p className="text-sm font-semibold">
              {isJa ? 'オーラ レベル 2' : 'Aura Level 2'}
            </p>
            <img
              src="/Level2.png"
              alt="Aura Level 2"
              className="mx-auto rounded-xl border border-gray-700 object-cover"
            />
          </div>
          <div className="space-y-2 text-center">
            <p className="text-sm font-semibold">
              {isJa ? 'オーラ レベル 3' : 'Aura Level 3'}
            </p>
            <img
              src="/Level3.png"
              alt="Aura Level 3"
              className="mx-auto rounded-xl border border-gray-700 object-cover"
            />
          </div>
        </div>
      </section>

      {/* Sui / Walrus / Seal */}
      <section className="space-y-4 rounded-3xl border border-gray-800/70 bg-gray-950/60 p-6">
        <h3 className="text-xl font-semibold">
          {isJa ? 'Sui / Walrus / Seal の活用' : 'How We Use Sui / Walrus / Seal'}
        </h3>
        <div className="grid gap-4 md:grid-cols-3 text-sm text-gray-300">
          <div className="space-y-2">
            <h4 className="font-semibold">Sui</h4>
            <p>
              {isJa
                ? 'アバター SBT、Techniques、Stamps、Favorites、バトル戦績などのコア状態を Move で管理し、ファンの歴史を検証可能かつポータブルに保ちます。'
                : 'Hosts core state in Move: avatar SBT, techniques, stamps, favorites, and battle records, keeping fan history verifiable and portable.'}
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold">Walrus</h4>
            <p>
              {isJa
                ? 'アバター画像やオーラ別のビジュアルを Blob として保存。コントラクト側は Blob ID のみ保持し、`set_walrus_blob_id` で表示画像を差し替えます。'
                : 'Stores avatar and aura visuals as blobs. Contracts store only blob IDs and use `set_walrus_blob_id` to swap display images safely.'}
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold">Seal</h4>
            <p>
              {isJa
                ? 'VIP フォトや限定クリップなど、SBT ホルダーだけが復号できる暗号化コンテンツの配布に活用予定です。'
                : 'Planned for encrypted assets such as VIP photos or private highlights that only SBT holders can decrypt.'}
            </p>
          </div>
        </div>
      </section>

      {/* KIZUNA Plaza */}
      <section className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] rounded-3xl border border-gray-800/70 bg-gray-950/60 p-6">
        <div className="space-y-3">
          <h3 className="text-xl font-semibold">
            {isJa ? 'KIZUNA プラザ' : 'KIZUNA Plaza'}
          </h3>
          <p className="text-sm text-gray-300">
            {isJa
              ? '2D ロビーで SBT ホルダーが集い、アバターを動かしながらチャットやエモート、軽量バトルを楽しめる場です。装備中の技やオーラ、スタンプ履歴がビジュアルで反映され、推しファン同士・選手との交流に彩りを添えます。'
              : 'A 2D lobby where SBT holders mingle with moving avatars, local chat, emotes, and lightweight battles. Equipped techniques, aura level, and stamp history are all visible, making it a social layer for fans and fighters to connect.'}
          </p>
          <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
            <li>{isJa ? '装備技はエモートとして表示される' : 'Equipped techniques display as emotes'}</li>
            <li>{isJa ? 'スタンプ / オーラがライティングに反映される' : 'Lighting reflects stamps and aura'}</li>
            <li>{isJa ? '選手参加イベントや AMA セッションの舞台' : 'Designed for fighter pop-ins and AMA sessions'}</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-purple-700/70 bg-black/50 p-3">
          <img
            src="/KIZUNA.png"
            alt="KIZUNA Plaza preview"
            className="w-full rounded-xl border border-purple-500/60 object-cover"
          />
          <p className="mt-2 text-xs text-purple-300">
            {isJa
              ? 'KIZUNA プラザの概念アート。'
              : 'Concept art for the KIZUNA Plaza lobby.'}
          </p>
        </div>
      </section>

      {/* Game */}
      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] rounded-3xl border border-gray-800/70 bg-gray-950/60 p-6">
        <div className="space-y-3">
          <h3 className="text-xl font-semibold">
            {isJa ? 'GAME: Technique Battle' : 'GAME: Technique Battle'}
          </h3>
          <p className="text-sm text-gray-300">
            {isJa
              ? '3 スロットのジャンケン形式バトル。Strike・Grapple・Counter の 3 属性で 3 ラウンド対戦し、合計ポイントで勝敗を決めます。オフチェーンでロジックを動かしつつ、結果だけを任意のログとしてチェーンに刻みます。'
              : 'A 3-slot rock-paper-scissors style battle with Strike, Grapple, and Counter attributes. Players go through three rounds, and highest total points win. Logic runs off-chain while optional battle results can be stored on-chain for verifiable bragging rights.'}
          </p>
          <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
            <li>{isJa ? '装備中の技がバトルロードアウトになる' : 'Equipped techniques define your battle loadout'}</li>
            <li>{isJa ? '計算済みスコアでオーラが強化される' : 'Battle score feeds into aura calculation'}</li>
            <li>{isJa ? 'ライブ配信のシークレットコードで技を追加' : 'Live stream passcodes mint new techniques'}</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-gray-700 bg-black/50 p-3">
          <img
            src="/game.png"
            alt="Technique Battle preview"
            className="w-full rounded-xl border border-gray-600/70 object-cover"
          />
          <p className="mt-2 text-xs text-gray-400">
            {isJa
              ? '「技バトル」 UI のコンセプト。'
              : 'Concept art for the Technique Battle UI.'}
          </p>
        </div>
      </section>
    </div>
  );
}
