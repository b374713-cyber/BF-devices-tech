# BF Devices Tech - E-Commerce Platform

## Overview
BF Devices Tech is a full-featured e-commerce platform designed for selling electronics, gadgets, and 
tech accessories. It provides a seamless shopping experience for customers while giving administrators 
complete control over products, orders, and inventory.

The system includes both web and mobile-friendly interfaces with secure payment processing, real-time 
order tracking, and automated invoice generation.


## Key Features

### Product Management
- Browse products with advanced search and filtering
- Product categories and brand filtering
- Product details with images and descriptions
- Product reviews and ratings (1-5 stars)

### Shopping Experience
- Add to cart with quantity management
- Wishlist for saving favorite items
- Real-time cart updates
- User-specific cart and wishlist (per user)

### Checkout and Payments
- Cash on Delivery (COD) with PDF invoice generation
- Secure Stripe payment integration
- Order status tracking (Pending to Processing to Shipped to Delivered)
- Order history and details

### Invoice System
- Automatic PDF invoice generation for COD orders
- Professional invoice with:
  - Order details and number
  - Customer information
  - Itemized product list
  - Total amount with breakdown
- Downloadable from My Orders page

### Admin Panel
- Dashboard with real-time statistics
- Product management (Add, Edit, Delete)
- Category management
- Order management with status updates
- User management (View, Delete)
- Stock management with live updates
- Low stock alerts (real-time notifications)

### Authentication and Users
- User registration and login with JWT
- Role-based access (Admin / Regular User)
- Forgot password and reset password
- My Account page for profile management
- Password change functionality

### Reviews and Ratings
- Write product reviews
- Rate products (1-5 stars)
- View average ratings
- Delete own reviews

### Notifications
- Real-time low stock alerts (Admin only)
- Order confirmation messages
- Success and error notifications


## Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js | JavaScript runtime |
| Express.js | Web framework |
| SQLite3 | Database |
| JWT | Authentication |
| Bcrypt | Password hashing |
| Stripe | Payment processing |
| PDFKit | PDF invoice generation |
| Multer | File upload |
| Nodemon | Development server |

### Frontend
| Technology | Purpose |
|------------|---------|
| React | UI library |
| React Router | Navigation |
| Bootstrap | Styling |
| React Icons | Icons |
| Axios | HTTP requests |
| Stripe.js | Payment UI |
| React Bootstrap | Components |

## User Roles

### Regular User (Customer)
- Browse and search products
- Add to cart and wishlist
- Place orders (COD or Stripe)
- Track order status
- Write product reviews
- View order history
- Download invoices
- Manage profile

### Admin
- Full system control
- Add, edit, delete products
- Manage categories
- View and update all orders
- Manage users (view, delete)
- Monitor stock levels
- Receive low stock alerts
- View dashboard statistics


## System Highlights

- Multi-role system (Admin / Regular User)
- Secure authentication with JWT
- Real-time order tracking with timeline
- PDF invoice generation for COD orders
- Stripe payment integration
- User-specific cart and wishlist
- Product reviews and ratings
- Advanced search with filters
- Admin dashboard with analytics
- Real-time low stock notifications
- Responsive design (works on all devices)


## Conclusion
BF Devices Tech is a complete e-commerce platform that provides a seamless shopping experience for 
customers while giving administrators full control over the system. With features like secure payments,
invoice generation, real-time order tracking, and an intuitive admin dashboard, it is a scalable solution 
for any online store.
