const { db } = require("../db.js");

const { CreateUsersDB } = require("../models/usersdb.js");
const { CreateMediaDB } = require("../models/mediadb.js");
const { CreateProductsDB } = require("../models/productsdb.js");

async function init() {
  await CreateUsersDB(db);
  await CreateMediaDB(db);
  await CreateProductsDB(db);
}

init().catch((err) => {
  console.error(err);
  process.exit(1);
});
