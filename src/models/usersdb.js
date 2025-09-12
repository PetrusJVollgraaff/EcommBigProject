require("dotenv").config();
const bcrypt = require("bcrypt");

export function CreateUsersDB(db) {
  db.exec(`
        CREATE TABLE IF NOT EXISTS roles(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            actions TEXT NOT NULL,
            user_id INTEGER DEFAULT NULL,
            create_at DATEIME DEFAULT CURRENT_TIMESTAMP
            deleted_at DATEIME DEFAULT NULL
            FOREIGN KEY(user_id) REFERENCES users(id),
        );
        
        CREATE TABLE IF NOT EXISTS users(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            roleId INTEGER DEFAULT NULL,
            create_at DATEIME DEFAULT CURRENT_TIMESTAMP
            deleted_at DATEIME DEFAULT NULL
        );
        
        CREATE TABLE IF NOT EXISTS logs(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            notes TEXT NOT NULL,
            moduleid INTEGER DEFAULT NULL,
            user_id INTEGER DEFAULT NULL,
            deleted_at DATEIME DEFAULT CURRENT_TIMESTAMP
            FOREIGN KEY(user_id) REFERENCES users(id),
        )
    `);

  const roles = [
    { name: "admin", action: "create, modify, delete" },
    { name: "user", action: "create, modify" },
  ];

  const insertroles = db.prepare(
    "INSERT INTO roles (name, actions) VALUES (@name, @action)"
  );
  const insterMany = db.transaction((items) => {
    for (const item of items) {
      insertroles.run(item);
    }
  });

  insterMany(roles);

  const admin = db
    .prepare("SELECT * FROM users WHERE username = ?")
    .get("admin");

  if (!admin) {
    const hash = bcrypt.hashSync(
      process.env.SEED_ADMIN_PASSWORD || "adminpass",
      10
    );
    db.prepare(
      "INSERT INTO users (username, password, roleId) VALUES (?,?,?)"
    ).run("admin", hash, "1");
    console.log(
      "Seeded admin user: username=admin password=" +
        (process.env.SEED_ADMIN_PASSWORD || "adminpass")
    );
  } else {
    console.log("Admin already exists.");
  }
}
