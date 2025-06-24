# config.py

from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Configuration settings for Machine Learning Core"}

@app.get("/api/data")
def get_data():
    return {"data": ["item1", "item2", "item3"]}
