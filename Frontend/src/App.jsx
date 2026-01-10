import React from 'react';
import './App.css'
import './styles/global.css'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Home from './Pages/Home'
import SignIn from './Pages/Auth/signin'
import SignUp from './Pages/Auth/signup'
import LikedProducts from './Pages/Liked/index.jsx'
import Profile from './Pages/Profile'
import About from './Pages/About'
import Sell from './Pages/Sell'
import ProductDetail from './Pages/ProductDetail'
import PostAd from './Pages/PostAd'
import Messages from './Pages/Messages'
import 'bootstrap/dist/css/bootstrap.min.css';
import ManageProducts from './Pages/ManageProducts'
import { ThemeProvider } from './context/ThemeContext'
import Footer from './Components/Footer'

function AppContent() {
  const location = useLocation();
  const hideFooterPaths = ['/signin', '/signup'];
  const shouldShowFooter = !hideFooterPaths.includes(location.pathname);

  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/profile" element={<Profile />} /> 
        <Route path="/about" element={<About />} />
        <Route path="/sell" element={<Sell/>} />
        <Route path="/likedProducts" element={<LikedProducts/>} />
        <Route path="/messages" element={<Messages/>} />
        <Route path="/product/:id" element={<ProductDetail/>}/>
        <Route path="/post-ad" element={<PostAd/>} />
        <Route path="/manage-products" element={<ManageProducts/>} />
      </Routes>
      {shouldShowFooter && <Footer />}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
