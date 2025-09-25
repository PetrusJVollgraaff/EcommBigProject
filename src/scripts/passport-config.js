const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const { db } = require("../db.js");

function initialize(passport) {
  const authenticateUser = async (username, password, done) => {
    try {
      const user = db
        .prepare("SELECT * FROM users WHERE username = ?")
        .get(username);
      if (!user)
        return done(null, false, { message: "No user with that username" });

      if (!user)
        return done(null, false, { message: "No user with that username" });

      const match = await bcrypt.compare(password, user.password);
      if (match)
        return done(null, {
          id: user.id,
          username: user.username,
        });
      return done(null, false, { message: "Password incorrect" });
    } catch (err) {
      return err;
    }
  };

  passport.use(new LocalStrategy(authenticateUser));

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = db
        .prepare("SELECT id, username, roleId FROM users WHERE id = ?")
        .get(id);
      done(null, user || null);
    } catch (err) {
      done(err);
    }
  });
}

module.exports = initialize;
