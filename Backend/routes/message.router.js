import express from "express";
import {
  createConversation,
  sendMessage,
  getConversations,
  getMessages,
  markAsRead,
  respondToOffer,
  getUnreadCount
} from "../controllers/message.controller.js";
import { isAuth } from "../middlewares/authenticate.js";

const router = express.Router();

router.get("/test", (req, res) => {
  res.json({ success: true, message: "Message routes are working" });
});

router.use(isAuth);

router.post("/conversation", createConversation);

router.post("/send", sendMessage);

router.get("/conversations", getConversations);

router.get("/conversation/:conversationId/messages", getMessages);

router.put("/conversation/:conversationId/read", markAsRead);

router.put("/offer/:messageId/respond", respondToOffer);

router.get("/unread-count", getUnreadCount);

export default router;