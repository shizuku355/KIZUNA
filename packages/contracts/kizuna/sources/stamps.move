module kizuna::stamps {
    use sui::object::{self, UID};
    use sui::dynamic_object_field;
    use sui::tx_context::{self, TxContext};
    use std::string;
    use std::vector;

    use kizuna::avatar;

    const E_ALREADY_STAMPED: u64 = 1;

    /// Venue stamp object stored as a Dynamic Object Field under Avatar.
    struct VenueStamp has key, store {
        id: UID,
        /// Unique event identifier (e.g. "ONE_TOKYO_2025_11_15").
        event_id: string::String,
        /// ISO date string (e.g. "2025-11-15").
        date_iso: string::String,
        /// Human readable venue name.
        venue: string::String,
        /// Optional display color code as small string (e.g. "#FFD700").
        color: string::String,
    }

    /// Mint a new VenueStamp for an Avatar, enforcing uniqueness by event_id.
    entry fun stamp_avatar(
        avatar_obj: &mut avatar::Avatar,
        event_id: string::String,
        date_iso: string::String,
        venue: string::String,
        color: string::String,
        ctx: &mut TxContext,
    ) {
        // Use event_id bytes as Dynamic Object Field key.
        let key_bytes = string::to_bytes(&event_id);

        assert!(
            !dynamic_object_field::exists<vector<u8>, VenueStamp>(
                avatar::avatar_id(avatar_obj),
                vector::clone(&key_bytes),
            ),
            E_ALREADY_STAMPED
        );

        let id = object::new(ctx);
        let stamp = VenueStamp {
            id,
            event_id,
            date_iso,
            venue,
            color,
        };

        dynamic_object_field::add(
            avatar::avatar_id_mut(avatar_obj),
            vector::clone(&key_bytes),
            stamp,
        );

        // Update total stamp count and aura level.
        avatar::increment_stamps(avatar_obj, 1);
        let _ = avatar::recalc_aura_level(avatar_obj, ctx);
    }
}
