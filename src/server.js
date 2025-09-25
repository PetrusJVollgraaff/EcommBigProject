require("dotenv").config();
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const path = require("path");
const http = require("http");
const fs = require("fs");

const session = require("express-session");
const SQLiteStore = require("connect-sqlite3")(session);
const passport = require("passport");
const helmet = require("helmet");
const methodOverride = require("method-override");
const initializePassport = require("./scripts/passport-config");

const routepath = path.join(__dirname, "routes");
const viewspath = path.join(__dirname, "views");
const imgDir = path.join(__dirname, "/public/images");

const dbDir = path.join(__dirname, "db");
if (!fs.existsSync(imgDir)) fs.mkdirSync(imgDir, { recursive: true });

const FrontEndRoutes = require(routepath + "/frontend/main");
const BackEndRoutes = require(routepath + "/modules/main");
const BackEndLoginRoutes = require(routepath + "/modules/login");

const PORT = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);

//Set Layouts
app.set("view engine", "ejs");
app.set("views", viewspath);
app.use(expressLayouts);
app.set("layout", "frontend/layout/main");

//setup middleware
initializePassport(passport);

app.use(helmet());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));

app.use(
  session({
    store: new SQLiteStore({ db: "session.sqlite", dir: dbDir }),
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 1day
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Images paths
app.use("/static/images", express.static(imgDir));

// ---FRONTEND ROUTES ---
app.use("/", FrontEndRoutes);

// --- BACKEND ROUTES ---
app.use("/modules", BackEndRoutes);
app.use("/edit", BackEndLoginRoutes);

server.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
