import express from "express";
import bodyParser from "body-parser";
import { ref, set, push, get } from "firebase/database";
import { database, auth } from "./firebase.js"; // Add this line to import 'auth'
import multer from "multer";
import fs from "fs";
import { update } from "firebase/database";
import { ref as cartRef, push as pushToCart } from "firebase/database";
import stripePackage from "stripe";
import { stripe } from "./stripeHelpers.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from "firebase/auth";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/images/profile"); // Specify the destination folder
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix); // Create a unique filename
  },
});

const upload = multer({ dest: "./public/images/profile" });

const urlencodedParser = bodyParser.urlencoded({ extended: true });
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    // Check if the user is authenticated
    const user = auth.currentUser;
    res.render("index", { title: "express", user: user || null });
  } catch (error) {
    console.error("Error checking authentication:", error);
    res.render("index", { title: "express", user: null });
  }
});

router.get("/signup", (req, res) => {
  res.render("signup", { title: "Signup" });
});

router.get("/login", (req, res) => {
  res.render("login", { title: "Login" });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Check if the user is authenticated before redirecting
    if (userCredential.user) {
      res.redirect(`/user/${userCredential.user.uid}`);
    } else {
      console.error("User not found");
      res.render("login", { title: "Login", error: "User not found" });
    }
  } catch (error) {
    console.error("Error signing in:", error.message);
    res.render("login", { title: "Login", error: error.message });
  }
});

router.get("/logout", (req, res) => {
  signOut(auth)
    .then(() => {
      res.redirect("/");
    })
    .catch((error) => {
      console.error("Error signing out:", error);
      res.status(500).send("Error signing out");
    });
});

router.get("/products", urlencodedParser, (req, res) => {
  res.render("products", { title: "Products" });
});

router.post("/products", async (req, res) => {
  try {
    console.log(req.body);
    const newProductRef = push(ref(database, "products"));

    await set(newProductRef, {
      info: req.body,
    });

    console.log("Data successfully written to the database");
    res.redirect("/productLists");
  } catch (error) {
    console.error("Error writing to the database:", error);
    res.status(500).send("Error writing to the database");
  }
});

router.get("/productLists", async (req, res) => {
  try {
    // Check if the user is authenticated
    const user = auth.currentUser;

    const productsRef = ref(database, "products");
    const productsSnapshot = await get(productsRef);

    if (productsSnapshot.exists()) {
      const productsData = productsSnapshot.val();
      const productList = Object.entries(productsData).map(([id, data]) => ({
        id,
        ...data,
      }));
      res.render("productLists", {
        title: "Product Lists",
        productList,
        user: user || null,
      });
    } else {
      res.render("productLists", {
        title: "Product Lists",
        productList: [],
        user: user || null,
      });
    }
  } catch (error) {
    console.error("Error fetching product data:", error);
    res.status(500).send("Error fetching product data");
  }
});

router.get("/product/:id", async (req, res) => {
  try {
    const productId = req.params.id;
    const productRef = ref(database, `products/${productId}`);
    const productSnapshot = await get(productRef);

    // Check if the user is authenticated
    const user = auth.currentUser;

    if (productSnapshot.exists()) {
      const productData = productSnapshot.val();

      // Add this line to log product ID
      console.log("Product ID in /product/:id route:", productId);

      res.render("productDetails", {
        title: "Product Details",
        product: {
          id: productId,
          info: productData.info,
        },
        user: user || null,
      });
    } else {
      res.status(404).send("Product not found");
    }
  } catch (error) {
    console.error("Error fetching product details:", error);
    res.status(500).send("Error fetching product details");
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

    res.render("login", {
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

router.get("/user/:uid", async (req, res) => {
  const userId = req.params.uid;
  try {
    const userProfileRef = ref(database, `users/${userId}`);
    const userProfileSnapshot = await get(userProfileRef);
    if (userProfileSnapshot.exists()) {
      const userProfileData = userProfileSnapshot.val();
      res.render("userProfile", {
        title: "User Profile",
        user: userProfileData,
      });
    } else {
      res.status(404).send("User not found");
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).send("Error fetching user profile");
  }
});

router.post("/addToCart", async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    // Get the current user
    const user = auth.currentUser;

    // Check if the user is authenticated
    if (!user) {
      return res.status(401).send("Unauthorized");
    }

    // Reference to the user's cart in the database
    const userCartRef = cartRef(database, `carts/${user.uid}`);

    // Fetch product details based on productId
    const productRef = ref(database, `products/${productId}`);
    const productSnapshot = await get(productRef);

    if (!productSnapshot.exists()) {
      return res.status(404).send("Product not found");
    }

    const productData = productSnapshot.val();

    // Check if productData.info exists before accessing its properties
    if (productData.info) {
      // Push the selected product to the user's cart
      const newCartItemRef = pushToCart(userCartRef);
      await set(newCartItemRef, {
        productId,
        productName: productData.info.name || "Product Name Not Available",
        quantity: parseInt(quantity),
        imageUrl: productData.info.imageUrl || "Image URL Not Available",
        price: productData.info.price || 0,
      });

      console.log("Product added to cart successfully");
      res.redirect("/cart"); // Redirect to the cart page or any other desired page
    } else {
      console.error("Product details not found");
      res.status(500).send("Product details not found");
    }
  } catch (error) {
    console.error("Error adding product to cart:", error);
    res.status(500).send("Error adding product to cart");
  }
});

router.get("/cart", async (req, res) => {
  try {
    // Get the current user
    const user = auth.currentUser;

    // Check if the user is authenticated
    if (!user) {
      return res.status(401).send("Unauthorized");
    }

    // Reference to the user's cart in the database
    const userCartRef = cartRef(database, `carts/${user.uid}`);
    const userCartSnapshot = await get(userCartRef);

    if (userCartSnapshot.exists()) {
      const userCartData = userCartSnapshot.val();
      const cartItems = Object.entries(userCartData).map(([id, data]) => ({
        id,
        ...data,
      }));
      res.render("cart", {
        title: "Shopping Cart",
        cartItems,
        user,
      });
    } else {
      res.render("cart", {
        title: "Shopping Cart",
        cartItems: [],
        user,
      });
    }
  } catch (error) {
    console.error("Error fetching user's cart:", error);
    res.status(500).send("Error fetching user's cart");
  }
});

router.post("/deleteFromCart", async (req, res) => {
  try {
    const { itemId } = req.body;

    // Get the current user
    const user = auth.currentUser;

    // Check if the user is authenticated
    if (!user) {
      return res.status(401).send("Unauthorized");
    }

    // Reference to the user's cart in the database
    const userCartRef = cartRef(database, `carts/${user.uid}/${itemId}`);

    // Remove the item from the user's cart
    await set(userCartRef, null);

    console.log("Product deleted from cart successfully");
    res.redirect("/cart"); // Redirect to the cart page or any other desired page
  } catch (error) {
    console.error("Error deleting product from cart:", error);
    res.status(500).send("Error deleting product from cart");
  }
});

router.post("/charge", async (req, res) => {
  try {
    const { amount, currency, source, description } = req.body;

    // Create a charge using Stripe
    const charge = await stripe.charges.create({
      amount,
      currency,
      source, // Ensure that 'source' is provided here
      description,
    });

    // Handle successful payment
    // Redirect or send a success message as per your requirement
    res.send("Payment successful");
  } catch (error) {
    console.error("Error processing payment:", error);
    res.status(500).send("Error processing payment");
  }
});

export default router;
