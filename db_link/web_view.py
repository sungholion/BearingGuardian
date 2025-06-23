import os
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from .mysql_config import engine
from sqlalchemy import text

app = FastAPI()

# 템플릿 디렉토리 설정
templates = Jinja2Templates(directory=os.path.join(os.path.dirname(__file__), "templates"))

TABLES = [
    "vibration_raw",
    "vibration_preprocessed", 
    "vibration_input",
    "vibration_result",
    "vibration_stats"
]

@app.get("/tables", response_class=HTMLResponse)
def list_tables(request: Request):
    return templates.TemplateResponse("table_list.html", {"request": request, "tables": TABLES})

@app.get("/tables/{table_name}", response_class=HTMLResponse)
def view_table(request: Request, table_name: str):
    if table_name not in TABLES:
        return HTMLResponse(f"<h2>Unknown table: {table_name}</h2>", status_code=404)
    with engine.connect() as conn:
        try:
            result = conn.execute(text(f"SELECT * FROM {table_name}"))
            rows = result.fetchall()
            columns = result.keys()
        except Exception as e:
            return HTMLResponse(f"<h2>Error reading {table_name}: {e}</h2>", status_code=500)
    return templates.TemplateResponse(
        "table_view.html",
        {"request": request, "table_name": table_name, "columns": columns, "rows": rows}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("web_view:app", host="0.0.0.0", port=8080, reload=True) 