module kizuna::favorite {
    use sui::object::{self, UID};
    use sui::dynamic_object_field;
    use sui::tx_context::{self, TxContext};
    use std::string;
    use std::vector;

    use kizuna::avatar;

    /// Favorite / 推し object stored as a Dynamic Object Field under Avatar.
    ///
    /// アプリ側では「最大3件まで」を推奨とし、実際の件数制御はフロント・バックエンドで
    /// 管理してもよい。ここでは 1 kind + fav_id ごとに 1 つの Favorite を保持する。
    struct Favorite has key, store {
        id: UID,
        kind: u8,      // 0:選手,1:競技,2:チーム,3:国
        fav_id: string::String,
        since_ms: u64,
        score: u64,
    }

    /// Set or replace a favorite entry for the given Avatar.
    ///
    /// Key = fav_id bytes（kind はオブジェクトのフィールドで保持）
    entry fun set_favorite(
        avatar_obj: &mut avatar::Avatar,
        kind: u8,
        fav_id: string::String,
        since_ms: u64,
        score: u64,
        ctx: &mut TxContext,
    ) {
        let key_bytes = string::to_bytes(&fav_id);

        if (dynamic_object_field::exists<vector<u8>, Favorite>(
            avatar::avatar_id(avatar_obj),
            vector::clone(&key_bytes),
        )) {
            let fav = dynamic_object_field::borrow_mut<vector<u8>, Favorite>(
                avatar::avatar_id_mut(avatar_obj),
                vector::clone(&key_bytes),
            );
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
            dynamic_object_field::add(
                avatar::avatar_id_mut(avatar_obj),
                vector::clone(&key_bytes),
                fav,
            );
        };

        // Optionally: hook into aura scoring via score / favorites count.
        let _ = avatar::recalc_aura_level(avatar_obj, ctx);
    }
}
