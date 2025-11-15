module kizuna::avatar {
    use sui::event;

    /// Error codes
    const ENotOwner: u64 = 1;

    /// Core SBT avatar object.
    ///
    /// Treated as non-transferable at the app layer. Frontends rely on aura,
    /// stamps, and techniques stored alongside this SBT.
    public struct Avatar has key {
        id: sui::object::UID,
        /// Current logical owner of the avatar.
        owner: address,

        /// Equipped techniques count (for 7-slot ring).
        equipped_tech_count: u8,
        /// Total number of venue stamps acquired.
        total_stamps: u64,
        /// Optional watch score (e.g. from live streams).
        watch_score: u64,

        /// Aura level 0–3, derived from score.
        aura_level: u8,

        /// Battle stats (for GAME / battle module).
        total_battles: u64,
        wins: u32,
        losses: u32,
        draws: u32,
        walrus_blob_id: Option<vector<u8>>,
    }

    /// Emitted whenever aura_level changes.
    public struct AuraLevelChangedEvent has copy, drop {
        owner: address,
        old_level: u8,
        new_level: u8,
        score: u64,
    }

    /// Mint a new Avatar SBT for the transaction sender.
    entry fun mint_avatar(ctx: &mut sui::tx_context::TxContext) {
        let owner = sui::tx_context::sender(ctx);
        let avatar = Avatar {
            id: sui::object::new(ctx),
            owner,
            equipped_tech_count: 0,
            total_stamps: 0,
            watch_score: 0,
            aura_level: 0,
            total_battles: 0,
            wins: 0,
            losses: 0,
            draws: 0,
            walrus_blob_id: option::none(),
        };
        sui::transfer::transfer(avatar, owner);
    }

    /// Read-only getter for the owner address.
    public fun owner(avatar: &Avatar): address {
        avatar.owner
    }

    /// Assert that the transaction sender is the logical owner of the avatar.
    public fun assert_sender_is_owner(avatar: &Avatar, ctx: &sui::tx_context::TxContext) {
        let sender = sui::tx_context::sender(ctx);
        assert!(sender == avatar.owner, ENotOwner);
    }

    /// Mutable access to the UID for Dynamic Field helpers.
    public fun avatar_id_mut(avatar: &mut Avatar): &mut sui::object::UID {
        &mut avatar.id
    }

    /// Immutable access to the UID.
    public fun avatar_id(avatar: &Avatar): &sui::object::UID {
        &avatar.id
    }

    /// Increase total_stamps counter (to be called from stamps module).
    public fun increment_stamps(avatar: &mut Avatar, delta: u64) {
        avatar.total_stamps = avatar.total_stamps + delta;
    }

    /// Increase equipped technique count (to be called from technique module).
    public fun increment_equipped(avatar: &mut Avatar, delta: u8) {
        avatar.equipped_tech_count = avatar.equipped_tech_count + delta;
    }
    /// Return equipped count.
    public fun equipped_count(avatar: &Avatar): u8 {
        avatar.equipped_tech_count
    }

    /// Decrease equipped technique count (to be called from technique module).
    public fun decrement_equipped(avatar: &mut Avatar, delta: u8) {
        avatar.equipped_tech_count = avatar.equipped_tech_count - delta;
    }

    /// Adjust watch score (for example when live watch missions are completed).
    public fun add_watch_score(avatar: &mut Avatar, delta: u64) {
        avatar.watch_score = avatar.watch_score + delta;
    }

    /// Update battle stats from the battle module.
    public fun apply_battle_result(avatar: &mut Avatar, wins_delta: u32, losses_delta: u32, draws_delta: u32) {
        avatar.total_battles =
            avatar.total_battles + (wins_delta as u64) + (losses_delta as u64) + (draws_delta as u64);
        avatar.wins = avatar.wins + wins_delta;
        avatar.losses = avatar.losses + losses_delta;
        avatar.draws = avatar.draws + draws_delta;
    }

    /// Compute an aura score based on stamps, equipped techniques, and watch score.
    /// This is a simple linear model aligned with the spec and can be tuned later.
    public fun compute_aura_score(avatar: &Avatar): u64 {
        let stamp_score = avatar.total_stamps * 10;
        let equip_score = (avatar.equipped_tech_count as u64) * 5;
        let watch_score = avatar.watch_score;
        stamp_score + equip_score + watch_score
    }

    /// Map a score into an aura level 0–3.
    public fun aura_level_from_score(score: u64): u8 {
        if (score < 50) {
            0
        } else if (score < 150) {
            1
        } else if (score < 300) {
            2
        } else {
            3
        }
    }

    /// Recalculate aura_level and emit AuraLevelChangedEvent if it changed.
    /// Returns true if aura_level was updated.
    public fun recalc_aura_level(avatar: &mut Avatar, _ctx: &mut sui::tx_context::TxContext): bool {
        let score = compute_aura_score(avatar);
        let new_level = aura_level_from_score(score);
        if (new_level == avatar.aura_level) {
            return false
        };
        let old_level = avatar.aura_level;
        avatar.aura_level = new_level;

        event::emit(AuraLevelChangedEvent {
            owner: avatar.owner,
            old_level,
            new_level,
            score,
        });

        true
    }

    /// Return the blob ID that is currently associated with this Avatar.
    public fun walrus_blob_id(avatar: &Avatar): Option<vector<u8>> {
        if (option::is_some(&avatar.walrus_blob_id)) {
            let blob = option::borrow(&avatar.walrus_blob_id);
            option::some(clone_vector(blob))
        } else {
            option::none()
        }
    }

    /// Update the blob ID shown for the Avatar (owner-only).
    public fun set_walrus_blob_id(
        avatar: &mut Avatar,
        blob_id: Option<vector<u8>>,
        ctx: &mut sui::tx_context::TxContext,
    ) {
        assert_sender_is_owner(avatar, ctx);
        avatar.walrus_blob_id = blob_id;
    }

    fun clone_vector(src: &vector<u8>): vector<u8> {
        let mut out = vector::empty();
        let len = src.length();
        let mut idx = 0;
        while (idx < len) {
            let byte = src[idx];
            out.push_back(byte);
            idx = idx + 1;
        };
        out
    }
}
