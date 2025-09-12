const db = require("../db");

const { CreateModuleDB } = require("../models/modulesdb");
const { CreateUsersDB } = require("../models/usersdb");

function init() {
  CreateModuleDB(db);
  CreateUsersDB(db);
}
