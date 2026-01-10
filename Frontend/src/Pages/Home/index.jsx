import React, { useEffect, useState, useCallback } from 'react';
import NavBar from '../../Components/NavBar';
import './home.css';
import { useNavigate } from 'react-router-dom';

function Home() {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [sortBy, setSortBy] = useState("");

    const debounce = (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    };

    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (selectedCategory !== "All") params.append("category", selectedCategory);
            if (minPrice) params.append("minPrice", minPrice);
            if (maxPrice) params.append("maxPrice", maxPrice);
            if (sortBy) {
                const [field, order] = sortBy.split("-");
                params.append("sortBy", field);
                params.append("sortOrder", order === "asc" ? "1" : "-1");
            }
            if (searchTerm) params.append("search", searchTerm);

            const response = await fetch(`https://cyclebay-backend.onrender.com/product?${params.toString()}`);
            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }
            const result = await response.json();

            const userData = JSON.parse(localStorage.getItem('user') || '{}');
            const updatedProducts = (result.data || result).map(product => ({
                ...product,
                isLiked: product.likedBy?.includes(userData.userId) || false,
            }));
            setProducts(updatedProducts);
            setError(null);

        } catch (err) {
            console.error("Error fetching products:", err);
            setError("Something went wrong while fetching products.");
        } finally {
            setLoading(false);
        }
    }, [selectedCategory, minPrice, maxPrice, sortBy, searchTerm]);

    const debouncedFetchProducts = useCallback(
        debounce(fetchProducts, 500),
        [fetchProducts]
    );

    useEffect(() => {
        if (searchTerm) {
            debouncedFetchProducts();
        } else {
            fetchProducts();
        }
    }, [selectedCategory, minPrice, maxPrice, sortBy, searchTerm, fetchProducts, debouncedFetchProducts]);

    const categories = [
        "All",
        "Electronics",
        "Mobile Phones",
        "Clothes",
        "Footwear",
        "Accessories",
        "Books",
        "Beauty Products",
        "Sports"
    ];

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(price);
    };

    const handleLikeClick = async (index, productId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/signin');
                return;
            }

            const product = products[index];
            const isLiked = product.isLiked;
            const endpoint = isLiked ? 'unlike' : 'like';
            
            const response = await fetch(`https://cyclebay-backend.onrender.com/product/${endpoint}/${productId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-token': token
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    navigate('/signin');
                    return;
                }
                throw new Error('Failed to update like status');
            }

            const data = await response.json();
            if (data.success) {
                setProducts(prevProducts => 
                    prevProducts.map((p, i) =>
                        i === index ? { ...p, isLiked: !p.isLiked } : p
                    )
                );
            } else {
                throw new Error(data.message || 'Failed to update like status');
            }
        } catch (error) {
            console.error('Error updating like status:', error);
            alert(error.message || 'Failed to update like status. Please try again.');
        }
    };
    
    const productClick=(prductId)=>{
        navigate(`/product/${prductId}`);
    }

    return (
        <div className="home-page">
            <NavBar />
            <div className="Products-container">
                <div className="home-nav">
                    <div className="search-section">
                        <div className="search-bar">
                            <input type="text" placeholder="Search products..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}/>
                        </div>
                        <select className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                            <option value="">Sort By</option>
                            <option value="price-asc">Price: Low to High</option>
                            <option value="price-desc">Price: High to Low</option>
                            <option value="createdAt-desc">Newest</option>
                            <option value="createdAt-asc">Oldest</option>
                        </select>
                    </div>
                    <div className="categories">
                        {categories.map((category, index) => (
                            <button 
                                key={index} 
                                className={`category-button ${selectedCategory === category ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(category)}
                            >
                                {category}
                            </button>
                        ))}
                        <input
                            type="number"
                            placeholder="min price" 
                            className="min-price-input"
                            value={minPrice} 
                            onChange={(e) => setMinPrice(e.target.value)}/>
                        <input
                            type="number"
                            placeholder="max price" 
                            className="max-price-input"
                            value={maxPrice} 
                            onChange={(e) => setMaxPrice(e.target.value)}
                            />
                    </div>
                </div>

                <div className="Products-Grid">
                    {loading ? (
                        <div className="loading-container">
                            <div className="loading-spinner"></div>
                            <p>Loading products...</p>
                        </div>
                    ) : error ? (
                        <div className="error-container">
                            <p className="error-message">{error}</p>
                            <button onClick={fetchProducts} className="retry-button">
                                Try Again
                            </button>
                        </div>
                    ) : products.length > 0 ? (
                        products.map((product, index) => (
                            <div key={product._id || index} className="Products-Card"
                              onClick={()=>productClick(product._id)}>
                                <img 
                                    src={`https://cyclebay-backend.onrender.com/uploads/${product.image}`}
                                    alt={product.name}
                                    loading="lazy"
                                />
                                <h3>{product.name}</h3>
                                <p className="description">{product.desc}</p>
                                <button 
                                    className="likeIcon" 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleLikeClick(index, product._id);
                                    }}
                                >
                                    <img 
                                        src={product.isLiked 
                                            ? "https://cdn-icons-png.flaticon.com/128/2589/2589175.png"
                                            : "https://cdn-icons-png.flaticon.com/128/2589/2589197.png"
                                        }
                                        alt="Like"
                                        style={{ width: '100%', height: '100%' }}
                                        loading="lazy"
                                    />
                                </button>
                                <h3 className="price">{formatPrice(product.price)}</h3>
                            </div>
                        ))
                    ) : (
                        <div className="no-products">
                            <p>No products found matching your criteria.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Home;
