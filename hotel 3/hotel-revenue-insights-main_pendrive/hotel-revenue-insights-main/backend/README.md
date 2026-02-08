# HotelRevAI Backend

AI-Driven Revenue Analysis for Hotels - Backend API

## Overview

This backend provides REST APIs for the HotelRevAI application, featuring Firebase Authentication, Firestore database, and AI-powered analytics for hotel revenue optimization.

## Tech Stack

- **Node.js** with **Express.js**
- **Firebase Authentication** for user management
- **Firestore** for database
- **REST APIs** with JSON responses

## Features

- User authentication (register/login)
- Booking data management
- AI-powered demand prediction
- Dynamic pricing recommendations
- Revenue analytics and forecasting
- Dashboard statistics

## Project Structure

```
backend/
├── config/
│   └── firebase.js          # Firebase configuration
├── controllers/             # (Future use)
├── middleware/
│   └── auth.js             # Authentication middleware
├── routes/
│   ├── auth.js             # Authentication routes
│   ├── bookings.js         # Booking management routes
│   ├── analytics.js        # Analytics routes
│   └── dashboard.js        # Dashboard routes
├── services/
│   └── analyticsService.js # AI analytics logic
├── server.js               # Main server file
├── package.json
├── .env.example            # Environment variables template
└── README.md
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Firebase Setup

1. Create a Firebase project at https://console.firebase.google.com/
2. Enable Authentication and Firestore
3. Create a service account and download the key JSON
4. Copy `.env.example` to `.env` and fill in your Firebase credentials

### 3. Environment Variables

Copy `.env.example` to `.env` and configure:

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40your-project-id.iam.gserviceaccount.com
PORT=5000
```

### 4. Start the Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

The server will run on `http://localhost:5000`

## API Documentation

### Authentication

#### Register Hotel Manager
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "manager@hotel.com",
  "password": "password123",
  "name": "John Doe",
  "hotelName": "Grand Hotel"
}
```

**Response:**
```json
{
  "message": "Hotel manager registered successfully",
  "user": {
    "uid": "firebase-user-id",
    "email": "manager@hotel.com",
    "name": "John Doe"
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "idToken": "firebase-id-token"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "uid": "firebase-user-id",
    "email": "manager@hotel.com",
    "name": "John Doe",
    "hotelName": "Grand Hotel"
  }
}
```

### Bookings

#### Add Booking
```http
POST /api/bookings
Authorization: Bearer <firebase-token>
Content-Type: application/json

{
  "date": "2024-01-15",
  "roomsBooked": 5,
  "roomPrice": 150.00,
  "roomType": "Standard Room"
}
```

#### Get Booking History
```http
GET /api/bookings?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <firebase-token>
```

#### Upload Sample Data
```http
POST /api/bookings/upload
Authorization: Bearer <firebase-token>
Content-Type: application/json

{
  "bookings": [
    {
      "date": "2024-01-15",
      "roomsBooked": 5,
      "roomPrice": 150.00,
      "roomType": "Standard Room"
    }
  ]
}
```

### Analytics

#### Demand Prediction
```http
GET /api/analytics/demand-prediction?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <firebase-token>
```

**Response:**
```json
{
  "predictions": [
    {
      "date": "2024-01-01",
      "predictedDemand": "high",
      "predictedRooms": 18
    }
  ]
}
```

#### Pricing Recommendations
```http
GET /api/analytics/pricing-recommendation?startDate=2024-01-01&endDate=2024-01-31&roomType=Standard
Authorization: Bearer <firebase-token>
```

**Response:**
```json
{
  "recommendations": [
    {
      "date": "2024-01-01",
      "roomType": "Standard",
      "basePrice": 150.00,
      "recommendedPrice": 180.00,
      "demandLevel": "high"
    }
  ]
}
```

#### Revenue Calculation
```http
GET /api/analytics/revenue?startDate=2024-01-01&endDate=2024-01-31&type=daily
Authorization: Bearer <firebase-token>
```

### Dashboard

#### Get Dashboard Stats
```http
GET /api/dashboard/stats
Authorization: Bearer <firebase-token>
```

**Response:**
```json
{
  "totalRevenue": 45000.00,
  "occupancyRate": 85.5,
  "demandForecast": {
    "date": "2024-01-15",
    "predictedDemand": "high",
    "predictedRooms": 18
  },
  "pricingRecommendation": {
    "date": "2024-01-15",
    "roomType": "all",
    "basePrice": 150.00,
    "recommendedPrice": 180.00,
    "demandLevel": "high"
  }
}
```

## AI Logic (MVP)

### Demand Prediction
- **High Demand**: Average bookings > 15 rooms/day → +20% prediction
- **Medium Demand**: Average bookings 8-15 rooms/day → baseline prediction
- **Low Demand**: Average bookings < 8 rooms/day → -30% prediction

### Pricing Strategy
- **High Demand**: +20% from base price
- **Medium Demand**: Base price maintained
- **Low Demand**: -15% from base price

### Revenue Calculation
Revenue = Predicted Rooms Booked × Recommended Room Price

## Database Schema

### Users Collection
```json
{
  "userId": "firebase-uid",
  "name": "John Doe",
  "email": "manager@hotel.com",
  "hotelName": "Grand Hotel",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### Bookings Collection
```json
{
  "userId": "firebase-uid",
  "date": "2024-01-15",
  "roomsBooked": 5,
  "roomPrice": 150.00,
  "roomType": "Standard Room",
  "createdAt": "2024-01-15T10:00:00.000Z"
}
```

## Security

- All routes except `/api/auth/register` and `/api/auth/login` require authentication
- Firebase ID tokens are verified on each request
- User data is isolated by `userId`

## Error Handling

The API returns appropriate HTTP status codes and error messages:

- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `404`: Not Found
- `500`: Internal Server Error

## Development

```bash
# Install dependencies
npm install

# Start development server with auto-reload
npm run dev

# Start production server
npm start
```

## Deployment

This backend is compatible with Firebase Hosting and can be deployed to any Node.js hosting platform.

## License

MIT License