const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config();
const app = express();

const uri = process.env.ATLASDB_URL;
async function connectDB() {
  try {
    await mongoose.connect(uri);
    console.log("MongoDB Atlas connected successfully!");
  } catch (err) {
    console.error("MongoDB Atlas connection error:", err);
  }
}

connectDB();

app.set("view engine", "ejs");
app.set(path.join(__dirname, "views"));

const feedbackSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  feedback: {
    type: String,
    required: true,
  },
});

const Feedback = new mongoose.model("Feedback", feedbackSchema);

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
const store = MongoStore.create({
  mongoUrl: uri,
  crypto: {
    secret: "mySecretCode",
  },
  touchAfter: 24 * 3600,
});

store.on("error", () => {
  console.log("some error occured in mongo session store");
});

app.use(
  session({
    store: store,
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

app.post("/feedback", async (req, res) => {
  try {
    let { name, feedback } = req.body;
    let feedback1 = new Feedback({
      name: name,
      feedback: feedback,
    });
    await feedback1.save();
    req.flash("success", "your feedback has been recorded");
    res.redirect("/");
  } catch (err) {
    req.flash("error", "some error occured");
    res.redirect("/");
  }
});

app.listen(8080, () => {
  console.log("listening on port 8080");
});
