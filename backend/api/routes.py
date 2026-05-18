from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Body
from typing import List, Optional
from pydantic import BaseModel
import json
from backend.services.incremental_updater import IncrementalUpdater
from backend.database.db import (
    get_stats, get_all_files, get_file_by_id, get_file_elements,
    get_all_elements, get_all_relations, search_elements, get_element_by_id
)

router = APIRouter()
updater = IncrementalUpdater()
active_websockets: List[WebSocket] = []

class WatchRequest(BaseModel):
    path: str

def broadcast_event(event: dict):
    for ws in active_websockets[:]:
        try:
            ws.send_text(json.dumps(event))
        except:
            active_websockets.remove(ws)

@router.get("/status")
async def get_status():
    stats = get_stats()
    watch_status = updater.get_status()
    return {
        "watching": watch_status["is_active"],
        "file_count": stats["file_count"],
        "element_count": stats["element_count"],
        "last_update": stats["last_update"],
        "pending_files": watch_status["pending_files"]
    }

@router.get("/files")
async def get_files():
    files = get_all_files()
    return {"files": files}

@router.get("/files/{file_id}/elements")
async def get_file_elements_endpoint(file_id: int):
    file_info = get_file_by_id(file_id)
    if not file_info:
        return {"error": "File not found"}
    
    elements = get_file_elements(file_id)
    return {
        "file": file_info,
        "elements": elements
    }

@router.get("/elements")
async def get_all_elements_endpoint():
    elements = get_all_elements()
    return {"elements": elements}

@router.get("/relations")
async def get_all_relations_endpoint():
    relations = get_all_relations()
    return {"relations": relations}

@router.get("/search")
async def search_endpoint(q: str, type: Optional[str] = None):
    results = search_elements(q, type)
    return {"results": results}

@router.get("/elements/{element_id}")
async def get_element_endpoint(element_id: int):
    element = get_element_by_id(element_id)
    if not element:
        return {"error": "Element not found"}
    return element

@router.post("/watch/start")
async def start_watch(request: WatchRequest):
    try:
        updater.start_watching(request.path, callback=broadcast_event)
        return {"status": "started", "path": request.path}
    except Exception as e:
        return {"error": str(e)}

@router.post("/watch/stop")
async def stop_watch():
    updater.stop_watching()
    return {"status": "stopped"}

@router.get("/watch/status")
async def get_watch_status():
    return updater.get_status()

@router.post("/update/{file_path:path}")
async def update_file(file_path: str):
    updater.update_single_file(file_path)
    return {"status": "updated", "path": file_path}

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    active_websockets.append(websocket)
    try:
        while True:
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        if websocket in active_websockets:
            active_websockets.remove(websocket)
