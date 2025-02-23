const express = require("express");
const session = require("express-session");
const flash = require("connect-flash");
const path = require("path");

const app = express();

app.set("view engine", "ejs");
app.set(path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: "mySecretCode",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 },
  })
);

app.use(flash());
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.get("/feedback", (req, res) => {
  res.render("feedback.ejs");
});

app.post("/feedback", (req, res) => {
  req.flash("success", "your feedback has been recorded");
  res.redirect("/");
});

app.listen(8080, () => {
  console.log("listening on port 8080");
});
