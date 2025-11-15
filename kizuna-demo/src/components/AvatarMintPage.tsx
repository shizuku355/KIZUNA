import { useState } from 'react';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';

import type { Lang } from '../types';
import { KIZUNA_CHAIN, KIZUNA_PACKAGE_ID } from '../lib/contractConfig';

type AvatarTemplate = {
  id: string;
  labelJa: string;
  labelEn: string;
  imageUrl: string;
};

// NOTE:
// 現在は /public/avatars 配下の静的ファイルを手動で列挙しています。
// 画像を追加した場合は、このリストに追記してください。
const AVATAR_TEMPLATES: AvatarTemplate[] = [
  {
    id: 'woman1',
    labelJa: '女性アバター 1',
    labelEn: 'Woman Avatar 1',
    imageUrl: '/avatars/woman1.png',
  },
  {
    id: 'woman2',
    labelJa: '女性アバター 2',
    labelEn: 'Woman Avatar 2',
    imageUrl: '/avatars/woman2.png',
  },
  {
    id: 'woman3',
    labelJa: '女性アバター 3',
    labelEn: 'Woman Avatar 3',
    imageUrl: '/avatars/woman3.png',
  },
  {
    id: 'woman4',
    labelJa: '女性アバター 4',
    labelEn: 'Woman Avatar 4',
    imageUrl: '/avatars/woman4.png',
  },
  {
    id: 'woman5',
    labelJa: '女性アバター 5',
    labelEn: 'Woman Avatar 5',
    imageUrl: '/avatars/woman5.png',
  },
  {
    id: 'man1',
    labelJa: '男性アバター 1',
    labelEn: 'Man Avatar 1',
    imageUrl: '/avatars/man1.png',
  },
  {
    id: 'man2',
    labelJa: '男性アバター 2',
    labelEn: 'Man Avatar 2',
    imageUrl: '/avatars/man2.png',
  },
  {
    id: 'man3',
    labelJa: '男性アバター 3',
    labelEn: 'Man Avatar 3',
    imageUrl: '/avatars/man3.png',
  },
  {
    id: 'man4',
    labelJa: '男性アバター 4',
    labelEn: 'Man Avatar 4',
    imageUrl: '/avatars/man4.png',
  },
  {
    id: 'man5',
    labelJa: '男性アバター 5',
    labelEn: 'Man Avatar 5',
    imageUrl: '/avatars/man5.png',
  },
];

export function AvatarMintPage({ lang }: { lang: Lang }) {
  const currentAccount = useCurrentAccount();
  const [selectedId, setSelectedId] = useState<string>(AVATAR_TEMPLATES[0]?.id ?? '');
  const [lastDigest, setLastDigest] = useState<string | null>(null);
  const { mutate: signAndExecuteTransaction, isPending } = useSignAndExecuteTransaction();

  const selected = AVATAR_TEMPLATES.find(t => t.id === selectedId) ?? AVATAR_TEMPLATES[0];

  const handleMint = () => {
    if (!currentAccount || !selected) return;
    if (!KIZUNA_PACKAGE_ID || KIZUNA_PACKAGE_ID === '0xYOUR_KIZUNA_PACKAGE_ID') {
      // Package ID 未設定時は何もしない（デモ環境用ガード）。
      alert('KIZUNA_PACKAGE_ID を設定してからミントしてください。');
      return;
    }

    const tx = new Transaction();
    tx.moveCall({
      target: `${KIZUNA_PACKAGE_ID}::avatar::mint_avatar`,
      arguments: [],
    });

    signAndExecuteTransaction(
      {
        transaction: tx,
        chain: KIZUNA_CHAIN,
      },
      {
        onSuccess: result => {
          setLastDigest(result.digest);
          // NOTE: 実際にはここで new Avatar オブジェクトをフェッチし、
          // 選択したテンプレートIDとの対応付けをローカルに保存する想定。
        },
      },
    );
  };

  return (
    <div className="rounded-3xl border border-gray-800/70 bg-gradient-to-br from-gray-950 to-black/70 p-6 shadow-2xl space-y-6">
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex-1 space-y-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">
              {lang === 'ja' ? 'はじめに' : 'Getting Started'}
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              {lang === 'ja' ? 'アバター SBT をミント' : 'Mint Your Avatar SBT'}
            </h2>
            <p className="mt-2 text-sm text-gray-300">
              {lang === 'ja'
                ? 'ウォレットを接続したあと、最初に使うアバターを選んで SBT を 1 体ミントします。画像テンプレートはWalrusで管理予定。オンチェーンでは Aura やスタンプなどの状態を記録します。'
                : 'After connecting your wallet, choose your first avatar and mint a single SBT. Image templates will live on Walrus, while on-chain state tracks aura, stamps, and techniques.'}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {AVATAR_TEMPLATES.map(template => (
              <button
                key={template.id}
                type="button"
                onClick={() => setSelectedId(template.id)}
                className={`relative overflow-hidden rounded-2xl border p-3 text-left transition transform hover:scale-[1.02] ${
                  selectedId === template.id
                    ? 'border-yellow-500 bg-yellow-500/10 shadow-xl'
                    : 'border-gray-800 bg-black/50'
                }`}
              >
                <div className="aspect-square overflow-hidden rounded-xl border border-gray-800 bg-black">
                  <img
                    src={template.imageUrl}
                    alt={template.labelEn}
                    className="h-full w-full object-cover"
                  />
                </div>
                <p className="mt-2 text-sm font-semibold text-white">
                  {lang === 'ja' ? template.labelJa : template.labelEn}
                </p>
                {selectedId === template.id && (
                  <span className="absolute right-3 top-3 rounded-full bg-yellow-400 px-2 py-0.5 text-[11px] font-semibold text-black">
                    {lang === 'ja' ? '選択中' : 'Selected'}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 rounded-3xl border border-gray-800 bg-black/60 p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">
                {lang === 'ja' ? 'ウォレット' : 'Wallet'}
              </p>
              <p className="text-sm text-gray-200">
                {currentAccount
                  ? `${currentAccount.address.slice(0, 6)}…${currentAccount.address.slice(-4)}`
                  : lang === 'ja'
                    ? '右上からウォレットを接続してください'
                    : 'Connect your wallet from the top-right.'}
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3">
            <button
              type="button"
              onClick={handleMint}
              disabled={!currentAccount || isPending}
              className="w-full rounded-xl bg-gradient-to-r from-yellow-500 to-orange-600 px-4 py-3 text-sm font-semibold text-black shadow-lg shadow-yellow-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {lang === 'ja'
                ? isPending
                  ? 'ミント中…'
                  : 'このアバターで SBT をミント'
                : isPending
                  ? 'Minting…'
                  : 'Mint Avatar SBT with this template'}
            </button>
            <p className="text-xs text-gray-500">
              {lang === 'ja'
                ? 'ミント後は、Move コントラクト上の Avatar オブジェクトに Aura やスタンプ、テクニックが紐づいていきます。'
                : 'After minting, the Move Avatar object will track your aura, stamps, and techniques over time.'}
            </p>
            {lastDigest && (
              <p className="text-xs text-green-400 break-all">
                {lang === 'ja' ? '最新トランザクション: ' : 'Last transaction: '}
                {lastDigest}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
