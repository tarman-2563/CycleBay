import React, { useState, useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';

const ChatWindow = ({ conversation, onNewMessage }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isOffer, setIsOffer] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const getCurrentUser = () => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  };

  const getOtherUser = () => {
    const currentUser = getCurrentUser();
    if (!currentUser) return null;

    return conversation.buyerId._id === currentUser.userId 
      ? conversation.sellerId 
      : conversation.buyerId;
  };

  useEffect(() => {
    if (conversation) {
      fetchMessages();
      markAsRead();
    }
  }, [conversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `https://cyclebay-backend.onrender.com/message/conversation/${conversation._id}/messages`,
        {
          headers: {
            'x-access-token': token
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const data = await response.json();
      if (data.success) {
        setMessages(data.data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch(
        `https://cyclebay-backend.onrender.com/message/conversation/${conversation._id}/read`,
        {
          method: 'PUT',
          headers: {
            'x-access-token': token
          }
        }
      );
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    
    if ((!newMessage.trim() && !isOffer) || (isOffer && !offerAmount)) {
      return;
    }

    setSending(true);

    try {
      const token = localStorage.getItem('token');
      const messageData = {
        conversationId: conversation._id,
        content: isOffer ? `Offer: ₹${offerAmount}` : newMessage,
        messageType: isOffer ? 'offer' : 'text',
        offerAmount: isOffer ? parseFloat(offerAmount) : undefined
      };

      const response = await fetch('https://cyclebay-backend.onrender.com/message/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': token
        },
        body: JSON.stringify(messageData)
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      if (data.success) {
        setMessages(prev => [...prev, data.data]);
        setNewMessage('');
        setOfferAmount('');
        setIsOffer(false);
        onNewMessage(data.data);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleOfferResponse = async (messageId, response) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `https://cyclebay-backend.onrender.com/message/offer/${messageId}/respond`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-access-token': token
          },
          body: JSON.stringify({ response })
        }
      );

      if (!res.ok) {
        throw new Error('Failed to respond to offer');
      }

      const data = await res.json();
      if (data.success) {
        setMessages(prev => 
          prev.map(msg => 
            msg._id === messageId 
              ? { ...msg, offerStatus: response }
              : msg
          )
        );
        
        if (data.data.systemMessage) {
          setMessages(prev => [...prev, data.data.systemMessage]);
        }
      }
    } catch (error) {
      console.error('Error responding to offer:', error);
      alert('Failed to respond to offer. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="chat-window">
        <div className="chat-loading">Loading messages...</div>
      </div>
    );
  }

  const otherUser = getOtherUser();

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="chat-user-info">
          <img 
            src={`https://cyclebay-backend.onrender.com/uploads/${conversation.productId.image}`}
            alt={conversation.productId.name}
            className="product-image-small"
          />
          <div>
            <h4>{otherUser ? otherUser.name : 'Unknown User'}</h4>
            <p className="product-name">{conversation.productId.name} - ₹{conversation.productId.price}</p>
          </div>
        </div>
      </div>

      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="no-messages">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message._id}
              message={message}
              isOwn={message.senderId._id === getCurrentUser()?.userId}
              onOfferResponse={handleOfferResponse}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="message-input-container">
        <div className="offer-toggle">
          <label>
            <input
              type="checkbox"
              checked={isOffer}
              onChange={(e) => setIsOffer(e.target.checked)}
            />
            Make an offer
          </label>
        </div>

        <form onSubmit={sendMessage} className="message-form">
          <div className="input-row">
            {isOffer ? (
              <input
                type="number"
                value={offerAmount}
                onChange={(e) => setOfferAmount(e.target.value)}
                placeholder="Enter offer amount"
                className="offer-input"
                min="1"
                required
              />
            ) : (
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="message-input"
                required
              />
            )}
            <button 
              type="submit" 
              disabled={sending}
              className="send-button"
            >
              {sending ? 'Sending...' : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;