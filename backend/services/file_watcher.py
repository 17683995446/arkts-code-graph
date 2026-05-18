import os
import threading
from pathlib import Path
from typing import Optional, List
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler, FileSystemEvent

class CodeFileHandler(FileSystemEventHandler):
    def __init__(self, extensions: List[str], callback):
        self.extensions = extensions
        self.callback = callback
        super().__init__()
    
    def should_process(self, path: str) -> bool:
        if not os.path.isfile(path):
            return False
        ext = os.path.splitext(path)[1].lower()
        return ext in self.extensions or path.endswith('.ets')
    
    def on_modified(self, event: FileSystemEvent):
        if not event.is_directory and self.should_process(event.src_path):
            self.callback(event.src_path, 'modified')
    
    def on_created(self, event: FileSystemEvent):
        if not event.is_directory and self.should_process(event.src_path):
            self.callback(event.src_path, 'created')
    
    def on_deleted(self, event: FileSystemEvent):
        if not event.is_directory and self.should_process(event.src_path):
            self.callback(event.src_path, 'deleted')

class FileWatcher:
    def __init__(self, extensions: List[str] = None):
        if extensions is None:
            extensions = ['.ts', '.tsx', '.ets']
        self.extensions = extensions
        self.observer: Optional[Observer] = None
        self.handler: Optional[CodeFileHandler] = None
        self.is_watching = False
        self.watch_path: Optional[str] = None
        self.callback: Optional[callable] = None
        self.lock = threading.Lock()
    
    def start(self, path: str, callback: callable):
        with self.lock:
            if self.is_watching:
                self.stop()
            
            self.watch_path = path
            self.callback = callback
            self.handler = CodeFileHandler(self.extensions, self._handle_event)
            self.observer = Observer()
            self.observer.schedule(self.handler, path, recursive=True)
            self.observer.start()
            self.is_watching = True
    
    def _handle_event(self, file_path: str, event_type: str):
        if self.callback:
            self.callback(file_path, event_type)
    
    def stop(self):
        with self.lock:
            if self.observer:
                self.observer.stop()
                self.observer.join()
                self.observer = None
            self.is_watching = False
            self.watch_path = None
    
    def get_status(self) -> dict:
        return {
            "is_watching": self.is_watching,
            "watch_path": self.watch_path
        }
