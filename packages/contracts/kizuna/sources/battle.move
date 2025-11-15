module kizuna::battle {
    use sui::object::{self, UID};
    use sui::tx_context::{self, TxContext};
    use sui::clock::{Self, Clock};
    use sui::event;
    use sui::transfer;

    use kizuna::avatar;

    const EInvalidWinner: u64 = 1;

    /// Admin capability that authorizes recording battle results.
    /// Intended to be held by a backend service account.
    struct BattleAdminCap has key {
        id: UID,
    }

    /// Event emitted whenever a battle result is recorded.
    struct BattleFinishedEvent has copy, drop {
        avatar_a: address,
        avatar_b: address,
        /// 0 = Draw, 1 = A wins, 2 = B wins.
        winner: u8,
        score_a: u8,
        score_b: u8,
        /// Ruleset identifier (0 = RPS_V1, future versions can add more).
        ruleset: u8,
        timestamp_ms: u64,
    }

    /// One-time initializer to create the BattleAdminCap.
    /// The cap is transferred to the transaction sender and should be kept
    /// by the backend service that records battles.
    entry fun init_admin_cap(ctx: &mut TxContext) {
        let id = object::new(ctx);
        let cap = BattleAdminCap { id };
        let sender = tx_context::sender(ctx);
        transfer::transfer(cap, sender);
    }

    /// Record a battle result between two Avatars.
    ///
    /// - `admin` must be present to authorize the call.
    /// - `winner`: 0 = Draw, 1 = avatar_a wins, 2 = avatar_b wins.
    /// - `ruleset`: 0 = RPS_V1.
    entry fun record_battle(
        _admin: &BattleAdminCap,
        avatar_a: &mut avatar::Avatar,
        avatar_b: &mut avatar::Avatar,
        winner: u8,
        score_a: u8,
        score_b: u8,
        ruleset: u8,
        clock: &Clock,
        ctx: &mut TxContext,
    ) {
        assert!(winner <= 2, EInvalidWinner);

        // Update per-avatar stats.
        if (winner == 1) {
            avatar::apply_battle_result(avatar_a, 1, 0, 0);
            avatar::apply_battle_result(avatar_b, 0, 1, 0);
        } else if (winner == 2) {
            avatar::apply_battle_result(avatar_a, 0, 1, 0);
            avatar::apply_battle_result(avatar_b, 1, 0, 0);
        } else {
            // Draw.
            avatar::apply_battle_result(avatar_a, 0, 0, 1);
            avatar::apply_battle_result(avatar_b, 0, 0, 1);
        };

        // Recalculate aura levels (e.g. if battle count also influences aura later).
        let _ = avatar::recalc_aura_level(avatar_a, ctx);
        let _ = avatar::recalc_aura_level(avatar_b, ctx);

        // Emit event for off-chain indexers and frontends.
        event::emit(BattleFinishedEvent {
            avatar_a: avatar::owner(avatar_a),
            avatar_b: avatar::owner(avatar_b),
            winner,
            score_a,
            score_b,
            ruleset,
            timestamp_ms: clock::timestamp_ms(clock),
        });
    }
}
