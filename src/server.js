require("dotenv").config();
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const path = require("path");
const http = require("http");
const fs = require("fs");

const PORT = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);

const routepath = path.join(__dirname, "routes");
const viewspath = path.join(__dirname, "views");
const imgDir = path.join(__dirname, "/public/images");

if (!fs.existsSync(imgDir)) fs.mkdirSync(imgDir, { recursive: true });
//Set Layouts
app.set("view engine", "ejs");
app.set("views", viewspath);
app.use(expressLayouts);
app.set("layout", "frontend/layout/main");

// Images paths
app.use("/static/images", express.static(imgDir));

// ---FRONTEND ROUTES ---
const FrontEndRoutes = require(routepath + "/frontend/main");
app.use("/", FrontEndRoutes);

// --- BACKEND ROUTES ---
const BackEndRoutes = require(routepath + "/modules/main");
app.use("/modules", BackEndRoutes);

server.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
