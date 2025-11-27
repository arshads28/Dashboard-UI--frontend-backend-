import json
from pymongo import MongoClient

# Connect to MongoDB
client = MongoClient('mongodb://localhost:27017/')
db = client['dashboard_db']
collection = db['insights']

# Load JSON data
with open('jsondata.json', encoding='utf-8') as f:
    data = json.load(f)

# Insert into Database
if data:
    collection.delete_many({}) # Clear existing data if re-running
    collection.insert_many(data)
    print("Data inserted successfully!")
else:
    print("No data found in json file.")