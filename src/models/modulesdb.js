export function CreateModuleDB(db) {
  db.exec(`
        CREATE TABLE IF NOT EXISTS modules(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            create_at DATEIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

  const modules = [{ name: "media_manager" }, { name: "product_manager" }];

  const insertroles = db.prepare("INSERT INTO modules (name) VALUES (@name)");
  const insterMany = db.transaction((items) => {
    for (const item of items) {
      insertroles.run(item);
    }
  });

  insterMany(modules);
}
