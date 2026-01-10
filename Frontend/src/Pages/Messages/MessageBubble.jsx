import React from 'react';

const MessageBubble = ({ message, isOwn, onOfferResponse }) => {
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const renderOfferActions = () => {
    if (message.messageType !== 'offer' && message.messageType !== 'counter-offer') {
      return null;
    }

    if (isOwn) {
      return (
        <div className="offer-status">
          Status: <span className={`status-${message.offerStatus}`}>
            {message.offerStatus}
          </span>
        </div>
      );
    }

    if (message.offerStatus === 'pending') {
      return (
        <div className="offer-actions">
          <button 
            className="accept-btn"
            onClick={() => onOfferResponse(message._id, 'accepted')}
          >
            Accept
          </button>
          <button 
            className="reject-btn"
            onClick={() => onOfferResponse(message._id, 'rejected')}
          >
            Reject
          </button>
        </div>
      );
    }

    return (
      <div className="offer-status">
        <span className={`status-${message.offerStatus}`}>
          {message.offerStatus}
        </span>
      </div>
    );
  };

  const getMessageContent = () => {
    if (message.messageType === 'offer') {
      return (
        <div className="offer-message">
          <div className="offer-amount">₹{message.offerAmount}</div>
          <div className="offer-label">Offer</div>
        </div>
      );
    } else if (message.messageType === 'counter-offer') {
      return (
        <div className="offer-message counter-offer">
          <div className="offer-amount">₹{message.offerAmount}</div>
          <div className="offer-label">Counter Offer</div>
        </div>
      );
    } else if (message.messageType === 'system') {
      return (
        <div className="system-message">
          {message.content}
        </div>
      );
    } else {
      return message.content;
    }
  };

  if (message.messageType === 'system') {
    return (
      <div className="message-bubble system-message-bubble">
        <div className="system-content">
          {message.content}
        </div>
        <div className="message-time">
          {formatTime(message.createdAt)}
        </div>
      </div>
    );
  }

  return (
    <div className={`message-bubble ${isOwn ? 'own' : 'other'}`}>
      <div className="message-content">
        {getMessageContent()}
        {renderOfferActions()}
      </div>
      <div className="message-info">
        <span className="message-time">
          {formatTime(message.createdAt)}
        </span>
        {isOwn && message.isRead && (
          <span className="read-indicator">✓✓</span>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;