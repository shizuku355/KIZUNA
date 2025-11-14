````md
# KIZUNA Battle Spec v1 – じゃんけん方式テクニックバトル

## 1. 概要

本仕様は、KIZUNA アバター同士が「3スロットのテクニック」を用いて対戦する  
**じゃんけん方式オートバトル**のルールと実装方針を定義する。

目的：

- 新規ユーザーでも「今日から勝てる」シンプルなバトル
- 古参は「テクニックの種類・組み合わせの幅」で差別化
- バトル結果のみをオンチェーンに記録可能なハイブリッド設計

本バージョンでは、**ステータス差やオーラ差は基本ロジックに含めない**。  
（タイブレーク等での利用は v1.1 以降の拡張とする）

---

## 2. 用語定義

- **Avatar（アバター）**  
  ユーザーの分身。KIZUNA 上でテクニックを装備し、バトルに参加する。

- **Technique（テクニック）**  
  アバターが装備する技。以下の 3種の属性を持つ：
  - `Strike`（打撃）
  - `Grapple`（組み）
  - `Counter`（カウンター）

- **Technique Slot（テクニックスロット）**  
  バトルに使用する技をセットする枠。  
  各アバターは `slot_1`, `slot_2`, `slot_3` の 3スロットを持つ。

- **Round（ラウンド）**  
  スロット単位の対戦。`Round 1` は `slot_1 vs slot_1` の比較、以下同様。

---

## 3. バトル構造

### 3.1 入力

バトルの入力は以下とする：

- `avatarA_id`, `avatarB_id`  
- `avatarA_slots = [techA1, techA2, techA3]`  
- `avatarB_slots = [techB1, techB2, techB3]`

各 `techXi` は以下の情報を持つ：

- `tech_id`（任意の識別子）
- `attr` ∈ { `Strike`, `Grapple`, `Counter` }

### 3.2 ラウンドの進行

- 全 3ラウンド固定
- `i = 1..3` について、`techA[i]` と `techB[i]` の属性を比較し、  
  各ラウンドごとに A/B のポイントを決定する。

---

## 4. じゃんけんルール

### 4.1 属性の相性

相性は「三すくみ」とする：

- `Strike`  > `Grapple`
- `Grapple` > `Counter`
- `Counter` > `Strike`

### 4.2 ラウンドスコア

各ラウンドは以下のようにスコアリングする：

- 勝ち：勝者に 2ポイント、敗者に 0ポイント
- あいこ：両者に 1ポイントずつ

擬似コード：

```ts
type Attr = 'Strike' | 'Grapple' | 'Counter';

function rpsRound(a: Attr, b: Attr): [number, number] {
  if (a === b) return [1, 1]; // draw

  const winsOver: Record<Attr, Attr> = {
    Strike: 'Grapple',
    Grapple: 'Counter',
    Counter: 'Strike',
  };

  if (winsOver[a] === b) {
    return [2, 0];            // A wins
  } else {
    return [0, 2];            // B wins
  }
}
````

---

## 5. 試合結果の決定

### 5.1 合計ポイント

3ラウンド分のポイントを合計する：

```ts
let scoreA = 0;
let scoreB = 0;

for (let i = 0; i < 3; i++) {
  const [pa, pb] = rpsRound(avatarA_slots[i].attr, avatarB_slots[i].attr);
  scoreA += pa;
  scoreB += pb;
}
```

### 5.2 勝敗判定（v1）

v1 では、以下のように判定する：

* `scoreA > scoreB` → A の勝ち
* `scoreA < scoreB` → B の勝ち
* `scoreA === scoreB` → 引き分け（ドロー）

※ タイブレークにオーラ・戦績等を使うのは v1.1 以降で検討。
新規ユーザーにも勝ちやすいよう、v1 は完全スコア平等とする。

---

## 6. 実装方針（オンチェーン / オフチェーン）

### 6.1 バトル計算

* バトルのロジック（じゃんけん判定・スコア計算）は **オフチェーン** 実装を推奨。

  * 理由：

    * if 文ベースの軽量ロジックで、どこでも再現可能
    * リアルタイムな UI 表現（アニメーション）と相性が良い
    * ガスコストをかけずに何度も遊べる

実装候補：

* フロントエンドのみで計算（クライアントサイド）
* またはバックエンド（Node / Cloud Functions など）で計算し、結果を返却

### 6.2 オンチェーンに記録する最小情報

**ハイブリッド構成**として、重要な試合のみオンチェーンに記録する：

* `battle_id`（任意の識別子）
* `avatarA_id`, `avatarB_id`
* `winner` ∈ { `A`, `B`, `Draw` }
* `scoreA`, `scoreB`
* `timestamp`（ブロックタイム or off-chain timestamp）
* （任意）`battle_type`（例：`RPS_V1`）

Move モジュール例（イメージ）：

```move
struct BattleResult has store {
    id: UID,
    avatar_a: address,
    avatar_b: address,
    winner: u8,      // 0=Draw, 1=A, 2=B
    score_a: u8,
    score_b: u8,
    created_at: u64, // timestamp or block height
}
```

---

## 7. UI 要件（最小）

* 両者のアバター・技スロットを一覧表示
* 各ラウンドごとに：

  * `A の技属性 vs B の技属性`
  * 勝ち / 負け / あいこを表示（アイコン or 色分け）
* 最終結果として：

  * `A: X ポイント / B: Y ポイント`
  * 勝者 or 引き分け を明示
* オンチェーン記録がある場合：

  * 「オンチェーンに記録済み」「Txリンク」などを表示可能にする

---

## 8. 拡張案（v1.1 以降）

本仕様では「古参超有利」を避けるためステータス補正を排除しているが、
今後、以下のような**軽い補正**を追加する余地がある：

1. **タイブレーク用のオーラレベル**

   * `scoreA === scoreB` のときのみ、オーラレベルが高い方を勝ち扱い
2. **アンダードッグボーナス**

   * オーラ差が一定以上のとき、弱い側に +1 ポイントを事前付与
3. **勝利数に応じた称号 / 演出のみの差別化**

   * ゲームバランスには影響せず、「古参のカッコよさ」を演出

これらは別バージョンの仕様書として定義し、本ドキュメントは **公平性重視の v1 基本ルール** として扱う。

---

## 9. まとめ

* バトルは「3スロット × 属性じゃんけん」という **シンプルで説明しやすい構造**
* ステータス差を入れないことで、新規ユーザーも勝ちやすい
* オフチェーン計算 + オンチェーン記録というハイブリッド構成により、

  * 遊びやすさ（無料で何回もバトル）
  * Web3 らしさ（重要な対戦の記録がチェーンに残る）
    の両立を目指す。

本仕様を「KIZUNA Battle Spec v1」として採用し、
実装・UI・Move コントラクト設計の基礎ドキュメントとする。