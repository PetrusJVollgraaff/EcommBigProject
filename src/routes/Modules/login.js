const express = require("express");
const path = require("path");
const router = express.Router();
const passport = require("passport");
const csurf = require("csurf");

const projectRoot = path.join(__dirname, "../..");

router.use("/static", express.static(path.join(projectRoot, "/views/backend")));

//CSRF protection for non-get
router.use(csurf());
router.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();

  next();
});

//login page backend
router.get("/", (req, res) => {
  res.render("./backend/pages/login", {
    layout: "backend/layout/login", // <-- switch to backend layout
    title: "login",
  });
});

router.post("/login", (req, res, next) => {
  console.log(req.body);
  passport.authenticate("local", (err, user, info) => {
    console.log(err, user, info);
    if (err) return next(err);
    if (!user) {
      console.log("Login failed:", info);
      return res.redirect("./");
    }
    req.logIn(user, (err) => {
      console.log(err);
      if (err) return next(err);
      console.log("Login successful:", user.username);
      return res.redirect("../modules/");
    });
  })(req, res, next);
});

router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/edit");
  });
});

module.exports = router;
