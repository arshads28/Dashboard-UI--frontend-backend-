Data Visualization Dashboard

A full-stack interactive dashboard application that visualizes energy, economic, and political insights. The project uses a Python FastAPI backend to serve data from MongoDB and a React.js frontend to display interactive charts using D3.js.

🚀 Tech Stack

Database: MongoDB

Backend: Python, FastAPI, Motor (Async MongoDB driver)

Frontend: React.js, Bootstrap, D3.js

📂 Project Structure

demo-full-stack/
│
├── client/              # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   └── charts/  # All reusable D3.js charts
│   │   ├── App.js
│   │   └── Dashboard.js
│   └── package.json
│
├── server/              # FastAPI backend
│   ├── main.py
│   ├── models.py
│   ├── database.py
│   ├── routers/
│   └── requirements.txt
│
└── README.md


🛠️ Prerequisites

Before running the project, ensure you have the following installed:

Node.js & npm (for the frontend)

Python 3.10+ (for the backend)

MongoDB (Must be installed and running locally on port 27017)

🐍 Backend Setup (Server)

Navigate to the server directory:

cd server


Create and activate a virtual environment (Recommended):

Linux/Mac:

python3 -m venv venv
source venv/bin/activate


Windows:

python -m venv venv
venv\Scripts\activate


Install Python dependencies:

pip install -r requirements.txt


Database Configuration:

Ensure MongoDB is running locally on port 27017.

Note: Ensure your database is populated with the required JSON data before starting the API.

Run the Server:

uvicorn main:app --reload


The API will be available at: http://localhost:8000

API Documentation (Swagger UI): http://localhost:8000/docs

⚛️ Frontend Setup (Client)

Open a new terminal and navigate to the client directory:

cd client


Install Node dependencies:

npm install


Start the React Application:

npm start


The application will run at: http://localhost:3000

📊 Features

Interactive D3.js Charts:

Custom scalable visualizations located in components/charts/.

Modular Backend:

Organized with separate models, database connection logic, and routers for cleaner code architecture.

Dynamic Filtering: Filter data by End Year, Topic, Sector, Region, PESTLE, Source, Country, and City.

Responsive Design: Dashboard layout adapts to different screen sizes.

