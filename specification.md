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
- **On-chain (Sui)**: `@mysten/sui`（zkLogin / RPC / Dynamic Fields / Display）
- **Storage**: Walrus（BLOB 保管）＋ Seal（暗号化・アクセス制御ポリシー）
- **Deploy**: Front → Cloudflare Pages / Netlify、Server → Railway / Fly.io / Render

**公式ドキュメント（一次情報）**
- Sui Dynamic Fields: https://docs.sui.io/concepts/dynamic-fields  
- Sui zkLogin: https://docs.sui.io/concepts/cryptography/zklogin  
- Sui Display: https://docs.sui.io/standards/display  
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
* **Dynamic Object Fields**（Avatar 配下の子オブジェクトとして）: `Technique[]`, `VenueStamp[]`, `Favorite[]`

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

### 7.3 GAME ページ（じゃんけん方式テクニックバトル）

* ヘッダメニューに `GAME` を追加し、別ページとして遷移
* 機能概要:
  * 自分の Avatar（SBT）と装備中テクニック一覧を表示
  * バトル用の 3 スロット（`slot_1`, `slot_2`, `slot_3`）に Technique をドラッグ＆ドロップ or セレクトでセット
  * 対戦相手の選択（例: ランダムマッチ / 固定デモ用 NPC / フレンド指定）
  * 「BATTLE START」ボタンで 3 ラウンドオートバトルを開始
* UI 要件（最小）:
  * 両者のアバターと 3 スロットのテクニック属性を一覧表示（`Strike / Grapple / Counter`）
  * 各ラウンドごとに「A の属性 vs B の属性」「勝ち / 負け / あいこ」をアイコンや色で表示
  * 最終として `A: X ポイント / B: Y ポイント` と勝敗（または引き分け）を表示
  * オンチェーンに記録したバトルについては、「オンチェーン記録済み」「Tx リンク」などのバッジ表示を行う
* 実装メモ:
  * Plaza と同様に Phaser シーンを活用する場合、`play` シーンとは別に `battle` シーンを用意し、UI 用シーン（`ui`）とレイヤリングする  
    （Phaser の multi-scene 構成: `scene: [boot, plazaScene, battleScene, uiScene]` のように配置）
  * バトルロジック自体は React 側 or バックエンド側で関数として実装し、Phaser は演出と進行同期のみを担当する

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

## 15. オンチェーン設計方針（画像と状態の分離）

### 15.1 結論（方針の整理）

* 完全オンチェーンでの都度画像合成（巨大 SVG/PNG）は行わない  
  * Move 上で長大な SVG 文字列や Data URI を連結・管理するのは、ストレージ・ガス的に非現実的（`sui::dynamic_field` / `sui::dynamic_object_field` の用途からも外れる）
* オンチェーンには「状態（数値・ID）」のみを刻み、見た目の合成はオフチェーンで行う
* 画像は Walrus に BLOB として保存し、NFT 側には **Walrus BLOB ID か、その ID を埋め込んだ `image_url` テンプレート**（Display 経由）だけを持たせる
* レイアウト・見た目は「決定的レンダリング（同じ入力→同じ見た目）」になるよう、フロント/レンダラー側のアルゴリズムを仕様化しておく（クライアント・レンダラー・審査環境で同一結果になることを保証）

### 15.2 オンチェーンに保持する最小情報（再整理）

既存の 5. データモデルを前提に、オンチェーンで重くしないための指針を明示する。

* Avatar  
  * `owner: address`  
  * `equipped_tech_count: u8`  
  * `total_stamps: u64`  
  * `aura_level: u8`（0〜3）  
  * （任意）`watch_score: u64`（配信視聴ポイント）  
  * 決定的配置用 seed: `vector<u8>`（例: `hash(avatar_id | owner)`）
* Technique（技）  
  * 文字列よりも `category: u8`, `rarity: u8`, `tech_key: vector<u8>` などの ID / 数値中心  
  * 見た目に関わる画像は Walrus BLOB ID として参照で持つ
* VenueStamp（スタンプ）  
  * `event_id: String`, `date_iso: String`, `venue: String`  
  * `svg_fragment?: String` は必要な場合のみ（小さな図形片・色コードなど）
* Favorite（推し）  
  * `kind: u8`（0:選手/1:競技/2:チーム/3:国）  
  * `fav_id: String`, `since_ms: u64`, `score: u64`

ポイント:

* フリーテキストを増やしすぎず、ID/enum/数値を主体にすることで、検証・集計・表示がしやすい  
* ウォレットやマーケットが読む `image_url` は **Display（`sui::display`）のテンプレート**として定義し、Walrus BLOB ID などの短い文字列を置換して使う  
  * 長い URL をそのまま Move のフィールドに置くのではなく、BLOB ID やパスをフィールドとして持たせる想定

### 15.3 レンダリング方式の選択肢

1. クライアント合成（React/Tailwind/SVG）  
   * 現状のデモどおり、オンチェーン状態を読み取ってフロントで描画  
   * 長所: 速い・コスト 0・更新が即 UI に反映される  
   * 短所: 「1 枚の画像として固定したい」ユースケース（SNS 共有・サムネ等）にはやや不向き

2. オフチェーン・レンダラー + Walrus  
   * バックエンドが Sui の状態を取得 → PNG/SVG を合成 → Walrus に保存 → `image_url` を更新  
   * 長所: 共有しやすい固定画像、審査資料で説明しやすい、キャッシュ可能  
   * 短所: レンダラー用のサーバ or ワーカーが必要（ただしイベントドリブンで自動再生成可能）

3. 最小 SVG 片だけオンチェーン格納  
   * スタンプなどの小さな図形片だけオンチェーンに置き、クライアント/レンダラーが決定的に配置  
   * 長所: 一部素材がオンチェーン完結になる（コレクタブル感）  
   * 短所: SVG 片や件数の上限管理が必要

---

## 16. Aura dNFT 仕様（オーラ色によるランクアップ演出）

### 16.1 コンセプト

* NFT の見た目の変化を「オーラの色と強さ」に絞ることで、  
  * 実装をシンプルに保ちつつ dNFT 感を出す  
  * ユーザーに「一定閾値を超えた特別感」が直感的に伝わる
* 細かい情報（スタンプ/ワザ/推し）は引き続き UI 合成でリッチに見せ、スコアが閾値を超えたタイミングだけ見た目（オーラ）が変わる

### 16.2 Move 側仕様（aura_level と閾値）

フィールド案（Avatar）:

* `equipped_tech_count: u8`  
* `total_stamps: u64`  
* `watch_score: u64`（配信視聴ポイント・任意）  
* `aura_level: u8`（0〜3）

スコアとレベルの例（疑似仕様）:

```move
fun compute_aura_score(avatar: &Avatar): u64 {
    let stamp_score = avatar.total_stamps * 10;
    let equip_score = (avatar.equipped_tech_count as u64) * 5;
    let watch_score = avatar.watch_score;
    stamp_score + equip_score + watch_score
}

fun aura_level_from_score(score: u64): u8 {
    if (score < 50) return 0;      // No aura
    if (score < 150) return 1;     // Bronze / Light
    if (score < 300) return 2;     // Gold
    3                              // Legend / Rainbow
}

public fun recalc_aura_level(avatar: &mut Avatar): bool {
    let score = compute_aura_score(avatar);
    let new_level = aura_level_from_score(score);
    if (new_level == avatar.aura_level) return false;
    let old_level = avatar.aura_level;
    avatar.aura_level = new_level;
    // AuraLevelChangedEvent を emit
    true
}
```

イベント例:

* `struct AuraLevelChangedEvent has copy, drop { owner: address, old_level: u8, new_level: u8, score: u64 }`

呼び出しタイミング:

* `technique::mint_to_avatar` の最後  
* `technique::equip / unequip` の最後  
* `stamps::stamp_avatar` の最後  
* （必要なら）`favorite::set_favorite` など、スコアに影響する処理の最後

これにより、「技を覚える／装備する／現地スタンプを増やす」などの行動が累積され、閾値を超えた瞬間にオーラが自動でランクアップする。

### 16.3 フロント側の AuraGlow 表現

既存の Avatar 詳細画面にあるオーラ演出を、`aura_level` に応じて制御する。

* `aura_level = 0`: オーラなし（通常ファン）  
* `aura_level = 1`: うっすらブロンズ系の光（常連視聴者）  
* `aura_level = 2`: 金色の強めの光（現地スタンプ＋装備も充実）  
* `aura_level = 3`: レインボー寄りの強い光（ガチ勢）

UI の具体例:

* `AuraGlow` コンポーネント:  
  * レベルごとに `outer` / `inner` の色（RGBA）とボーダー幅をマッピング  
  * `box-shadow` と `border` を使って、内側・外側の光り方を制御
* ラベル表示（任意）:  
  * アバターカード上に `AURA RANK: BRONZE / GOLD / LEGEND` を表示  
  * `aura_level = 0` のときは非表示

### 16.4 Walrus 上のベース画像運用

* 基本アバター画像 + オーラ別バリエーションをあらかじめ Walrus に数枚保存しておく:  
  * 例: `base_normal`, `base_bronze`, `base_gold`, `base_legend`（それぞれ BLOB ID を取得）
* NFT 側のメタデータでは:  
  * オンチェーンに `aura_level` を保持  
  * Display（`sui::display`）の `image_url` テンプレート内で、オーラレベルごとに対応する Walrus BLOB ID / パスを差し込めるようにしておく
* オーラレベルが変化したタイミングで:  
  * バックエンド or 管理用トランザクションが `AuraLevelChangedEvent` を購読  
  * 対応する BLOB ID を選び直し、必要に応じて Display のフィールド（例: `blob_id`）を更新する

こうすることで:

* ウォレット・マーケットプレイスから見ても「オーラ色が変化した dNFT」として認識できる  
* 細かいスタンプ・ワザ・推しの見た目は dApp 上で最新状態を合成して表示できる  
* 画像合成そのものはオフチェーン（フロント or レンダラー）で完結し、オンチェーンは「状態」と「オーラランク」の管理に専念できる

---

## 17. GAME コントラクト仕様（Battle v1）

### 17.1 目的と前提

* Plaza とは別に、`GAME` ページで提供する「3 スロットじゃんけん方式テクニックバトル」の **オンチェーン側の役割** を定義する
* バトルのロジック（属性比較・ポイント計算）はオフチェーン（フロント or バックエンド）で実行し、  
  **オンチェーンには「確定した試合結果」と「累計スタッツ」のみを記録**するハイブリッド構成とする
* v1 では「公平性」は UX と説明で担保し、Move 側では結果の完全検証までは行わない（必要なのは「記録」と「イベント」）

### 17.2 モジュール構成（contracts/battle.move 想定）

* `kizuna::battle`（仮名）モジュールを `packages/contracts` に追加
  * 依存モジュール: `sui::event`, `sui::clock`, `sui::dynamic_field`, 既存の `avatar` モジュール

### 17.3 データ構造

**Admin Cap（記録権限）**

* `struct BattleAdminCap has key { id: UID }`
  * デプロイ時に 1 つだけ作成し、**バックエンドサーバ用のアドレス**に保持させる想定
  * これにより「誰でも好きな結果を書き込める」状態を避け、`record_battle` の呼び出しを制限

**バトル結果イベント**

* `struct BattleFinishedEvent has copy, drop {`
  * `avatar_a: address`（A 側 Avatar の owner）
  * `avatar_b: address`（B 側 Avatar の owner）
  * `winner: u8`（0 = Draw, 1 = A 勝利, 2 = B 勝利）
  * `score_a: u8`（0〜6 を想定）
  * `score_b: u8`
  * `ruleset: u8`（例: 0 = RPS_V1）
  * `timestamp_ms: u64`（`clock::Clock` から取得）
`}`

  * Sui の標準 `event::emit<BattleFinishedEvent>` を使い、RPC/API から簡単に取得できるようにする

**累計スタッツ（Avatar への追加フィールド案）**

Avatar（5.1）の実装では、以下のカウンタを追加することを推奨:

* `total_battles: u64`  
* `wins: u32`  
* `losses: u32`  
* `draws: u32`

これにより、ウォレットや Plaza / GAME ページで「対戦数・勝率」を即座に表示可能になる。  
（スペック上は任意だが、dNFT 的な“戦歴”可視化に有効）

### 17.4 エントリ関数（record_battle）

**シグネチャ案（概略）**

```move
public entry fun record_battle(
  admin: &BattleAdminCap,
  avatar_a: &mut Avatar,
  avatar_b: &mut Avatar,
  winner: u8,      // 0=Draw,1=A,2=B
  score_a: u8,     // 0〜6
  score_b: u8,
  ruleset: u8,     // 0 = RPS_V1
  clock: &clock::Clock
) { /* ... */ }
```

**役割とチェック方針**

* `admin` の存在により、**指定のサーバアドレスのみが結果を記録できる**（trusted backend モデル）
* `winner` は `0..2` に制限し、`ruleset == 0` の場合は最低限の一貫性チェックのみ行う（例: `score_a + score_b == 6` を満たすか等）
* `avatar_a` / `avatar_b` から `owner` アドレスを取得し、イベントに埋め込む
* カウンタ更新:
  * `total_battles` を両者とも `+1`
  * `winner` に応じて `wins / losses / draws` を更新
* `clock` から `timestamp_ms` を取得し、`BattleFinishedEvent` を emit する

### 17.5 オフチェーン連携フロー（dApp / サーバ）

1. フロント（GAME ページ）で、`avatarA_slots` / `avatarB_slots` を元に TypeScript でじゃんけんロジックを実行
2. `scoreA`, `scoreB`, `winner`, `ruleset`（=0）を決定
3. バックエンドサーバに結果を送信（JWT or セッションでユーザーを紐づけ）
4. サーバは `BattleAdminCap` を持つアドレスでトランザクションを組み立て、`record_battle` を呼び出す
5. 成功したら `txDigest` をフロントへ返却し、GAME UI 上で「オンチェーン記録済み」「Tx リンク」バッジを表示

### 17.6 将来拡張の余地

* `ruleset` を増やすことで、v1.1 以降の「オーラをタイブレークに利用するモード」などを追加可能
* `BattleResult` を Dynamic Object Field として保存し、直近 N 件の詳細ログをオンチェーンに持つ設計も拡張案として想定できるが、v1 はイベント＋累計スタッツのみとする
