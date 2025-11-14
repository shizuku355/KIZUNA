# KIZUNA - ONE Championship Fan Platform Demo

**ONE Championship**のファン体験を拡張するWeb3プラットフォームのデモアプリケーション。
Sui Blockchain上の**SBT (Soul Bound Token)** アバターを使用し、ライブ視聴・現地来場・推し活をブロックチェーンで"見える化"します。

## 🎯 主要機能

### 1. **SBTアバターシステム**
- Sui上の譲渡不可能なNFTアバター
- **Dynamic Object Fields**を活用したデータ管理
  - Technique（技）: 7スロット装備システム
  - VenueStamp（現地スタンプ）: 決定的擬似ランダム配置
  - Favorite（推し）: 最大3枠

### 2. **技(Technique)システム**
- ライブ配信視聴で技をMint（時間限定URL + パスワード）
- レア度別グラデーション表示（Common/Rare/Epic/Legendary）
- 7スロット装備リング（円形配置）
- ロッカー機能（カテゴリ・レア度フィルター）

### 3. **現地来場スタンプ**
- 会場QRコードでスタンプ取得
- アバター下部に"雑貼り"表示
- 決定的擬似ランダム配置（`seed = hash(avatarId|eventId)`）
- 現地勢向けゴールデンオーラ（1〜3段階）

### 4. **推し活機能**
- 選手・競技・チーム・国を最大3つ設定
- 名前横に推しアイコン表示
- 特別なエモート・名前色解放

## 🚀 セットアップ

### 前提条件
- Node.js 20.19+ または 22.12+
- npm または pnpm

### インストール

```bash
# 依存パッケージのインストール
npm install

# 開発サーバーの起動
npm run dev
```

開発サーバーは http://localhost:5173 で起動します。

## 📦 技術スタック

### フロントエンド
- **Vite** - ビルドツール
- **React 18** + TypeScript
- **Tailwind CSS** v4 - スタイリング
- **TanStack Query** - データフェッチング
- **@mysten/sui** - Sui Blockchain SDK

### ブロックチェーン
- **Sui Blockchain** (Testnet)
- **Dynamic Object Fields** - オンチェーンデータ構造
- **SBT (Soul Bound Token)** - 譲渡不可NFT

## 🎮 使い方

### 1. デモモード（Mock Data）
デフォルトでモックデータを使用したデモが動作します：

1. **📱 Mock Data (Demo)** タブを選択
2. 👧 Girl Avatar または 👦 Boy Avatar を選択
3. **Avatar** タブでアバター詳細を表示
4. **Technique Locker** タブで全技を確認

### 2. Suiブロックチェーンモード

実際のSui Testnet上のアバターを読み込むには：

1. **⛓️ Sui Blockchain** タブを選択
2. Avatar Object ID（`0x...`）を入力
3. **Load Avatar** ボタンをクリック

#### 必要条件:
- Sui Testnet上にデプロイされたAvatar SBT
- Avatar Object ID
- Avatarに紐づくDynamic Fields:
  - `Technique` (技)
  - `VenueStamp` (スタンプ)
  - `Favorite` (推し)

## 📁 プロジェクト構造

```
kizuna-demo/
├── src/
│   ├── components/
│   │   ├── AvatarCard.tsx          # アバター詳細表示
│   │   ├── TechniqueLocker.tsx     # 技ロッカー
│   │   └── AvatarSelector.tsx      # データソース切り替え
│   ├── hooks/
│   │   └── useAvatarData.ts        # Sui データフェッチング
│   ├── lib/
│   │   ├── suiClient.ts            # Sui RPCクライアント
│   │   └── dynamicFields.ts        # Dynamic Fields 取得ロジック
│   ├── types.ts                    # TypeScript型定義
│   ├── mockData.ts                 # モックデータ
│   ├── App.tsx                     # メインアプリ
│   └── main.tsx                    # エントリーポイント
└── public/
    ├── girl_avatar.png
    └── boy_avatar.png
```

## 🔧 Sui Dynamic Fields の仕組み

### Avatar オブジェクト構造

```move
struct Avatar has key {
    id: UID,
    owner: address,
    equipped_tech_count: u8,
    total_stamps: u64,
    aura_level: u8,
    // Dynamic Fields:
    // - Technique[] (key: tech_key: vector<u8>)
    // - VenueStamp[] (key: event_id: String)
    // - Favorite[] (key: fav_id: String)
}
```

### データ取得フロー

1. **Avatar Object取得**
   ```typescript
   const avatar = await suiClient.getObject({ id: avatarObjectId });
   ```

2. **Dynamic Fields一覧取得**
   ```typescript
   const fields = await suiClient.getDynamicFields({ parentId: avatarObjectId });
   ```

3. **個別フィールド取得**
   ```typescript
   const technique = await suiClient.getDynamicFieldObject({
     parentId: avatarObjectId,
     name: { type: 'vector<u8>', value: [...] }
   });
   ```

## 🎨 UI デザインコンセプト

- **ダーク背景** + 縦白スポットライト（仕様通り）
- **7スロット円形配置** - 装備中の技のみ表示
- **決定的擬似ランダム配置** - スタンプ衝突回避
- **金縁オーラ** - 現地参加者向けエフェクト
- **推しアイコン** - 名前横に最大3つ表示

## 🔐 セキュリティ考慮事項

### ライブ配布
- URL短期TTL
- パスワード配信内告知のみ
- レート制限
- 同一アドレス再取得制御

### 現地押印
- Ticketに短期TTL
- event_idでの重複防止（Dynamic Field Key）
- 位置・時間検証（将来実装）

## 📚 参考リンク

### Sui 公式ドキュメント
- [Sui Dynamic Fields](https://docs.sui.io/concepts/dynamic-fields)
- [Sui zkLogin](https://docs.sui.io/concepts/cryptography/zklogin)
- [Sui API Reference](https://docs.sui.io/references/sui-api)

### ストレージ & 暗号化
- [Walrus Documentation](https://docs.wal.app/)
- [Seal Documentation](https://seal-docs.wal.app/)

## 🚧 今後の実装予定

- [ ] zkLogin統合（Google/Twitter認証）
- [ ] 技Mint API（Express + Socket.IO）
- [ ] KIZUNA Plaza（Phaser 2D）
  - リアルタイムチャット
  - エモート機能
  - 軽量ターン制バトル
- [ ] Walrus/Seal統合（画像・動画保存）
- [ ] スタンプTicket発行システム
- [ ] ウォレット接続（@mysten/dapp-kit）

## 📄 ライセンス

このプロジェクトはONE Championship ハッカソン提出作品です。

---

**Built with** ❤️ **for ONE Championship Fans**
