async function CreateProductsDB(db) {
  await db.exec(`
        CREATE TABLE IF NOT EXISTS product_manager_settings(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            currency TEXT UNIQUE DEFAULT 'USD' NOT NULL,
            tax_percentage INTEGER DEFAULT 0,
            show_tax_onsite BOOLEAN DEFAULT '0'
        );
        
        CREATE TABLE IF NOT EXISTS products(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            mediaused_id INTEGER NOT NULL,
            name TEXT UNIQUE NOT NULL,
            description TEXT DEFAULT NULL,
            instock INTEGER DEFAULT 0,
            code TEXT NOT NULL,
            onspecial BOOLEAN DEFAULT '0',
            showonline BOOLEAN DEFAULT '0',
            create_by_userid INTEGER NOT NULL,
            create_at DATEIME DEFAULT CURRENT_TIMESTAMP,
            deleted_by_userid INTEGER DEFAULT NULL,
            deleted_yn BOOLEAN DEFAULT '0',
            deleted_at DATEIME DEFAULT NULL,
            FOREIGN KEY(mediaused_id) REFERENCES media_used(id),
            FOREIGN KEY(deleted_by_userid) REFERENCES users(id),
            FOREIGN KEY(create_by_userid) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS product_prices(
            id INTEGER PRIMARY KEY AUTOINCREMENT,   
            products_id INTEGER,
            Price FLOAT DEFAULT NULL,
            specialdateStart DATETIME DEFAULT NULL,
            specialdateEnd DATETIME DEFAULT NULL,
            isspecial BOOLEAN DEFAULT '0',
            create_by_userid INTEGER NOT NULL,
            create_at DATEIME DEFAULT CURRENT_TIMESTAMP,
            deleted_by_userid INTEGER DEFAULT NULL,
            deleted_yn BOOLEAN DEFAULT '0',
            deleted_at DATEIME DEFAULT NULL,
            FOREIGN KEY(deleted_by_userid) REFERENCES users(id),
            FOREIGN KEY(create_by_userid) REFERENCES users(id)
        );
    `);
}

module.exports = { CreateProductsDB };
