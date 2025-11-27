from fastapi import FastAPI, Query
from motor.motor_asyncio import AsyncIOMotorClient
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
import json

app = FastAPI()

# CORS Setup (Allow all origins)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB Connection
MONGO_DETAILS = "mongodb://localhost:27017"
client = AsyncIOMotorClient(MONGO_DETAILS)
database = client.dashboard_db
collection = database.insights

@app.on_event("startup")
async def load_data():
    """Load data from JSON file on server startup"""
    try:
        with open('jsondata.json', encoding='utf-8') as f:
            data = json.load(f)
        
        if data:
            await collection.delete_many({})
            await collection.insert_many(data)
            print("Data loaded successfully on startup!")
    except Exception as e:
        print(f"Error loading data: {e}")

@app.get("/api/data")
async def get_data(
    end_year: Optional[str] = None,
    topic: Optional[str] = None,
    sector: Optional[str] = None,
    region: Optional[str] = None,
    pestle: Optional[str] = None,
    source: Optional[str] = None,
    country: Optional[str] = None,
    city: Optional[str] = None
):
    query = {}
    
    # Dynamic Filtering Logic
    if end_year:
        query["end_year"] = int(end_year) if end_year.isdigit() else end_year
    if topic:
        query["topic"] = topic
    if sector:
        query["sector"] = sector
    if region:
        query["region"] = region
    if pestle:
        query["pestle"] = pestle
    if source:
        query["source"] = source
    if country:
        query["country"] = country
    if city:
        query["city"] = city

    insights = await collection.find(query).to_list()
    
    # Convert ObjectId to string for JSON serialization
    for doc in insights:
        doc["_id"] = str(doc["_id"])
        
    return insights

@app.get("/api/filters")
async def get_filters():
    """Helper endpoint to populate filter dropdowns"""
    end_years = await collection.distinct("end_year")
    topics = await collection.distinct("topic")
    sectors = await collection.distinct("sector")
    regions = await collection.distinct("region")
    pestles = await collection.distinct("pestle")
    countries = await collection.distinct("country")
    
    return {
        "end_year": [x for x in end_years if x],
        "topic": [x for x in topics if x],
        "sector": [x for x in sectors if x],
        "region": [x for x in regions if x],
        "pestle": [x for x in pestles if x],
        "country": [x for x in countries if x]
    }