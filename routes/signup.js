// signup.js
import express from "express";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, ref, set, database } from "./firebase.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Save additional user data to the Firebase Realtime Database
    const userId = userCredential.user.uid;
    await set(ref(database, `users/${userId}`), {
      username,
      email,
    });

    // Redirect to login page or any other page after successful signup
    res.redirect("/login");
  } catch (error) {
    console.error("Error creating user:", error);
    // Handle the error appropriately, e.g., display an error message to the user
    res.status(500).send("Error creating user");
  }
});

export default router;
