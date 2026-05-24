import time
import threading
import sys
from pathlib import Path
from typing import Callable, Dict, Optional
from collections import defaultdict

sys.path.insert(0, str(Path(__file__).parent.parent))

from utils.logger import scheduler_logger as logger


class DebounceScheduler:
    def __init__(self, delay: float = 1.0):
        logger.debug(f"DebounceScheduler.__init__ 开始: delay={delay}s")
        self.delay = delay
        self.pending_files: Dict[str, float] = {}
        self.lock = threading.Lock()
        self.timer: Optional[threading.Timer] = None
        self.callback: Optional[Callable] = None
        logger.debug("DebounceScheduler.__init__ 完成")

    def start(self, callback: Callable):
        logger.info("DebounceScheduler.start 开始")
        self.callback = callback
        self._process_queue()
        logger.debug("DebounceScheduler.start 完成")

    def schedule(self, file_path: str):
        logger.debug(f"schedule 被调用: file_path={file_path}")
        with self.lock:
            logger.debug(f"更新 pending_files: {file_path} -> {time.time()}")
            self.pending_files[file_path] = time.time()
            if self.timer:
                logger.debug("取消现有定时器")
                self.timer.cancel()
            logger.debug(f"创建新定时器，延迟 {self.delay}s")
            self.timer = threading.Timer(self.delay, self._process_queue)
            self.timer.start()
        logger.debug("schedule 完成")

    def _process_queue(self):
        logger.debug("_process_queue 开始")
        with self.lock:
            current_time = time.time()
            files_to_process = [
                path for path, last_time in self.pending_files.items()
                if current_time - last_time >= self.delay
            ]
            
            logger.debug(f"准备处理 {len(files_to_process)} 个文件: {files_to_process}")
            
            for path in files_to_process:
                del self.pending_files[path]
        
        if self.callback and files_to_process:
            for path in files_to_process:
                try:
                    logger.debug(f"执行回调处理文件: {path}")
                    self.callback(path)
                except Exception as e:
                    logger.error(f"处理文件 {path} 时出错: {e}", exc_info=True)
        else:
            logger.debug("没有需要处理的文件或回调未设置")
        
        logger.debug("_process_queue 完成")

    def stop(self):
        logger.info("DebounceScheduler.stop 开始")
        with self.lock:
            if self.timer:
                logger.debug("取消定时器")
                self.timer.cancel()
                self.timer = None
            logger.debug("清空 pending_files")
            self.pending_files.clear()
        logger.debug("DebounceScheduler.stop 完成")

    def get_pending_count(self) -> int:
        logger.debug("get_pending_count 被调用")
        with self.lock:
            count = len(self.pending_files)
        logger.debug(f"get_pending_count 返回: {count}")
        return count
