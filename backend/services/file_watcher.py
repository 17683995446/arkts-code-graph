import os
import threading
import sys
from pathlib import Path
from typing import Optional, List, Callable
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler, FileSystemEvent

sys.path.insert(0, str(Path(__file__).parent.parent))

from utils.logger import watcher_logger as logger


class CodeFileHandler(FileSystemEventHandler):
    def __init__(self, extensions: List[str], callback: Callable):
        logger.debug("CodeFileHandler.__init__ 开始")
        self.extensions = extensions
        self.callback = callback
        super().__init__()
        logger.debug("CodeFileHandler.__init__ 完成")

    def should_process(self, path: str) -> bool:
        logger.debug(f"should_process 被调用: path={path}")
        if not os.path.isfile(path):
            logger.debug("不是文件，返回 False")
            return False
        ext = os.path.splitext(path)[1].lower()
        result = ext in self.extensions or path.endswith('.ets')
        logger.debug(f"should_process 结果: {result}")
        return result

    def on_modified(self, event: FileSystemEvent):
        logger.debug(f"on_modified 事件: src_path={event.src_path}")
        if not event.is_directory and self.should_process(event.src_path):
            logger.debug("触发回调，event_type=modified")
            self.callback(event.src_path, 'modified')

    def on_created(self, event: FileSystemEvent):
        logger.debug(f"on_created 事件: src_path={event.src_path}")
        if not event.is_directory and self.should_process(event.src_path):
            logger.debug("触发回调，event_type=created")
            self.callback(event.src_path, 'created')

    def on_deleted(self, event: FileSystemEvent):
        logger.debug(f"on_deleted 事件: src_path={event.src_path}")
        if not event.is_directory and self.should_process(event.src_path):
            logger.debug("触发回调，event_type=deleted")
            self.callback(event.src_path, 'deleted')


class FileWatcher:
    def __init__(self, extensions: List[str] = None):
        logger.debug("FileWatcher.__init__ 开始")
        if extensions is None:
            extensions = ['.ts', '.tsx', '.ets']
        self.extensions = extensions
        self.observer: Optional[Observer] = None
        self.handler: Optional[CodeFileHandler] = None
        self.is_watching = False
        self.watch_path: Optional[str] = None
        self.callback: Optional[Callable] = None
        self.lock = threading.Lock()
        logger.debug("FileWatcher.__init__ 完成")

    def start(self, path: str, callback: Callable):
        logger.info(f"FileWatcher.start 开始: path={path}")
        with self.lock:
            if self.is_watching:
                logger.warning("已在监控中，先停止现有监控")
                self.stop()
            
            self.watch_path = path
            self.callback = callback
            logger.debug("创建 CodeFileHandler")
            self.handler = CodeFileHandler(self.extensions, self._handle_event)
            logger.debug("创建并启动 Observer")
            self.observer = Observer()
            self.observer.schedule(self.handler, path, recursive=True)
            self.observer.start()
            self.is_watching = True
        logger.info("FileWatcher.start 完成，开始监控")

    def _handle_event(self, file_path: str, event_type: str):
        logger.debug(f"_handle_event 被调用: file_path={file_path}, event_type={event_type}")
        if self.callback:
            self.callback(file_path, event_type)
        else:
            logger.warning("callback 未设置")

    def stop(self):
        logger.info("FileWatcher.stop 开始")
        with self.lock:
            if self.observer:
                logger.debug("停止 Observer")
                self.observer.stop()
                self.observer.join()
                self.observer = None
            self.is_watching = False
            self.watch_path = None
        logger.debug("FileWatcher.stop 完成")

    def get_status(self) -> dict:
        logger.debug("get_status 被调用")
        status = {
            "is_watching": self.is_watching,
            "watch_path": self.watch_path
        }
        logger.debug(f"get_status 返回: {status}")
        return status
