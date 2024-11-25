// login.js
import express from "express";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase.js";

const router = express.Router();

router.get("/login", (req, res) => {
  res.render("login", { title: "Login" });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const authInstance = getAuth(); // Get auth instance
    const userCredential = await signInWithEmailAndPassword(
      authInstance,
      email,
      password
    );
    res.redirect(`/user/${userCredential.user.uid}`);
  } catch (error) {
    console.error("Error signing in:", error.message);
    res.render("login", { title: "Login", error: error.message });
  }
});

router.get("/forgot-password", (req, res) => {
  res.render("forgot-password", { title: "Forgot Password" });
});

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const authInstance = getAuth();
    // Implement the logic to send a password reset email
    // Example:
    await sendPasswordResetEmail(authInstance, email);

    res.render("forgot-password", {
      title: "Forgot Password",
      message: "Password reset email sent. Check your inbox.",
    });
  } catch (error) {
    console.error("Error sending password reset email:", error.message);
    res.render("forgot-password", {
      title: "Forgot Password",
      error: "Error sending password reset email.",
    });
  }
});

export default router;
