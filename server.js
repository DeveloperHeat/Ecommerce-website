import express from "express";
import multer from "multer"; // Add this line
import fs from "fs";
import indexRouter from "./routes/index.js";
import signupRouter from "./routes/signup.js";
import loginRouter from "./routes/login.js";
import dotenv from "dotenv";
import stripePackage from "stripe";

const app = express();

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

const stripePublicKey = process.env.STRIPE_PUBLIC_KEY;

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

app.set("views", "views");
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
const upload = multer();
app.use(upload.single("profileImage"));

app.use("/", indexRouter);
app.use("/signup", signupRouter);
app.use("/login", loginRouter);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
