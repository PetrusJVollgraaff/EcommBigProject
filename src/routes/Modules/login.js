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

router.post("/login", (req, res) => {
  console.log("hello", req.body);
  passport.authenticate("local", (err, user, info) => {
    console.log(err);
    console.log(user);
    console.log(info);
  });
  /*{
    successRedirect: "../modules/",
    failureRedirect: "./",
    failureFlash: true,
  } */
});

router.post("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/edit");
  });
});

module.exports = router;
