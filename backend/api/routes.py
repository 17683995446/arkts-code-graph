from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Body
from typing import List, Optional
from pydantic import BaseModel
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from services.incremental_updater import IncrementalUpdater
from database.db import (
    get_stats, get_all_files, get_file_by_id, get_file_elements,
    get_all_elements, get_all_relations, search_elements, get_element_by_id,
    safe_get_stats, safe_get_all_files, safe_get_all_elements, safe_get_all_relations,
    safe_search_elements, init_database
)
from utils.logger import api_logger as logger


router = APIRouter()
updater = IncrementalUpdater()
active_websockets: List[WebSocket] = []


class WatchRequest(BaseModel):
    path: str


def broadcast_event(event: dict):
    logger.debug(f"broadcast_event 被调用: event={event}")
    for ws in active_websockets[:]:
        try:
            ws.send_text(json.dumps(event))
        except Exception as e:
            logger.warning(f"发送 websocket 消息失败，移除连接: {e}")
            active_websockets.remove(ws)


@router.get("/status")
async def get_status():
    logger.info("GET /api/status 被调用")
    try:
        init_database()
        stats = safe_get_stats()
        watch_status = updater.get_status()
        result = {
            "watching": watch_status["is_active"],
            "file_count": stats["file_count"],
            "element_count": stats["element_count"],
            "last_update": stats["last_update"],
            "pending_files": watch_status["pending_files"]
        }
        logger.debug(f"GET /api/status 返回: {result}")
        return result
    except Exception as e:
        logger.error(f"GET /api/status 出错: {e}", exc_info=True)
        return {
            "watching": False,
            "file_count": 0,
            "element_count": 0,
            "last_update": None,
            "pending_files": 0,
            "error": str(e)
        }


@router.get("/files")
async def get_files():
    logger.info("GET /api/files 被调用")
    try:
        init_database()
        files = safe_get_all_files()
        logger.debug(f"GET /api/files 返回 {len(files)} 个文件")
        return {"files": files}
    except Exception as e:
        logger.error(f"GET /api/files 出错: {e}", exc_info=True)
        return {"files": [], "error": str(e)}


@router.get("/files/{file_id}/elements")
async def get_file_elements_endpoint(file_id: int):
    logger.info(f"GET /api/files/{file_id}/elements 被调用")
    try:
        init_database()
        file_info = get_file_by_id(file_id)
        if not file_info:
            logger.warning(f"文件未找到: file_id={file_id}")
            return {"error": "File not found"}
        
        elements = get_file_elements(file_id)
        logger.debug(f"GET /api/files/{file_id}/elements 返回 {len(elements)} 个元素")
        return {
            "file": file_info,
            "elements": elements
        }
    except Exception as e:
        logger.error(f"GET /api/files/{file_id}/elements 出错: {e}", exc_info=True)
        return {"error": str(e), "file": None, "elements": []}


@router.get("/elements")
async def get_all_elements_endpoint():
    logger.info("GET /api/elements 被调用")
    try:
        init_database()
        elements = safe_get_all_elements()
        logger.debug(f"GET /api/elements 返回 {len(elements)} 个元素")
        return {"elements": elements}
    except Exception as e:
        logger.error(f"GET /api/elements 出错: {e}", exc_info=True)
        return {"elements": [], "error": str(e)}


@router.get("/relations")
async def get_all_relations_endpoint():
    logger.info("GET /api/relations 被调用")
    try:
        init_database()
        relations = safe_get_all_relations()
        logger.debug(f"GET /api/relations 返回 {len(relations)} 个关系")
        return {"relations": relations}
    except Exception as e:
        logger.error(f"GET /api/relations 出错: {e}", exc_info=True)
        return {"relations": [], "error": str(e)}


@router.get("/search")
async def search_endpoint(q: str, type: Optional[str] = None):
    logger.info(f"GET /api/search 被调用: q={q}, type={type}")
    try:
        init_database()
        results = safe_search_elements(q, type)
        logger.debug(f"GET /api/search 返回 {len(results)} 个结果")
        return {"results": results}
    except Exception as e:
        logger.error(f"GET /api/search 出错: {e}", exc_info=True)
        return {"results": [], "error": str(e)}


@router.get("/elements/{element_id}")
async def get_element_endpoint(element_id: int):
    logger.info(f"GET /api/elements/{element_id} 被调用")
    try:
        init_database()
        element = get_element_by_id(element_id)
        if not element:
            logger.warning(f"元素未找到: element_id={element_id}")
            return {"error": "Element not found"}
        logger.debug(f"GET /api/elements/{element_id} 返回元素: {element}")
        return element
    except Exception as e:
        logger.error(f"GET /api/elements/{element_id} 出错: {e}", exc_info=True)
        return {"error": str(e)}


@router.post("/watch/start")
async def start_watch(request: WatchRequest):
    logger.info(f"POST /api/watch/start 被调用: path={request.path}")
    try:
        init_database()
        updater.start_watching(request.path, callback=broadcast_event)
        result = {"status": "started", "path": request.path}
        logger.debug(f"POST /api/watch/start 返回: {result}")
        return result
    except Exception as e:
        logger.error(f"POST /api/watch/start 出错: {e}", exc_info=True)
        return {"error": str(e)}


@router.post("/watch/stop")
async def stop_watch():
    logger.info("POST /api/watch/stop 被调用")
    updater.stop_watching()
    result = {"status": "stopped"}
    logger.debug(f"POST /api/watch/stop 返回: {result}")
    return result


@router.get("/watch/status")
async def get_watch_status():
    logger.info("GET /api/watch/status 被调用")
    status = updater.get_status()
    logger.debug(f"GET /api/watch/status 返回: {status}")
    return status


@router.post("/update")
async def update_file(file_path: str):
    logger.info(f"POST /api/update 被调用: file_path={file_path}")
    try:
        cleaned_path = file_path.replace('//', '/')
        init_database()
        updater.update_single_file(cleaned_path)
        result = {"status": "updated", "path": cleaned_path}
        logger.debug(f"POST /api/update 返回: {result}")
        return result
    except Exception as e:
        logger.error(f"POST /api/update 出错: {e}", exc_info=True)
        return {"status": "error", "path": file_path, "error": str(e)}


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    logger.info("WebSocket 连接尝试")
    await websocket.accept()
    active_websockets.append(websocket)
    logger.debug("WebSocket 连接已建立，添加到 active_websockets")
    try:
        while True:
            data = await websocket.receive_text()
            logger.debug(f"收到 WebSocket 消息: {data}")
    except WebSocketDisconnect:
        logger.info("WebSocket 连接断开")
        if websocket in active_websockets:
            active_websockets.remove(websocket)
        logger.debug("WebSocket 连接已从 active_websockets 移除")
