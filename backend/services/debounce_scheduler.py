import time
import threading
from typing import Callable, Dict, Optional
from collections import defaultdict

class DebounceScheduler:
    def __init__(self, delay: float = 1.0):
        self.delay = delay
        self.pending_files: Dict[str, float] = {}
        self.lock = threading.Lock()
        self.timer: Optional[threading.Timer] = None
        self.callback: Optional[Callable] = None
        
    def start(self, callback: Callable):
        self.callback = callback
        self._process_queue()
    
    def schedule(self, file_path: str):
        with self.lock:
            self.pending_files[file_path] = time.time()
            if self.timer:
                self.timer.cancel()
            self.timer = threading.Timer(self.delay, self._process_queue)
            self.timer.start()
    
    def _process_queue(self):
        with self.lock:
            current_time = time.time()
            files_to_process = [
                path for path, last_time in self.pending_files.items()
                if current_time - last_time >= self.delay
            ]
            
            for path in files_to_process:
                del self.pending_files[path]
        
        if self.callback and files_to_process:
            for path in files_to_process:
                try:
                    self.callback(path)
                except Exception as e:
                    print(f"处理文件 {path} 时出错: {e}")
    
    def stop(self):
        with self.lock:
            if self.timer:
                self.timer.cancel()
                self.timer = None
            self.pending_files.clear()
    
    def get_pending_count(self) -> int:
        with self.lock:
            return len(self.pending_files)
