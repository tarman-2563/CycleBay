import React from 'react';

const ConversationList = ({ conversations, selectedConversation, onConversationSelect }) => {
  const formatTime = (date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInHours = (now - messageDate) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) {
      return messageDate.toLocaleDateString([], { weekday: 'short' });
    } else {
      return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getCurrentUser = () => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  };

  const getOtherUser = (conversation) => {
    const currentUser = getCurrentUser();
    if (!currentUser) return null;

    return conversation.buyerId._id === currentUser.userId 
      ? conversation.sellerId 
      : conversation.buyerId;
  };

  const getLastMessagePreview = (message) => {
    if (!message) return 'No messages yet';
    
    if (message.messageType === 'offer') {
      return `Offer: ₹${message.offerAmount}`;
    } else if (message.messageType === 'counter-offer') {
      return `Counter offer: ₹${message.offerAmount}`;
    } else if (message.messageType === 'system') {
      return message.content;
    } else {
      return message.content.length > 50 
        ? message.content.substring(0, 50) + '...' 
        : message.content;
    }
  };

  if (conversations.length === 0) {
    return (
      <div className="conversations-list">
        <div className="conversations-header">
          <h3>Messages</h3>
        </div>
        <div className="no-conversations">
          <p>No conversations yet</p>
          <p>Start browsing products to begin messaging sellers!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="conversations-list">
      <div className="conversations-header">
        <h3>Messages</h3>
      </div>
      <div className="conversations-items">
        {conversations.map((conversation) => {
          const otherUser = getOtherUser(conversation);
          const isSelected = selectedConversation?._id === conversation._id;
          
          return (
            <div
              key={conversation._id}
              className={`conversation-item ${isSelected ? 'selected' : ''}`}
              onClick={() => onConversationSelect(conversation)}
            >
              <div className="conversation-avatar">
                <img 
                  src={`https://cyclebay-backend.onrender.com/uploads/${conversation.productId.image}`}
                  alt={conversation.productId.name}
                  className="product-image"
                />
              </div>
              <div className="conversation-details">
                <div className="conversation-header">
                  <h4 className="other-user-name">
                    {otherUser ? otherUser.name : 'Unknown User'}
                  </h4>
                  <span className="conversation-time">
                    {formatTime(conversation.lastActivity)}
                  </span>
                </div>
                <div className="product-name">
                  {conversation.productId.name}
                </div>
                <div className="last-message">
                  {getLastMessagePreview(conversation.lastMessage)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ConversationList;