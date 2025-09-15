const express = require("express");
const path = require("path");
const router = express.Router();

const projectRoot = path.join(__dirname, "../..");

router.use("/static", express.static(path.join(projectRoot, "/views/backend")));

//login page backend
router.get("/login", (req, res) => {
  res.render("./backend/pages/login", {
    layout: "backend/layout/login", // <-- switch to backend layout
    title: "login",
  });
});

router.post("/login", (req, res) => {
  /*passport.authenticate("local", {
    successRedirect: "/modules/",
    failureRedirect: "/edit/login",
    failureFlash: true,
  });*/
});

router.post("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/edit/login");
  });
});

module.exports = router;
