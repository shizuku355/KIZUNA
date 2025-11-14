module kizuna::favorite {
    use sui::object::{Self, UID};
    use sui::dynamic_object_field;
    use sui::string::{Self, String};
    use sui::tx_context::{Self, TxContext};

    use kizuna::avatar;

    /// Favorite / 推し object stored as a Dynamic Object Field under Avatar.
    ///
    /// アプリ側では「最大3件まで」を推奨とし、実際の件数制御はフロント・バックエンドで
    /// 管理してもよい。ここでは 1 kind + fav_id ごとに 1 つの Favorite を保持する。
    struct Favorite has key, store {
        id: UID,
        kind: u8,      // 0:選手,1:競技,2:チーム,3:国
        fav_id: String,
        since_ms: u64,
        score: u64,
    }

    /// Set or replace a favorite entry for the given Avatar.
    ///
    /// Key = fav_id bytes（kind はオブジェクトのフィールドで保持）
    public entry fun set_favorite(
        avatar_obj: &mut avatar::Avatar,
        kind: u8,
        fav_id: String,
        since_ms: u64,
        score: u64,
        ctx: &mut TxContext,
    ) {
        let key = string::into_bytes(string::clone(&fav_id));

        if (dynamic_object_field::exists<vector<u8>, Favorite>(&avatar_obj.id, &key)) {
            // Replace existing favorite in-place.
            let fav = dynamic_object_field::borrow_mut<vector<u8>, Favorite>(&mut avatar_obj.id, &key);
            fav.since_ms = since_ms;
            fav.score = score;
        } else {
            let id = object::new(ctx);
            let fav = Favorite {
                id,
                kind,
                fav_id,
                since_ms,
                score,
            };
            dynamic_object_field::add(&mut avatar_obj.id, key, fav);
        };

        // Optionally: hook into aura scoring via score / favorites count.
        let _ = avatar::recalc_aura_level(avatar_obj, ctx);
    }
}
