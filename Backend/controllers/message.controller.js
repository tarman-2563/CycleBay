import {
  createConversationService,
  sendMessageService,
  getConversationsService,
  getMessagesService,
  markMessagesAsReadService,
  respondToOfferService,
  getUnreadCountService
} from "../services/message.service.js";

export const createConversation = async (req, res) => {
  try {
    console.log("Create conversation endpoint hit");
    console.log("Request body:", req.body);
    console.log("User from token:", req.user);
    
    const { productId } = req.body;
    const buyerId = req.user.userId;

    if (!productId) {
      console.log("No productId provided");
      return res.status(400).json({ success: false, message: "Product ID is required" });
    }

    const { Product } = await import("../db/models/productSchema.js");
    const product = await Product.findById(productId).populate('createdBy');
    
    if (!product) {
      console.log("Product not found:", productId);
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    console.log("Product found:", product.name);
    console.log("Product creator:", product.createdBy);

    const sellerId = product.createdBy._id.toString();

    if (buyerId === sellerId) {
      console.log("User trying to message themselves");
      return res.status(400).json({ success: false, message: "Cannot create conversation with yourself" });
    }

    console.log("Creating conversation between buyer:", buyerId, "and seller:", sellerId);

    const conversation = await createConversationService(productId, buyerId, sellerId);
    
    await conversation.populate([
      { path: 'productId', select: 'name image price' },
      { path: 'buyerId', select: 'name email' },
      { path: 'sellerId', select: 'name email' }
    ]);

    console.log("Conversation created successfully:", conversation._id);

    res.status(201).json({
      success: true,
      message: "Conversation created successfully",
      data: conversation
    });
  } catch (error) {
    console.error("Create conversation error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { conversationId, content, messageType, offerAmount } = req.body;
    const senderId = req.user.userId;

    const { Conversation } = await import("../db/models/conversationSchema.js");
    const conversation = await Conversation.findById(conversationId);
    
    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }

    const receiverId = conversation.buyerId.toString() === senderId 
      ? conversation.sellerId.toString() 
      : conversation.buyerId.toString();

    const messageData = {
      content,
      messageType: messageType || "text",
      offerAmount: (messageType === "offer" || messageType === "counter-offer") ? offerAmount : undefined
    };

    const message = await sendMessageService(conversationId, senderId, receiverId, messageData);

    if (req.io) {
      req.io.to(receiverId).emit('newMessage', {
        message,
        conversationId,
        sender: req.user
      });
    }

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: message
    });
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getConversations = async (req, res) => {
  try {
    const userId = req.user.userId;
    const conversations = await getConversationsService(userId);

    res.json({
      success: true,
      data: conversations
    });
  } catch (error) {
    console.error("Get conversations error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const userId = req.user.userId;

    const messages = await getMessagesService(conversationId, userId, parseInt(page), parseInt(limit));

    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.userId;

    await markMessagesAsReadService(conversationId, userId);

    res.json({
      success: true,
      message: "Messages marked as read"
    });
  } catch (error) {
    console.error("Mark as read error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const respondToOffer = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { response } = req.body;
    const userId = req.user.userId;

    if (!["accepted", "rejected"].includes(response)) {
      return res.status(400).json({ success: false, message: "Invalid response. Must be 'accepted' or 'rejected'" });
    }

    const result = await respondToOfferService(messageId, userId, response);

    if (req.io) {
      req.io.to(result.message.senderId.toString()).emit('offerResponse', {
        messageId,
        response,
        offerAmount: result.message.offerAmount
      });
    }

    res.json({
      success: true,
      message: `Offer ${response} successfully`,
      data: result
    });
  } catch (error) {
    console.error("Respond to offer error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.userId;
    const count = await getUnreadCountService(userId);

    res.json({
      success: true,
      data: { unreadCount: count }
    });
  } catch (error) {
    console.error("Get unread count error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};