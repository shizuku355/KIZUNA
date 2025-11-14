```markdown
# KIZUNA — ハッカソンデモ用サイト 仕様書（Vite 版）v1.2

**前提（イベント趣旨）**  
本プロダクトは **ONE Championship を日本で盛り上げる** ためのハッカソン提出作品です。ライブ視聴・現地来場・推し活・広場（Plaza）・軽量対戦を、Sui 上の **SBT アバター**体験に統合し、**ファンの熱量を“見える化”** します。

---

## 0. エレベーターピッチ
> 配信で“技”を覚え、会場で“スタンプ”を押し、推しで色づく。  
> アバターを見れば一目でガチ勢が伝わる。広場で集い、7枠ロードアウトで対戦へ。  
> **KIZUNA は ONE のファン熱量を加速する Sui × Walrus × Seal の体験 OS**。

---

## 1. 目標（3分デモで伝えること）
- **ライブ視聴 → 技 Mint（時間限定 URL+パス） → 7スロット装備**
- **現地来場 → スタンプ押印（試合名＋日付）を SBT 下部に“雑貼り”表示**
- **推し活（最大3枠） → 名前色・推し旗・エモート解放**
- **KIZUNA Plaza（2D）でチャット・エモート → 対戦 1 ターンへ**

---

## 2. 技術スタック（Vite 前提）

- **Front (SPA)**: Vite + React + TypeScript + Tailwind + shadcn/ui + TanStack Query + Phaser（2D）
- **Realtime**: Node (Express) + Socket.IO
- **On-chain (Sui)**: `@mysten/sui`（zkLogin / RPC / Dynamic Object Fields）
- **Storage**: Walrus（BLOB 保管）＋ Seal（暗号化・復号ポリシー）
- **Deploy**: Front → Cloudflare Pages / Netlify、Server → Railway / Fly.io / Render

**公式ドキュメント（一次情報）**
- Sui Dynamic Fields: https://docs.sui.io/concepts/dynamic-fields  
- Sui zkLogin: https://docs.sui.io/concepts/cryptography/zklogin  
- Sui API（Dynamic Fields取得系）: https://docs.sui.io/references/sui-api  
- Walrus docs: https://docs.wal.app/  
- Seal docs: https://seal-docs.wal.app/  

---

## 3. モノレポ構成（例）

```

kizuna/
├─ apps/
│  ├─ web/                 # Vite(React) SPA：Plaza/装備UI/ミント画面
│  └─ server/              # Express + Socket.IO + ミントゲート(API)
├─ packages/
│  ├─ contracts/           # Move packages（Avatar/Technique/Stamp/Favorite）
│  └─ ui/                  # 共通UI(アイコン/型/hooks)
└─ README.md

````

---

## 4. セットアップ & スクリプト

```bash
# Frontend
npm create vite@latest apps/web -- --template react-ts
cd apps/web
npm i tailwindcss postcss autoprefixer @tanstack/react-query socket.io-client phaser \
   @mysten/sui @mysten/zklogin zod clsx
npx tailwindcss init -p

# Server
cd ../../apps
mkdir server && cd server
npm init -y
npm i express socket.io cors zod jsonwebtoken rate-limiter-flexible

# Root scripts (例)
# package.json (root)
# "scripts": {
#   "dev:web": "pnpm --filter web dev",
#   "dev:server": "pnpm --filter server dev",
#   "build:web": "pnpm --filter web build",
#   "start:server": "pnpm --filter server start"
# }
````

**環境変数（例）**

* `SUI_NETWORK`（testnet/mainnet/localnet）
* `WALRUS_ENDPOINT`
* `SEAL_ENDPOINT`
* `JWT_SECRET`（API トークン用）
* `MINT_WINDOW_SECRET`（配信用パスの検証）
* `RATE_LIMIT_REDIS_URL`（任意）

---

## 5. データモデル（概要）

### 5.1 Avatar（SBT / 譲渡不可）

* `owner: address`
* `equipped_tech_count: u8`（装備中数）
* `total_stamps: u64`
* `aura_level: u8`（現地金縁：0〜3）
* **DF**：`Technique[]`, `VenueStamp[]`, `Favorite[]`

### 5.2 Technique（技）

* `name: String`, `category: u8`, `rarity: u8`
* `walrus_blob_id?: String`, `seal_policy_id?: String`
* `equipped: bool`, `equipped_at: u64`, `last_used_at: u64`
* **DF Key**: `tech_key: vector<u8>`（例 `"2025-11-15_flying_knee"`）

### 5.3 VenueStamp（現地スタンプ）

* `event_id: String`（一意）
* `date_iso: String`, `venue: String`
* `svg_fragment?: String`（軽量図形オンチェーン）
* `walrus_blob_id?: String`（リッチ素材）
* **DF Key**: `event_id`（重複押印防止）

### 5.4 Favorite（推し）

* `kind: u8`（0:選手/1:競技/2:チーム/3:国）
* `fav_id: String`, `since_ms: u64`, `score: u64`
* Avatar 配下に **最大3件**

---

## 6. コアフロー

### 6.1 ライブ視聴 → 技 Mint

1. 配信で **URL + パス** を告知（時間限定）
2. dApp で `zkLogin / wallet connect` → パス入力
3. Server が TTL/レート制限/署名を検証 → `mint_technique()` 実行
4. Technique は **ロッカー**に追加 → ユーザーが **7スロットに装備**

**アンチボット**：TTL/RateLimit/Turnstile、同一アドレス再取得制御

### 6.2 現地来場 → スタンプ押印

1. 会場 QR → dApp → `StampTicket`（短期 TTL）を配布
2. `stamp_avatar()` で `VenueStamp` を Avatar に追加（**event_id一意**）
3. フロントでは **擬似ランダム（決定的）** に下帯へ“雑貼り”配置

### 6.3 推し活

* `set_favorite(kind,id)` 最大 3 件（変更クールダウン）
* スコアで **名前色/推し旗/推しエモート** 解放

### 6.4 KIZUNA Plaza → 対戦

* SBT を持つアドレスのみ入場（入室時スナップショット）
* Plaza：移動/チャット/エモート（Socket.IO）
* 対戦：**軽量ターン制**（演出はフロント、勝敗のみチェーン書込は任意）

---

## 7. 画面仕様

### 7.1 アバター詳細

* **上リング：7スロット（装備中のみ）**

  * 余剰は **「+X」チップ** → ロッカー（全技）
  * 自動回転（任意）：アイドル時に 7 枚入れ替え表示
* **下部：スタンプ帯**

  * 大小・回転にゆらぎ、**2段化**で “やばい量” を可視化
  * 配置は `seed = hash(avatarId|eventId)`
* **現地勢**：背景外周 **金縁（1〜3本）**、肩の **Venue Crest**（最新 1 個）
* **推し**：名前横に **推し旗（最大3）**

### 7.2 Plaza（2D / Phaser）

* 入室演出（スッと降りる→金縁が点灯）
* 名前プレート＋帯レベル＋推し旗
* エモート：技アイコンの頭上ポップ
* ローカル半径チャット（吹き出し/ログ）
* `/photo`：フォトスポット → Walrus に保存（Seal で限定公開も可能）

---

## 8. API 設計（最小）

### 8.1 REST

* `GET /auth/nonce` → `{ nonce }`
* `POST /auth/verify` `{ addr, signature }` → `{ token }`
* `GET /avatar/snapshot?addr=...` → `{ equipped[], allTechCount, stamps[], favorites[], auraLevel }`
* `POST /mint/technique` `{ token, passcode, techKey }` → `{ ok }`（TTL/RateLimit）

### 8.2 Realtime (Socket.IO)

* `join { token }` → サーバが SBT 保有を検証して入室許可
* `state { x,y,dir,emoteId }` ブロードキャスト
* `chat { text }`（文字数と NG ワードのみチェック）
* （任意）`battle:use { techKey }` → サーバ判定 → イベント返却

---

## 9. Move コントラクト（骨子・疑似）

> Move 2024 版を想定（Dynamic Object Fields）

* `avatar.move`（SBT 作成・譲渡不可）
* `technique.move`（技の Mint/装備/解除）
* `stamps.move`（StampTicket の発行・押印）
* `favorite.move`（推し 3 枠の管理）

**Equip ガード例**

```move
const MAX_SLOTS: u8 = 7;

public entry fun equip(avatar: &mut Avatar, key: vector<u8>) {
    let mut t = dynamic_object_field::borrow_mut<&mut Avatar, vector<u8>, Technique>(&mut avatar.id, &key);
    assert!(!t.equipped, 1);
    assert!(avatar.equipped_tech_count < MAX_SLOTS, 2);
    t.equipped = true;
    avatar.equipped_tech_count = avatar.equipped_tech_count + 1;
}
```

**Stamp（重複防止）**

```move
public entry fun stamp_avatar(
  avatar: &mut Avatar,
  ticket: StampTicket, // 会場で発行(TTL)
  svg: option::Option<String>,
  blob: option::Option<String>,
  now_ms: u64
) {
  let key = string::into_bytes(ticket.event_id);
  assert!(!dynamic_object_field::exists<&Avatar, vector<u8>>(&avatar.id, &key), 3);
  // VenueStamp を生成して DF add
}
```

---

## 10. フロント実装の要点

* **リング 7 枠 = Equipped 技のみ**
* **ロッカー**（全所持）：カテゴリ/レア度/最近使用のフィルタ
* **下帯スタンプ**：衝突回避つき **決定的擬似ランダム**（Poisson 近似 + 乱数シード）
* **描画順**：上リング > 金縁 > Crest > スタンプ帯
* **ダーク背景 + 縦白スポットライト**（円/紋章は使わない）

---

## 11. セキュリティ / 運用

* **ライブ配布**：URL 短期 TTL、パスは配信内のみ告知、Turnstile、RateLimit
* **現地押印**：Ticket に TTL / 発行回数制限、（将来）位置/時間検証
* **暗号化**：Walrus BLOB は Seal で暗号化、ポリシーに応じて復号（現地/所持者限定等）
* **個人情報**：チャットは短文・揮発（永続ログなし）

---

## 12. マイルストーン（24h）

* **0–6h**：SBT/Technique/Stamp 最小実装、Mint ゲート（URL+PW+TTL）
* **6–12h**：装備 UI（7 枠）＆スタンプ帯描画（決定的擬似ランダム）
* **12–18h**：Plaza（移動/チャット/エモート）、入室スナップショット
* **18–22h**：対戦 1 ターン、Walrus 写真（任意）
* **22–24h**：スライド/台本/通し & デモ録画

---

## 13. 付録：UI キーワード（niji プロンプト指針）

* 2 頭身 / かわいい顔（大きい目・小鼻・口を低め）
* 黒ジャージ半袖＋黒ショーツ＋白細ライン（初期）
* 背景は **縦白スポットライトのみ**（“aura” は使わない）
* 上：技 7 スロット、下：スタンプ帯（余白を明記）

---

## 14. 参考リンク（再掲）

* Sui Dynamic Fields: [https://docs.sui.io/concepts/dynamic-fields](https://docs.sui.io/concepts/dynamic-fields)
* Sui zkLogin: [https://docs.sui.io/concepts/cryptography/zklogin](https://docs.sui.io/concepts/cryptography/zklogin)
* Sui API: [https://docs.sui.io/references/sui-api](https://docs.sui.io/references/sui-api)
* Walrus docs: [https://docs.wal.app/](https://docs.wal.app/)
* Seal docs: [https://seal-docs.wal.app/](https://seal-docs.wal.app/)

```

::contentReference[oaicite:0]{index=0}
```
