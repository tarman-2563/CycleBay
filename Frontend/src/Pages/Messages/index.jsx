import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../../Components/NavBar';
import ConversationList from './ConversationList';
import ChatWindow from './ChatWindow';
import './messages.css';

const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/signin');
      return;
    }

    fetchConversations();
  }, [navigate]);

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://cyclebay-backend.onrender.com/message/conversations', {
        headers: {
          'x-access-token': token
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }

      const data = await response.json();
      if (data.success) {
        setConversations(data.data);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setError('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const handleConversationSelect = (conversation) => {
    setSelectedConversation(conversation);
  };

  const handleNewMessage = (message) => {
    setConversations(prev => 
      prev.map(conv => 
        conv._id === message.conversationId 
          ? { ...conv, lastMessage: message, lastActivity: new Date() }
          : conv
      )
    );
  };

  if (loading) {
    return (
      <div className="messages-page">
        <NavBar />
        <div className="messages-container">
          <div className="loading">Loading conversations...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="messages-page">
      <NavBar />
      <div className="messages-container">
        <div className="messages-layout">
          <div className="conversations-sidebar">
            <ConversationList 
              conversations={conversations}
              selectedConversation={selectedConversation}
              onConversationSelect={handleConversationSelect}
            />
          </div>
          <div className="chat-main">
            {selectedConversation ? (
              <ChatWindow 
                conversation={selectedConversation}
                onNewMessage={handleNewMessage}
              />
            ) : (
              <div className="no-conversation-selected">
                <h3>Select a conversation to start messaging</h3>
                <p>Choose a conversation from the left to view messages</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;