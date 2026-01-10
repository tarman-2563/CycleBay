import React, {useEffect, useState} from 'react'
import NavBar from '../../Components/NavBar'
import {useParams, useNavigate} from 'react-router-dom'
import './productDetail.css'

function ProductDetail() {
  const {id} = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await fetch(`https://cyclebay-backend.onrender.com/product/${id}`)
        if(!response.ok)throw new Error("Failed to fetch product details")
        const result = await response.json()

        if(result.success){
          setProduct(result.data)
        }
        else{
          throw new Error(result.message || "Failed to fetch product details")
        }
      }
      catch(err){
        setError(err.message)
        console.error("Error fetching product details:", err)
      }
      finally{
        setLoading(false)
      }
    }
    fetchProductDetails()
  }, [id])

  const handleStartConversation = async () => {
    console.log("Start conversation clicked");
    
    const token = localStorage.getItem('token');
    if (!token) {
      console.log("No token found, redirecting to signin");
      navigate('/signin');
      return;
    }

    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    console.log("User data:", userData);
    console.log("Product creator:", product.createdBy);
    
    if (userData.userId === product.createdBy._id) {
      alert("You cannot start a conversation with yourself!");
      return;
    }

    const button = document.querySelector('.start-conversation-btn');
    const originalText = button.textContent;
    button.textContent = 'Starting...';
    button.disabled = true;

    try {
      console.log("Sending request to create conversation...");
      console.log("Product ID:", product._id);
      
      const response = await fetch('https://cyclebay-backend.onrender.com/message/conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': token
        },
        body: JSON.stringify({ productId: product._id })
      });

      console.log("Response status:", response.status);
      
      if (!response.ok) {
        if (response.status === 404) {
          alert("The messaging feature is currently being deployed. Please try again in a few minutes, or contact the seller via the old email system for now.");
          return;
        } else if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/signin');
          return;
        } else if (response.status === 500) {
          throw new Error("Server error. Please try again later.");
        } else {
          throw new Error(`Request failed with status ${response.status}`);
        }
      }
      
      const result = await response.json();
      console.log("Response data:", result);
      
      if (result.success) {
        console.log("Conversation created successfully, navigating to messages");
        navigate('/messages');
      } else {
        throw new Error(result.message || "Failed to create conversation");
      }
    } catch (err) {
      console.error("Error starting conversation:", err);
      
      if (err.message.includes('fetch') || err.name === 'TypeError') {
        alert("The messaging feature is currently being set up. Please try again in a few minutes!");
      } else {
        alert("Error: " + err.message);
      }
    } finally {
      button.textContent = originalText;
      button.disabled = false;
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price)
  }

  if(loading)return (
    <>
      <NavBar />
      <div className="product-container">
        <p>Loading product details...</p>
      </div>
    </>
  )

  if(error)return (
    <>
      <NavBar />
      <div className="product-container">
        <p>Error: {error}</p>
      </div>
    </>
  )

  if(!product)return (
    <>
      <NavBar /> 
      <div className="product-container">
        <p>Product not found</p>
      </div>
    </>
  )

  return (
    <>
      <NavBar />
      <div className="product-container">
        <div className="content-wrapper">
          <div className="image-wrapper">
            <img src={`https://cyclebay-backend.onrender.com/uploads/${product.image}`} alt={product.name} className="product-image" />
          </div>

          <div className="info-box">
            <h1 className="product-title">{product.name}</h1>
            <h2 className="product-price">{formatPrice(product.price)}</h2>

            <div className="product-description">
              <div className="overview-header">
                <h3>Overview</h3>
                <div className="price-action-section">
                  <h2 className="overview-price">{formatPrice(product.price)}</h2>
                  <button className="start-conversation-btn" onClick={handleStartConversation}>
                    Start Conversation
                  </button>
                </div>
              </div> 
              <div className="description-details">
                <div className="description-text">
                  <p>{product.desc}</p>
                </div>
                <div className="overview-list">
                  {Object.entries(product.description || {}).map(([key, value]) => (
                    <div key={key} className="description-item">
                      <span className="description-label">{key}</span>
                      <span className="description-value">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="seller-info-section">
              <div className="seller-header">
                <h3>Seller Information</h3>
              </div>
              <div className="seller-details">
                <div className="seller-info">
                  <div className="info-item">
                    <span className="info-label">Posted by:</span>
                    <span className="info-value">{product.createdBy?.name || 'Anonymous'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Posted on:</span>
                    <span className="info-value">{new Date(product.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ProductDetail
