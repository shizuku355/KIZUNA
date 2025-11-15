module kizuna::technique {
    use sui::dynamic_object_field;
    use std::string;

    use kizuna::avatar;

    const MAX_SLOTS: u8 = 7;
    const E_ALREADY_EQUIPPED: u64 = 1;

    /// Technique object stored as a Dynamic Object Field under Avatar.
    public struct Technique has key, store {
        id: UID,
        name: string::String,
        category: u8,
        rarity: u8,
        equipped: bool,
        /// Opaque key used as Dynamic Object Field name (e.g. "2025-11-15_flying_knee").
        tech_key: vector<u8>,
    }

    /// Mint a new technique and attach it to the avatar as a Dynamic Object Field.
    ///
    /// Note: access control (who can mint) is left to the caller / higher level
    /// module or off-chain service.
    entry fun mint_to_avatar(
        avatar_obj: &mut avatar::Avatar,
        tech_key: vector<u8>,
        name: string::String,
        category: u8,
        rarity: u8,
        ctx: &mut sui::tx_context::TxContext,
    ) {
        let id = sui::object::new(ctx);
        let key = copy tech_key;
        let t = Technique {
            id,
            name,
            category,
            rarity,
            equipped: false,
            tech_key,
        };
        dynamic_object_field::add(avatar::avatar_id_mut(avatar_obj), key, t);
        // Aura does not change until equipped or used; no recalc here.
    }

    /// Equip a technique into the avatar's 7-slot ring.
    ///
    /// This sets `equipped = true` and increments `equipped_tech_count` on Avatar,
    /// enforcing the MAX_SLOTS limit. Aura level is recalculated after the change.
    entry fun equip(
        avatar_obj: &mut avatar::Avatar,
        tech_key: vector<u8>,
        ctx: &mut sui::tx_context::TxContext,
    ) {
        assert!(avatar::equipped_count(avatar_obj) < MAX_SLOTS, 2);
        let key = copy tech_key;
        let t = dynamic_object_field::borrow_mut<vector<u8>, Technique>(
            avatar::avatar_id_mut(avatar_obj),
            key,
        );

        assert!(!t.equipped, E_ALREADY_EQUIPPED);

        t.equipped = true;
        avatar::increment_equipped(avatar_obj, 1);

        // Recalculate aura level based on new equipped count.
        let _ = avatar::recalc_aura_level(avatar_obj, ctx);
    }

    /// Unequip a technique from the avatar's ring.
    entry fun unequip(
        avatar_obj: &mut avatar::Avatar,
        tech_key: vector<u8>,
        ctx: &mut sui::tx_context::TxContext,
    ) {
        let key = copy tech_key;
        let t = dynamic_object_field::borrow_mut<vector<u8>, Technique>(
            avatar::avatar_id_mut(avatar_obj),
            key,
        );

        if (!t.equipped) {
            // Nothing to do.
        } else {
            t.equipped = false;
            avatar::decrement_equipped(avatar_obj, 1);
            let _ = avatar::recalc_aura_level(avatar_obj, ctx);
        }
    }
}
