const { pgEnum } = require("drizzle-orm/pg-core");

const userRole = pgEnum("user_role", [
  "buyer",
  "seller",
  "admin",
]);

const kycStatus = pgEnum("kyc_status", [
  "pending",
  "approved",
  "rejected",
]);

const orderStatus = pgEnum("order_status", [
  "pending",
  "confirmed",
  "processing",
  "completed",
  "cancelled",
]);

const fulfillmentStatus = pgEnum("fulfillment_status", [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "returned",
]);

const paymentStatus = pgEnum("payment_status", [
  "pending",
  "paid",
  "failed",
  "refunded",
  "partially_refunded",
]);

const paymentProvider = pgEnum("payment_provider", [
  "paymob",
]);

module.exports = {
  userRole,
  kycStatus,
  orderStatus,
  fulfillmentStatus,
  paymentStatus,
  paymentProvider,
};