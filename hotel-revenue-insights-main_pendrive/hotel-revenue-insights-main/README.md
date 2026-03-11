# HotelRevAI – AI Driven Revenue Analysis for Hotels

HotelRevAI is an AI-powered revenue intelligence platform designed to help hotels optimize room pricing and maximize revenue through data-driven insights. The project uses Artificial Intelligence to analyze booking trends, forecast demand, and recommend optimal room prices.

This project is developed as part of the **GDG on Campus – TechSprint Hackathon** under the **Open Innovation** problem statement.

---

##  Problem Statement

Hotels often rely on manual analysis and static pricing strategies, which fail to adapt to changing demand, seasonality, and customer behavior. This results in revenue loss due to underpricing during high-demand periods and overpricing during low-demand periods.

---

##  Solution Overview

HotelRevAI addresses this problem by:
- Analyzing historical booking and occupancy data
- Predicting future demand using AI models
- Providing intelligent, dynamic pricing recommendations
- Displaying insights through an easy-to-use dashboard for hotel managers

The solution helps hotels make smarter pricing decisions, improve occupancy rates, and maximize overall revenue.

---

##  Features

- AI-based demand forecasting  
- Dynamic room pricing recommendations  
- Revenue and occupancy analytics dashboard  
- Seasonal trend analysis  
- Historical booking data analysis  
- Secure login for hotel managers  
- Scalable cloud-based architecture  

---

##  Technologies Used

### AI & Development
- **Lovable AI** – Rapid prototyping of UI and application logic

### Google Technologies
- **Google Cloud Platform (GCP)** – Cloud infrastructure and deployment  
- **Firebase Authentication** – Secure user login  
- **BigQuery** – Storage and analysis of booking data  
- **Vertex AI** – Demand forecasting and ML model simulation  
- **Looker Studio** – Revenue analytics and visualization  

---

## Architecture Overview

User → Web Dashboard → Backend Services → BigQuery  
BigQuery → Vertex AI → Pricing Recommendation Engine  
Pricing Insights → Dashboard (Visualization via Looker Studio)

---

## MVP Description

The Minimum Viable Product (MVP) includes:
- Revenue analytics dashboard
- Demand forecast visualization
- AI-generated pricing recommendations
- Login page

Note: The MVP uses simulated/sample data for demonstration purposes.

---

##  Future Enhancements

- Integration with real-time hotel booking platforms
- Competitor price comparison
- Event-based surge pricing
- Mobile application for hotel owners
- Advanced AI models for long-term forecasting
- Personalized pricing strategies

---

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Frontend Setup

1. Navigate to the project root directory:
```bash
cd hotel-revenue-insights-main
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (optional - for production Firebase setup):
```env
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173` (or the port shown in terminal)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (optional - for Firebase production setup):
```env
PORT=5000
JWT_SECRET=your-secret-key-here
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
```

4. Start the backend server:
```bash
npm run dev
```

The backend API will be available at `http://localhost:5000`

### Running the Application

1. Start the backend server first (from `backend` directory):
```bash
npm run dev
```

2. Start the frontend server (from project root):
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

4. Login with any email/password (demo mode accepts any credentials)

---

## Application Features

### 1. Login Page
- Clean, professional authentication UI
- Demo mode accepts any email/password combination
- Secure JWT-based authentication

### 2. Dashboard
- **Total Revenue**: Current revenue with trend indicators
- **Occupancy Rate**: Real-time occupancy percentage
- **Demand Forecast**: AI-driven demand prediction (High/Medium/Low)
- **Daily Revenue Trend**: Interactive line chart showing revenue over time

### 3. Revenue Analytics
- **Daily Revenue Chart**: Line chart showing daily revenue trends
- **Monthly Revenue Chart**: Bar chart displaying monthly revenue breakdown
- **Occupancy vs Pricing**: Combined chart showing relationship between occupancy rates and room prices

### 4. Pricing Recommendations
- **Current Room Prices**: Display of existing room prices
- **AI-Recommended Prices**: ML-driven pricing suggestions
- **Confidence Levels**: Percentage confidence for each recommendation
- **Demand Indicators**: Visual indicators for demand levels (High/Medium/Low)

### 5. Data Upload
- **File Upload**: Support for CSV, XLSX, and JSON formats
- **Data Analysis**: Automatic parsing and analysis of booking data
- **Trend Analysis**: Historical trend visualization
- **Data Requirements**: Clear documentation of required data fields

---

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Dashboard
- `GET /api/dashboard/summary` - Get dashboard statistics and charts

### Analytics
- `GET /api/analytics/demand` - Get demand predictions
- `GET /api/analytics/pricing` - Get pricing recommendations
- `GET /api/analytics/revenue` - Get revenue analytics

### Bookings
- `POST /api/bookings/upload` - Upload booking data
- `GET /api/bookings/list` - Get booking history

---

## AI Logic (MVP)

### Demand Forecasting
- **High Demand**: Average bookings > 15 rooms/day → +20% prediction
- **Medium Demand**: Average bookings 8-15 rooms/day → baseline prediction
- **Low Demand**: Average bookings < 8 rooms/day → -30% prediction

### Pricing Strategy
- **High Demand**: +20% from base price
- **Medium Demand**: Base price maintained
- **Low Demand**: -15% from base price

### Revenue Calculation
- Real-time calculation based on uploaded booking data
- Daily and monthly aggregation
- Occupancy rate calculations

---

## File Structure

```
hotel-revenue-insights-main/
├── src/
│   ├── pages/          # Application pages (Login, Dashboard, Analytics, etc.)
│   ├── components/     # Reusable UI components
│   ├── contexts/       # React contexts (Auth, Currency)
│   ├── lib/            # Utilities and API clients
│   └── hooks/          # Custom React hooks
├── backend/
│   ├── routes/         # API route handlers
│   ├── services/       # Business logic and AI services
│   ├── middleware/     # Authentication middleware
│   └── config/         # Configuration files
└── public/             # Static assets
```

---

## Demo Credentials

For demo purposes, you can login with any email and password. The system accepts any credentials for demonstration.

Example:
- Email: `demo@hotel.com`
- Password: `demo123`

---

## Technologies

### Frontend
- **React** + **TypeScript** - UI framework
- **Vite** - Build tool
- **React Router** - Routing
- **TanStack Query** - Data fetching
- **Recharts** - Data visualization
- **Tailwind CSS** - Styling
- **Shadcn/ui** - UI components
- **Lucide React** - Icons

### Backend
- **Node.js** + **Express** - Server framework
- **JWT** - Authentication
- **Firebase Admin SDK** - Database (optional)
- **CORS** - Cross-origin resource sharing

---

## Contributing

This is a hackathon prototype. For production use, consider:
- Implementing proper password hashing
- Adding input validation and sanitization
- Setting up real Firebase/Firestore database
- Implementing proper error handling
- Adding unit and integration tests
- Setting up CI/CD pipeline

---

## License

This project is developed for the GDG on Campus – TechSprint Hackathon.
