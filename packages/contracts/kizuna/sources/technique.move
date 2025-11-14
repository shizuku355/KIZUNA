module kizuna::technique {
    use sui::object::{Self, UID};
    use sui::dynamic_object_field;
    use sui::tx_context::{Self, TxContext};
    use sui::string;

    use kizuna::avatar;

    const EAlreadyEquipped: u64 = 1;
    const EMaxSlots: u64 = 2;

    /// Max number of techniques that can be equipped in the ring.
    const MAX_SLOTS: u8 = 7;

    /// Technique object stored as a Dynamic Object Field under Avatar.
    struct Technique has key, store {
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
    public entry fun mint_to_avatar(
        avatar_obj: &mut avatar::Avatar,
        tech_key: vector<u8>,
        name: string::String,
        category: u8,
        rarity: u8,
        ctx: &mut TxContext,
    ) {
        let id = object::new(ctx);
        let t = Technique {
            id,
            name,
            category,
            rarity,
            equipped: false,
            tech_key: tech_key.clone(),
        };

        dynamic_object_field::add(&mut avatar_obj.id, tech_key, t);
        // Aura does not change until equipped or used; no recalc here.
    }

    /// Equip a technique into the avatar's 7-slot ring.
    ///
    /// This sets `equipped = true` and increments `equipped_tech_count` on Avatar,
    /// enforcing the MAX_SLOTS limit. Aura level is recalculated after the change.
    public entry fun equip(
        avatar_obj: &mut avatar::Avatar,
        tech_key: vector<u8>,
        ctx: &mut TxContext,
    ) {
        // Borrow the Technique child object.
        let t = dynamic_object_field::borrow_mut<vector<u8>, Technique>(&mut avatar_obj.id, &tech_key);

        assert!(!t.equipped, EAlreadyEquipped);
        assert!(avatar_obj.equipped_tech_count < MAX_SLOTS, EMaxSlots);

        t.equipped = true;
        avatar::increment_equipped(avatar_obj, 1);

        // Recalculate aura level based on new equipped count.
        let _ = avatar::recalc_aura_level(avatar_obj, ctx);
    }

    /// Unequip a technique from the avatar's ring.
    public entry fun unequip(
        avatar_obj: &mut avatar::Avatar,
        tech_key: vector<u8>,
        ctx: &mut TxContext,
    ) {
        let t = dynamic_object_field::borrow_mut<vector<u8>, Technique>(&mut avatar_obj.id, &tech_key);

        if (!t.equipped) {
            // Nothing to do.
            return;
        };

        t.equipped = false;
        avatar::decrement_equipped(avatar_obj, 1);
        let _ = avatar::recalc_aura_level(avatar_obj, ctx);
    }
}
