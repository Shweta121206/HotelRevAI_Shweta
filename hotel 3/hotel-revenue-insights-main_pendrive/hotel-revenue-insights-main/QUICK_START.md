# HotelRevAI - Quick Start Guide

## 🚀 Quick Start

### Step 1: Install Frontend Dependencies
```bash
cd hotel-revenue-insights-main
npm install
```

### Step 2: Install Backend Dependencies
```bash
cd backend
npm install
cd ..
```

### Step 3: Start Backend Server
```bash
cd backend
npm run dev
```
The backend will run on `http://localhost:5000`

### Step 4: Start Frontend (in a new terminal)
```bash
cd hotel-revenue-insights-main
npm run dev
```
The frontend will run on `http://localhost:5173`

### Step 5: Open Application
Open your browser and navigate to: `http://localhost:5173`

### Step 6: Login
- **Email**: Any email (e.g., `demo@hotel.com`)
- **Password**: Any password (e.g., `demo123`)

The system accepts any credentials for demo purposes.

## 📋 Features Overview

### 1. **Login Page** (`/`)
- Clean, professional authentication UI
- Demo mode accepts any credentials

### 2. **Dashboard** (`/dashboard`)
- **Total Revenue**: Current revenue with trend indicators
- **Occupancy Rate**: Real-time occupancy percentage
- **Demand Forecast**: AI-driven demand prediction (High/Medium/Low)
- **Daily Revenue Chart**: Interactive line chart

### 3. **Revenue Analytics** (`/analytics`)
- Daily revenue line chart
- Monthly revenue bar chart
- Occupancy vs pricing comparison chart

### 4. **Pricing Recommendations** (`/pricing`)
- Current room prices
- AI-recommended prices
- Confidence levels
- Demand indicators

### 5. **Data Upload** (`/upload`)
- Upload CSV, XLSX, or JSON files
- Automatic data parsing and analysis
- Historical trend visualization

## 📊 Sample Data Format

For data upload, use this CSV format:

```csv
date,rooms_booked,room_price,room_type
2024-01-15,5,189,Standard Room
2024-01-16,8,210,Deluxe Room
2024-01-17,12,225,Executive Suite
```

Or JSON format:

```json
[
  {
    "date": "2024-01-15",
    "rooms_booked": 5,
    "room_price": 189,
    "room_type": "Standard Room"
  },
  {
    "date": "2024-01-16",
    "rooms_booked": 8,
    "room_price": 210,
    "room_type": "Deluxe Room"
  }
]
```

## 🔧 Troubleshooting

### Backend won't start
- Make sure port 5000 is not in use
- Check that all backend dependencies are installed
- Verify Node.js version is 18+

### Frontend won't start
- Make sure port 5173 is not in use
- Check that all frontend dependencies are installed
- Clear node_modules and reinstall if needed

### API errors
- Ensure backend is running before starting frontend
- Check browser console for detailed error messages
- Verify API URL in `.env` file (if using custom port)

## 🎯 Demo Credentials

Any email and password combination will work:
- Email: `manager@hotel.com` (or any email)
- Password: `password123` (or any password)

## 📝 Notes

- This is a prototype/MVP for hackathon demonstration
- Uses simulated AI logic for demand forecasting and pricing
- Mock data is used when no real data is available
- Firebase integration is optional (works without it for demo)

## 🎨 UI Features

- Modern, clean design
- Responsive layout (works on desktop, tablet, mobile)
- Smooth animations and transitions
- Professional color scheme
- Accessible components

Enjoy exploring HotelRevAI! 🏨✨
