export function CreateProductsDB(db) {
  db.exec(`
        CREATE TABLE IF NOT EXISTS products(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            instock INTEGER DEFAULT 0
            onspecial BOOLEAN DEFAULT '0',
            create_by_userid INTEGER NOT NULL,
            create_at DATEIME DEFAULT CURRENT_TIMESTAMP
            deleted_by_userid INTEGER DEFAULT NULL
            deleted_yn BOOLEAN DEFAULT '0',
            deleted_at DATEIME DEFAULT NULL,
            FOREIGN KEY(deleted_by_userid) REFERENCES users(id),
            FOREIGN KEY(create_by_userid) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS product_prices(
            id INTEGER PRIMARY KEY AUTOINCREMENT,   
            products_id INTEGER,
            Price FLOAT DEFAULT NULL,
            specialdateStart DATETIME DEFAULT Null,
            specialdateEnd DATETIME DEFAULT Null,
            isspecial BOOLEAN DEFAULT '0',
            create_by_userid INTEGER NOT NULL,
            create_at DATEIME DEFAULT CURRENT_TIMESTAMP
            deleted_by_userid INTEGER DEFAULT NULL
            deleted_yn BOOLEAN DEFAULT '0',
            deleted_at DATEIME DEFAULT NULL,
            FOREIGN KEY(deleted_by_userid) REFERENCES users(id),
            FOREIGN KEY(create_by_userid) REFERENCES users(id)
        );
    `);
}
