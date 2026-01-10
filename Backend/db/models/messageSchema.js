import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Conversation",
    required: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true
  },
  messageType: {
    type: String,
    enum: ["text", "offer", "counter-offer", "image", "system"],
    default: "text"
  },
  content: {
    type: String,
    required: true
  },
  offerAmount: {
    type: Number,
    required: function() {
      return this.messageType === "offer" || this.messageType === "counter-offer";
    }
  },
  offerStatus: {
    type: String,
    enum: ["pending", "accepted", "rejected", "expired"],
    default: function() {
      return (this.messageType === "offer" || this.messageType === "counter-offer") ? "pending" : undefined;
    }
  },
  attachments: [{
    type: String // file paths for images
  }],
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1 });
messageSchema.index({ receiverId: 1, isRead: 1 });

export const Message = mongoose.model("Message", messageSchema);