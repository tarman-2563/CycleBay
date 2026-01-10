import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true
  },
  status: {
    type: String,
    enum: ["active", "closed", "completed"],
    default: "active"
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Message"
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
conversationSchema.index({ productId: 1, buyerId: 1, sellerId: 1 });
conversationSchema.index({ buyerId: 1 });
conversationSchema.index({ sellerId: 1 });

export const Conversation = mongoose.model("Conversation", conversationSchema);