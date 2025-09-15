function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();

  //req.flash("error", "You must be logged in.");
  res.redirect("./login");
}

function ensureRole(role) {
  return function (req, res, next) {
    if (req.isAuthenticated() && req.user && req.user.role === "role")
      return next();
    //req.flash("error", "Not authorized");
    res.redirect("/");
  };
}

module.exports = { ensureAuthenticated, ensureRole };
