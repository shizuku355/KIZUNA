module kizuna::stamps {
    use sui::object::{Self, UID};
    use sui::dynamic_object_field;
    use sui::string::{Self, String};
    use sui::tx_context::{Self, TxContext};

    use kizuna::avatar;

    const EAlreadyStamped: u64 = 1;

    /// Venue stamp object stored as a Dynamic Object Field under Avatar.
    struct VenueStamp has key, store {
        id: UID,
        /// Unique event identifier (e.g. "ONE_TOKYO_2025_11_15").
        event_id: String,
        /// ISO date string (e.g. "2025-11-15").
        date_iso: String,
        /// Human readable venue name.
        venue: String,
        /// Optional display color code as small string (e.g. "#FFD700").
        color: String,
    }

    /// Mint a new VenueStamp for an Avatar, enforcing uniqueness by event_id.
    public entry fun stamp_avatar(
        avatar_obj: &mut avatar::Avatar,
        event_id: String,
        date_iso: String,
        venue: String,
        color: String,
        ctx: &mut TxContext,
    ) {
        // Use event_id bytes as Dynamic Object Field key.
        let key = string::into_bytes(string::clone(&event_id));

        assert!(
            !dynamic_object_field::exists<vector<u8>, VenueStamp>(&avatar_obj.id, &key),
            EAlreadyStamped
        );

        let id = object::new(ctx);
        let stamp = VenueStamp {
            id,
            event_id,
            date_iso,
            venue,
            color,
        };

        dynamic_object_field::add(&mut avatar_obj.id, key, stamp);

        // Update total stamp count and aura level.
        avatar::increment_stamps(avatar_obj, 1);
        let _ = avatar::recalc_aura_level(avatar_obj, ctx);
    }
}

