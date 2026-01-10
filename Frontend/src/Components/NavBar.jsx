import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './NavBar.css';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import { useTheme } from '../context/ThemeContext';

function NavBar() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const [userName, setUserName] = useState('');
    const navigate = useNavigate();
    const { isDarkMode, toggleTheme } = useTheme();

    const checkAuth = () => {
        const token = localStorage.getItem('token');
        
        if (!token) {
            setIsLoggedIn(false);
            setUserEmail('');
            setUserName('');
            return;
        }
        
        setIsLoggedIn(true);
        try {
            const tokenParts = token.split('.');
            if (tokenParts.length === 3) {
                const payload = JSON.parse(atob(tokenParts[1]));
                console.log('Token payload:', payload);
                setUserName(payload.name || '');
                setUserEmail(payload.email || '');
            }
        } catch (error) {
            console.error('Error parsing token:', error);
            setUserEmail('');
            setUserName('');
        }
    };

    useEffect(() => {
        checkAuth();
        window.addEventListener('storage', checkAuth);
        window.addEventListener('authStateChange', checkAuth);
        
        return () => {
            window.removeEventListener('storage', checkAuth);
            window.removeEventListener('authStateChange', checkAuth);
        };
    }, []);

    const handleLogout = () => {
        alert("Are you sure to logout?")
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsLoggedIn(false);
        setUserEmail('');
        setUserName('');
        window.dispatchEvent(new Event('authStateChange'));
        navigate('/');
    };

    const handleNavigation = (path) => {
        if (!isLoggedIn && (path === '/profile' || path === '/sell' || path === '/messages')) {
            alert('Please login to access this feature');
            navigate('/signin');
            return;
        }
        navigate(path);
    };

    return (
        <header>
            <div className="navbar">
                <nav>
                    <ul className="nav-left">
                        <li className="logo-container">
                            <Link to="/">
                                <img src="https://cdn-icons-png.flaticon.com/128/8787/8787157.png" alt="CycleBay Logo" className="nav-logo" />
                            </Link>
                        </li>
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/about">About</Link></li>
                        <li>
                            <span 
                                onClick={() => handleNavigation('/sell')}>
                                Sell
                            </span>
                        </li>
                    </ul>
                    <div className="nav-right">
                        <button 
                            className="theme-toggle" 
                            onClick={toggleTheme}
                            aria-label="Toggle theme"
                        >
                            <img 
                                src="https://cdn-icons-png.flaticon.com/128/5261/5261287.png"
                                alt="Theme Toggle"
                            />
                        </button>
                        {isLoggedIn ? (
                            <>
                                <li>
                                    <span 
                                        onClick={() => handleNavigation('/messages')}>
                                        <img className="messagesIcon" src="https://cdn-icons-png.flaticon.com/128/1380/1380338.png" alt="Messages"></img>
                                    </span>
                                </li>
                                <li>
                                    <span 
                                        onClick={() => handleNavigation('/likedProducts')}>
                                        <img className="likedIcon" src="https://cdn-icons-png.flaticon.com/128/5735/5735325.png" alt="Liked Products"></img>
                                    </span>
                                </li>
                                <DropdownButton 
                                    id="dropdown-basic-button" 
                                    title={
                                        <>
                                            <div className="nav-avatar">
                                                {userName ? userName.charAt(0).toUpperCase() : '?'}
                                            </div>
                                        </>
                                    }
                                >
                                    <Dropdown.Item onClick={() => handleNavigation('/profile')}>Your Profile</Dropdown.Item>
                                    <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
                                </DropdownButton>
                                <span className="user-email">{userEmail}</span>
                            </>
                        ) : (
                            <Link to="/signin" className="nav-button">Login</Link>
                        )}
                    </div>
                </nav>
            </div>
        </header>
    );
}

export default NavBar;