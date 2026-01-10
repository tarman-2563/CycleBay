# CycleBay - Product Requirements Document (PRD)

## 1. Executive Summary

### 1.1 Product Overview
CycleBay is a MERN stack-powered circular economy marketplace that promotes sustainability through peer-to-peer trading of refurbished, second-hand, and upcycled goods. The platform enables users to list, browse, and trade eco-friendly items, encouraging the reuse and recycling of products to build a more sustainable future.

### 1.2 Vision Statement
To create a comprehensive digital marketplace that makes sustainable consumption accessible and convenient, reducing waste through the circular economy model.

### 1.3 Success Metrics
- User engagement and retention
- Number of successful product listings
- Transaction completion rates
- User satisfaction with the platform experience

## 2. Product Architecture

### 2.1 Technology Stack
- **Frontend**: React.js with React Router, Bootstrap for UI components
- **Backend**: Node.js with Express.js framework
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based token system with bcrypt password hashing
- **File Handling**: Multer for image uploads, Cloudinary integration
- **Communication**: Nodemailer for email notifications
- **Real-time**: Socket.io (configured for future enhancements)

### 2.2 System Architecture
```
Frontend (React.js) ↔ REST API (Express.js) ↔ MongoDB Database
                    ↕
            External Services (Email, Image Storage)
```

## 3. Core Features & Functionality

### 3.1 User Management System

#### 3.1.1 User Registration & Authentication
**Feature Description**: Secure user onboarding and authentication system

**Technical Implementation**:
- JWT token-based authentication
- Password encryption using bcrypt
- Form validation with express-validator
- Protected routes for authenticated users

**User Flow**:
1. User accesses signup page
2. Fills registration form (name, email, password, phone)
3. System validates input and creates account
4. User receives authentication token
5. Redirected to dashboard/home page

**Data Model**:
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  phone: Number,
  type: String (default: "user", enum: ["user", "superadmin"]),
  createdAt: Date
}
```

#### 3.1.2 User Profile Management
**Feature Description**: Personal profile management for users

**Functionality**:
- View and edit personal information
- Manage account settings
- View user's product listings
- Access liked products

### 3.2 Product Management System

#### 3.2.1 Product Listing Creation
**Feature Description**: Multi-step form for creating detailed product listings

**Technical Implementation**:
- Dynamic form fields based on product category
- Image upload with file validation
- Category-specific validation schemas
- Real-time form validation

**Supported Categories**:
1. **Electronics**: Warranty, material, weight, dimensions, model, power usage, battery life
2. **Mobile Phones**: Warranty, model, storage, RAM, battery health
3. **Clothes**: Material, size, gender
4. **Footwear**: Material, size, type
5. **Accessories**: Material, type, dimensions
6. **Books**: Author, genre, pages, publisher
7. **Beauty Products**: Expiry date, ingredients, skin type
8. **Sports**: Type, weight, dimensions, material

**Data Model**:
```javascript
{
  name: String (required),
  desc: String (required),
  price: Number (required),
  category: String (enum, required),
  image: String (filename),
  likedBy: [ObjectId] (references to users),
  description: Mixed (category-specific fields),
  createdBy: ObjectId (reference to user),
  createdAt: Date,
  updatedAt: Date
}
```

#### 3.2.2 Product Discovery & Search
**Feature Description**: Advanced search and filtering system for product discovery

**Search Capabilities**:
- Text-based search across product names and descriptions
- Category-based filtering
- Price range filtering (min/max)
- Sorting options:
  - Price: Low to High / High to Low
  - Date: Newest / Oldest

**Technical Implementation**:
- MongoDB aggregation pipelines for complex queries
- Real-time search with debouncing
- Pagination support for large datasets

#### 3.2.3 Product Detail View
**Feature Description**: Comprehensive product information display

**Features**:
- High-resolution product images
- Detailed product specifications
- Seller information and contact
- Like/unlike functionality
- Offer submission system

### 3.3 Interaction & Communication System

#### 3.3.1 Product Bookmarking (Like System)
**Feature Description**: Users can bookmark products for future reference

**Technical Implementation**:
- Toggle like/unlike functionality
- Real-time UI updates
- Persistent storage in user's liked products list

**User Flow**:
1. User clicks heart icon on product
2. System updates product's likedBy array
3. UI reflects change immediately
4. Product appears in user's "Liked Products" page

#### 3.3.2 Offer Management System
**Feature Description**: Email-based communication system for buyer-seller interaction

**Technical Implementation**:
- Nodemailer integration for email sending
- Template-based email system
- Seller notification system

**User Flow**:
1. Buyer views product detail page
2. Clicks "Make Offer" or similar action
3. System sends email to seller with buyer details
4. Seller can respond directly via email

### 3.4 User Interface & Experience

#### 3.4.1 Responsive Design System
**Feature Description**: Mobile-first responsive design with consistent theming

**Technical Implementation**:
- Bootstrap CSS framework
- Custom CSS for brand-specific styling
- Responsive grid system
- Mobile-optimized navigation

#### 3.4.2 Theme Management
**Feature Description**: Dark/light mode toggle for enhanced user experience

**Technical Implementation**:
- React Context API for theme state management
- CSS custom properties for theme variables
- Persistent theme preference storage

#### 3.4.3 Navigation & Routing
**Feature Description**: Intuitive navigation with protected routes

**Route Structure**:
- `/` - Home page (public)
- `/signin` - User login (public)
- `/signup` - User registration (public)
- `/profile` - User profile (protected)
- `/about` - About page (public)
- `/sell` - Product categories (protected)
- `/post-ad` - Create product listing (protected)
- `/product/:id` - Product detail view (public)
- `/likedProducts` - User's bookmarked products (protected)
- `/manage-products` - User's product listings (protected)

## 4. Technical Specifications

### 4.1 API Endpoints

#### 4.1.1 User Management APIs
```
POST /user/register - User registration
POST /user/login - User authentication
PUT /user/:id - Update user profile
DELETE /user/:id - Delete user account
```

#### 4.1.2 Product Management APIs
```
GET /product - Get all products (with filters)
GET /product/:id - Get specific product
POST /product/create - Create new product
PUT /product/:id - Update product
DELETE /product/:id - Delete product
POST /product/like/:id - Like product
POST /product/unlike/:id - Unlike product
GET /product/user/:userId - Get user's products
```

#### 4.1.3 Communication APIs
```
POST /offer/send - Send offer email to seller
```

### 4.2 Database Schema Design

#### 4.2.1 User Collection
- Stores user authentication and profile information
- Supports role-based access control
- Indexed on email for fast lookups

#### 4.2.2 Product Collection
- Dynamic schema based on product category
- Pre-save validation for category-specific fields
- Populated references for user information
- Indexed on category, price, and creation date

### 4.3 Security Implementation

#### 4.3.1 Authentication Security
- JWT tokens with expiration
- Password hashing with salt rounds
- Protected route middleware
- Input validation and sanitization

#### 4.3.2 Data Security
- CORS configuration for cross-origin requests
- File upload validation and restrictions
- MongoDB injection prevention
- Error handling without information leakage

## 5. User Experience Flow

### 5.1 New User Journey
1. **Discovery**: User lands on homepage, browses products
2. **Registration**: Creates account to access full features
3. **Exploration**: Searches and filters products, likes items
4. **Engagement**: Creates first product listing
5. **Transaction**: Receives offers, communicates with buyers

### 5.2 Returning User Journey
1. **Login**: Quick authentication process
2. **Dashboard**: Views liked products and own listings
3. **Management**: Updates existing listings, responds to offers
4. **Discovery**: Continues browsing for new items

## 6. Performance & Scalability

### 6.1 Current Performance Features
- Image optimization and compression
- Efficient database queries with indexing
- Pagination for large datasets
- Client-side caching of user data

### 6.2 Scalability Considerations
- Modular backend architecture
- Stateless API design
- Database connection pooling
- CDN integration for image delivery

## 7. Deployment & Infrastructure

### 7.1 Current Deployment
- **Frontend**: Deployed on Netlify with automatic deployments
- **Backend**: Deployed on Render with environment configuration
- **Database**: MongoDB Atlas cloud database
- **Images**: Local file storage with Multer (Cloudinary configured)

### 7.2 Environment Configuration
- Separate development and production environments
- Environment variables for sensitive configuration
- CORS configuration for cross-origin requests

## 8. Future Enhancement Opportunities

### 8.1 Immediate Improvements
- Real-time chat system using Socket.io
- Advanced image gallery with multiple photos
- User rating and review system
- Payment integration for secure transactions

### 8.2 Long-term Features
- Mobile application development
- AI-powered product recommendations
- Geolocation-based local marketplace
- Sustainability impact tracking
- Seller verification system

## 9. Success Metrics & KPIs

### 9.1 User Engagement
- Daily/Monthly Active Users
- Session duration and page views
- Product listing creation rate
- User retention rate

### 9.2 Platform Performance
- Search and filter usage statistics
- Like/bookmark engagement rates
- Email offer conversion rates
- Platform uptime and response times

## 10. Conclusion

CycleBay represents a comprehensive solution for sustainable commerce, combining modern web technologies with user-centric design to create an effective circular economy marketplace. The platform's modular architecture and feature-rich implementation provide a solid foundation for growth and enhancement in the sustainable commerce space.

The current implementation successfully addresses core marketplace needs while maintaining scalability and user experience standards. Future enhancements can build upon this foundation to create an even more robust and feature-complete platform.