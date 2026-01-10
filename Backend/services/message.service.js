import { Message } from "../db/models/messageSchema.js";
import { Conversation } from "../db/models/conversationSchema.js";
import { Product } from "../db/models/productSchema.js";

export const createConversationService = async (productId, buyerId, sellerId) => {
  try {
    console.log("Creating conversation service called");
    console.log("ProductId:", productId, "BuyerId:", buyerId, "SellerId:", sellerId);
    
    let conversation = await Conversation.findOne({
      productId,
      $or: [
        { buyerId, sellerId },
        { buyerId: sellerId, sellerId: buyerId }
      ]
    });

    if (conversation) {
      console.log("Conversation already exists:", conversation._id);
      return conversation;
    }

    const product = await Product.findById(productId).populate('createdBy');
    if (!product) {
      throw new Error("Product not found");
    }

    console.log("Product verified, creating new conversation");

    const actualSellerId = product.createdBy._id.toString();
    const actualBuyerId = buyerId;

    conversation = new Conversation({
      productId,
      buyerId: actualBuyerId,
      sellerId: actualSellerId,
      status: "active"
    });
    
    const savedConversation = await conversation.save();
    console.log("New conversation created:", savedConversation._id);

    return savedConversation;
  } catch (error) {
    console.error("Create conversation service error:", error);
    throw error;
  }
};

export const sendMessageService = async (conversationId, senderId, receiverId, messageData) => {
  try {
    const { content, messageType = "text", offerAmount, attachments = [] } = messageData;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    if (conversation.buyerId.toString() !== senderId && conversation.sellerId.toString() !== senderId) {
      throw new Error("Unauthorized to send message in this conversation");
    }

    const message = new Message({
      conversationId,
      productId: conversation.productId,
      senderId,
      receiverId,
      messageType,
      content,
      offerAmount: (messageType === "offer" || messageType === "counter-offer") ? offerAmount : undefined,
      attachments
    });

    await message.save();

    conversation.lastMessage = message._id;
    conversation.lastActivity = new Date();
    await conversation.save();

    await message.populate('senderId', 'name email');
    
    return message;
  } catch (error) {
    throw error;
  }
};

export const getConversationsService = async (userId) => {
  try {
    const conversations = await Conversation.find({
      $or: [
        { buyerId: userId },
        { sellerId: userId }
      ]
    })
    .populate('productId', 'name image price')
    .populate('buyerId', 'name email')
    .populate('sellerId', 'name email')
    .populate('lastMessage')
    .sort({ lastActivity: -1 });

    return conversations;
  } catch (error) {
    throw error;
  }
};

export const getMessagesService = async (conversationId, userId, page = 1, limit = 50) => {
  try {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    if (conversation.buyerId.toString() !== userId && conversation.sellerId.toString() !== userId) {
      throw new Error("Unauthorized to view this conversation");
    }

    const skip = (page - 1) * limit;
    
    const messages = await Message.find({ conversationId })
      .populate('senderId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return messages.reverse();
  } catch (error) {
    throw error;
  }
};

export const markMessagesAsReadService = async (conversationId, userId) => {
  try {
    await Message.updateMany(
      {
        conversationId,
        receiverId: userId,
        isRead: false
      },
      {
        isRead: true,
        readAt: new Date()
      }
    );

    return { success: true };
  } catch (error) {
    throw error;
  }
};

export const respondToOfferService = async (messageId, userId, response) => {
  try {
    const message = await Message.findById(messageId);
    if (!message) {
      throw new Error("Message not found");
    }

    if (message.receiverId.toString() !== userId) {
      throw new Error("Unauthorized to respond to this offer");
    }

    if (message.messageType !== "offer" && message.messageType !== "counter-offer") {
      throw new Error("This message is not an offer");
    }

    if (message.offerStatus !== "pending") {
      throw new Error("This offer has already been responded to");
    }

    message.offerStatus = response;
    await message.save();

    const systemMessage = new Message({
      conversationId: message.conversationId,
      productId: message.productId,
      senderId: userId,
      receiverId: message.senderId,
      messageType: "system",
      content: `Offer of ₹${message.offerAmount} was ${response}`,
    });

    await systemMessage.save();

    return { message, systemMessage };
  } catch (error) {
    throw error;
  }
};

export const getUnreadCountService = async (userId) => {
  try {
    const unreadCount = await Message.countDocuments({
      receiverId: userId,
      isRead: false
    });

    return unreadCount;
  } catch (error) {
    throw error;
  }
};