import stripePackage from "stripe";
import dotenv from "dotenv";

dotenv.config();

const stripe = stripePackage(
  "sk_test_51OeSrvGkQFAHAkrXE4F6pGRswYoanhLF9Lc0wX3z9ra8ZF7FSpk83WYdiXZtxOcZFW3mNUqK8hbdNGBrEaBKwfqX0017PgE46i"
);

export { stripe };
