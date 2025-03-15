# TweetX - Twitter (X) Contribution & Engagement Tracker

TweetX is a comprehensive tool that analyzes Twitter (X) activity and provides detailed statistics and visualizations similar to GitHub's contribution graph. It consists of a Next.js frontend for interactive visualizations and a FastAPI backend for data processing.

![TweetX Banner](https://via.placeholder.com/1200x300/0077b6/ffffff?text=TweetX)

## 🌟 Features

### 📊 Contribution Graph (GitHub-Style for X Posts)

- Total tweets per year, month, day
- Hour-wise distribution
- Peak activity days
- Most active months and weeks
- Activity trend over time
- GitHub-style contribution heatmap
- Streak tracking (current and longest)

### 📈 Engagement Metrics

- Total likes, retweets, and estimated impressions
- Highest performing tweets
- Engagement trends

### 📌 Hashtags & Mentions Analysis

- Top hashtags used
- Most mentioned users
- Word cloud for most used words

## 🏗️ Project Structure

```
tweetx/
├── frontend/          # Next.js frontend application
├── backend/           # FastAPI backend application
├── .gitignore         # Combined gitignore for both projects
└── README.md          # Main project documentation
```

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ for the frontend
- Python 3.8+ for the backend
- Redis for caching (optional for local development)

### Backend Setup

```bash
# Navigate to the backend directory
cd backend

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the backend server
uvicorn app.main:app --reload
```

The backend API will be available at http://localhost:8000

### Frontend Setup

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at http://localhost:3000

## 📚 API Documentation

Once the backend server is running, you can access the API documentation at:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 🌐 Deployment

### Backend Deployment

The backend can be deployed to various platforms:

#### Render.com (Recommended)

We provide a `render.yaml` Blueprint for easy deployment to Render.com. See [backend/RENDER_DEPLOYMENT.md](backend/RENDER_DEPLOYMENT.md) for detailed instructions.

### Frontend Deployment

The frontend can be deployed to platforms like Vercel, Netlify, or any static hosting service.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- [FastAPI](https://fastapi.tiangolo.com/) for the backend framework
- [Next.js](https://nextjs.org/) for the frontend framework
- [snscrape](https://github.com/JustAnotherArchivist/snscrape) for Twitter data scraping
- [Redis](https://redis.io/) for caching
- [Pandas](https://pandas.pydata.org/) for data processing
