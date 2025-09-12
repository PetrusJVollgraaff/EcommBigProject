export function CreateMediaDB(db) {
  db.exec(`
        CREATE TABLE IF NOT EXISTS media(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            type TEXT DEFAULT NULL
            width INTEGER 0,
            height INTEGER 0,
            ext TEXT DEFAULT NULL,
            create_by_userid INTEGER NOT NULL,
            create_at DATEIME DEFAULT CURRENT_TIMESTAMP
            deleted_by_userid INTEGER DEFAULT NULL
            deleted_yn BOOLEAN DEFAULT '0',
            deleted_at DATEIME DEFAULT NULL,
            FOREIGN KEY(deleted_by_userid) REFERENCES users(id),
            FOREIGN KEY(create_by_userid) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS media_used(
            id INTEGER PRIMARY KEY AUTOINCREMENT,   
            media_id INTEGER NOT NULL,
            modules_id INTEGER NOT NULL,
            create_by_userid INTEGER NOT NULL,
            create_at DATEIME DEFAULT CURRENT_TIMESTAMP
            deleted_by_userid INTEGER DEFAULT NULL
            deleted_yn BOOLEAN DEFAULT '0',
            deleted_at DATEIME DEFAULT NULL,
            FOREIGN KEY(deleted_by_userid) REFERENCES users(id),
            FOREIGN KEY(create_by_userid) REFERENCES users(id),
            FOREIGN KEY(media_id) REFERENCES media(id),
            FOREIGN KEY(modules_id) REFERENCES modules(id)
        );
    `);
}
