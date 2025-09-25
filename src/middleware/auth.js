function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();

  //req.flash("error", "You must be logged in.");
  res.redirect("../edit");
}

function ensureRole(role) {
  return function (req, res, next) {
    if (req.isAuthenticated() && req.user) return next();
    //req.flash("error", "Not authorized");
    res.redirect("/");
  };
}

module.exports = { ensureAuthenticated, ensureRole };
