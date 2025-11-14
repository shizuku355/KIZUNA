# KIZUNA Hackathon – Implementation Guide (UI + Move)

This is a practical, low‑risk, step‑by‑step playbook to implement the KIZUNA demo without breaking the dev loop. Follow each phase in order. Each step includes clear success criteria and quick validation commands.

- Stack: Vite + React + TS (SPA), Sui Move packages, optional Node/Express for auth proxy, Walrus + Seal (later).
- Current repo: `kizuna-demo` (frontend) already present and running.

## 0) Prerequisites

- Node.js >= 20.19 (Vite 7 requires this). If lower, upgrade before starting.
- npm (or pnpm). Keep using npm for consistency with the repo.
- Sui CLI + Move toolchain (for Move work):
  - Install Sui from docs (local env). Ensure `sui --version` works.
- A Chromium browser with Sui Wallet extension (for wallet connect).
- Optional (server phases): Node 20.x, `curl` for API tests.

Validation
- Frontend: `cd kizuna-demo && npm i && npm run dev` (page loads, no TypeErrors)
- Build: `npm run build` (completes successfully)

## 1) Frontend Navigation (Tabs)

Goal: Multi‑tab header with four views (Home, Live, Locker, KIZUNA Plaza). Keep code simple and deterministic.

Status: Implemented. Validate and keep as base.

Files
- `kizuna-demo/src/App.tsx` (tab state + section rendering)
- `kizuna-demo/src/components/AvatarCard.tsx` (square avatar)
- `kizuna-demo/src/components/LiveWatchDemo.tsx` (YouTube embed + comments)
- `kizuna-demo/src/components/TechniqueLocker.tsx`
- `kizuna-demo/src/components/WalletConnect.tsx` (simple connect button label)
- Assets: `kizuna-demo/public/sample_avatar.png`, `kizuna-demo/public/KIZUNA.png`

Validation
- Switch tabs: Home → Live → Locker → KIZUNA Plaza works
- Home shows Shizuku, square large avatar image
- Live shows embedded video + comments
- Locker shows techniques grid
- Plaza shows concept image and descriptions

## 2) Data and Types (Stable Contracts for UI)

Goal: Keep all UI data shapes stable so future on‑chain integration is a drop‑in.

Files
- `kizuna-demo/src/types.ts` – Avatar, Technique, VenueStamp, Favorite
- `kizuna-demo/src/mockData.ts` – Shizuku mock with equipped techniques + stamps
- `kizuna-demo/src/services/avatarService.ts` – Abstraction to swap mock → Sui later

Actions
- If you need new fields for UI, extend types here first
- Keep imports as `import type { ... }` to avoid runtime import errors with `verbatimModuleSyntax`

Validation
- `npm run build` passes

## 3) Wallet Connect (Minimal, No SDK Lock‑in)

Goal: Simple “Connect Wallet” button that works with the injected Sui Wallet API; no heavy dependencies.

Files
- `kizuna-demo/src/components/WalletConnect.tsx`

Actions
- Detect `window.suiWallet`
- Request permissions → list accounts → store first address
- Show short address and a local disconnect (state reset)

Validation
- Wallet installed → button connects and shows `0x1234…abcd`
- Wallet not installed → button shows alert explaining to install Sui Wallet

## 4) Live Watch – Mint Window (Frontend First)

Goal: Demonstrate live UX and a “Mint Window” overlay with a passcode field (frontend only now). Actual mint wiring will arrive after Move contracts.

Plan
- Add a small overlay in `LiveWatchDemo` (or a sibling component) with:
  - Passcode input
  - Submit button → for now, simulate success (toast or inline success message)
  - Later, call backend `/mint/technique` which talks to Move

Validation
- Enter pass → success UI appears

## 5) Move Contracts – Package Layout

Create a Move workspace (`packages/kizuna_move`), with minimal but complete modules. Start with the smallest MVP (Admin + Avatar + Technique + Errors + Events). Stamps/Favorites/Auth can come next.

Proposed structure
```
packages/
  kizuna_move/
    Move.toml
    sources/
      admin.move
      avatar.move
      technique.move
      stamp.move
      favorite.move
      auth.move       # MintWindow, optional in MVP
      events.move
      errors.move
      utils.move
```

Module responsibilities (MVP subset)
- `admin.move`: `AdminCap`, `Config { equip_limit, favorites_limit }`, `init` entry, setters
- `avatar.move`: `Avatar { id, owner, equipped_count, total_stamps, aura_level, bag }`, `create_sbt`, `set_aura_level`, `snapshot_counts`
- `technique.move`: `Technique`, `TechniqueKey`, `mint_to_avatar`, `equip`, `unequip`
- `events.move`: emit `MintTechniqueEvent`, `EquipChangedEvent`
- `errors.move`: codes like `E_NOT_OWNER`, `E_EQUIP_LIMIT`, `E_DUP_TECHNIQUE`

Build locally
- `cd packages/kizuna_move && sui move build`

Validation
- Build succeeds locally
- Unit tests (optional): `sui move test`

## 6) Publish + Environment Wiring (Testnet)

Goal: Publish packages and expose IDs to frontend.

Steps
1) Fund a testnet wallet; set active address in Sui CLI.
2) `sui client publish --gas-budget 100000000 packages/kizuna_move`
3) Note `PACKAGE_ID` and object IDs for `AdminCap`, `Config` created by `init` (if emitted). Alternatively expose an `entry init` you call post‑publish.
4) Create `.env` with:
   - `VITE_SUI_PACKAGE_ID=0x...`
   - Optional: object IDs relevant to reads

Validation
- `sui client` commands can fetch module metadata

## 7) Frontend ↔ Move (Read)

Goal: Read Avatar snapshot and dynamic fields.

Plan
- Add a small Sui client util (no heavy SDKs required initially):
  - Use `@mysten/sui` (JSON-RPC) to:
    - Get avatar object by ID (owner, aura level)
    - Enumerate dynamic fields for techniques/stamps/favorites (for counts)
- Map results into `Avatar` shape used by UI

Files
- `kizuna-demo/src/services/suiClient.ts` (new)
- `kizuna-demo/src/services/avatarService.ts` – add Sui branch (feature flag by env)

Validation
- Home tab shows live on‑chain counts instead of mock when env is enabled

## 8) Frontend ↔ Move (Write: Mint → Locker)

Goal: Wire “Mint Window” submit to on‑chain `mint_to_avatar`.

Plan
- Add backend (optional) or direct RPC with signer:
  - Simpler for demo: ask wallet to sign and execute a transaction:
    - Move call: `technique::mint_to_avatar(window, pass, avatar_id, key, data, now_ms)`
  - If using server: call `/mint/technique` to validate pass (TTL/rate limit) then construct a sponsored tx

Files
- `kizuna-demo/src/components/LiveWatchDemo.tsx` – call into a `mintTechnique(pass)` function
- `kizuna-demo/src/services/mint.ts` (new) – craft transaction, request wallet to execute

Validation
- After mint success: Locker count increases, optional toast shows event ID

## 9) Stamp (Optional for MVP demo)

Goal: Add venue stamp to Avatar.

Plan
- Minimal direct call: `stamp::add_stamp(avatar, key, data)` guarded by Admin (judge demo: call as admin transaction or issue `StampTicket` later)
- Update Home counts and aura level when stamp added

Validation
- Counts reflect after tx, aura level updates (if rule exists)

## 10) Favorites (Optional for MVP demo)

Goal: Up to 3 favorites under Avatar; drive UI flags/colors/emotes.

Plan
- `favorite::set_favorite` / `unset_favorite`
- Frontend reads and reflects changes

Validation
- Home favorites chips update

## 11) Walrus + Seal (Phase 2)

Goal: Deliver gated media and fan–athlete interactions.

Plan
- Server endpoints to vend short‑lived URLs or policies
- Store media in Walrus; protect with Seal policy (e.g., owner address + score threshold)
- Integrate into Live (post‑match content) and Plaza (Shout Capsule)

Validation
- Authenticated fetch → decrypt → render

## 12) Quality, DX, and Troubleshooting

- Node/Vite: If you see CSP eval warnings, they often come from extensions (wallets). They are safe to ignore; avoid adding `unsafe-eval` to CSP in production.
- Type‑only imports: Always `import type { ... } from '...'` for TS interfaces to prevent runtime import errors.
- React Fast Refresh: If CSP blocks eval during dev, disable via `react({ fastRefresh: false })` in `vite.config.ts` (dev only).
- Extensions conflicts: “Cannot redefine property: ethereum” is from Ethereum wallets; disable them for the dev site.

## 13) Milestones & Review Checklist

Milestone A – UI foundation
- [ ] Tabs: Home/Live/Locker/Plaza render correctly
- [ ] Wallet connect shows address (or prompts install)
- [ ] Live embed + comment input works

Milestone B – Move MVP
- [ ] Build `kizuna_move` locally; basic admin+avatar+technique compile
- [ ] Publish to testnet; capture `PACKAGE_ID`
- [ ] Read avatar snapshot from chain in Home (env‑toggled)

Milestone C – Live Mint Flow
- [ ] “Mint Window” submits → wallet tx executes → technique added
- [ ] Locker reflects new technique

Milestone D – Stamps & Favorites (Optional)
- [ ] Stamp add path → counts/aura update
- [ ] Favorites set/unset reflected in Home

Milestone E – Walrus + Seal (Phase 2)
- [ ] Protected media retrievable under policy
- [ ] Live/Plaza surfaces gated content

## 14) Timeboxed Plan (Example)

- Day 1: Validate UI foundation, polish Home, stub Mint Window UI
- Day 2: Move MVP (admin/avatar/technique/errors/events), local build
- Day 3: Publish to testnet, frontend read integration (counts)
- Day 4: Mint Window write path, Locker refresh
- Day 5: Buffer for Stamp/Favorite or Walrus/Seal stub, end‑to‑end rehearsal

---

Use this guide as the canonical sequence. If a step fails, stop and fix locally before moving forward (builds should stay green after every step).
