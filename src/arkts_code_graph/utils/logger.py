#!/usr/bin/env python3
"""
详细日志追踪系统 - 用于追踪每个代码执行环节
"""
import logging
import time
import sys
import os
from datetime import datetime

class DetailedLogger:
    """详细的日志追踪器"""
    
    def __init__(self, name: str, log_file: str = None, debug_enabled: bool = None):
        self.name = name
        self.start_time = time.time()
        self.call_count = 0
        
        # 从环境变量读取DEBUG设置，默认关闭DEBUG（只显示INFO及以上）
        if debug_enabled is None:
            debug_enabled = os.environ.get('CODE_GRAPH_DEBUG', '').lower() in ('1', 'true', 'yes')
        
        # 创建logger
        self.logger = logging.getLogger(name)
        self.logger.setLevel(logging.DEBUG)  # 所有级别都记录，但handler控制输出
        self.logger.handlers = []
        
        # Console handler - 根据设置控制DEBUG
        ch = logging.StreamHandler(sys.stdout)
        if debug_enabled:
            ch.setLevel(logging.DEBUG)
        else:
            ch.setLevel(logging.INFO)
        ch.setFormatter(logging.Formatter(
            '%(asctime)s | %(name)-20s | %(levelname)-8s | %(message)s',
            datefmt='%H:%M:%S'
        ))
        self.logger.addHandler(ch)
        
        # File handler (if specified)
        if log_file:
            fh = logging.FileHandler(log_file)
            fh.setLevel(logging.DEBUG)
            fh.setFormatter(logging.Formatter(
                '%(asctime)s | %(name)-20s | %(levelname)-8s | %(message)s',
                datefmt='%Y-%m-%d %H:%M:%S'
            ))
            self.logger.addHandler(fh)
    
    def log(self, level: str, message: str):
        """打印日志"""
        self.call_count += 1
        elapsed = time.time() - self.start_time
        full_message = f"[{elapsed:.3f}s] {message}"
        
        if level == 'DEBUG':
            self.logger.debug(full_message)
        elif level == 'INFO':
            self.logger.info(full_message)
        elif level == 'WARNING':
            self.logger.warning(full_message)
        elif level == 'ERROR':
            self.logger.error(full_message)
        elif level == 'CRITICAL':
            self.logger.critical(full_message)
    
    def debug(self, message: str):
        self.log('DEBUG', message)
    
    def info(self, message: str):
        self.log('INFO', message)
    
    def warning(self, message: str):
        self.log('WARNING', message)
    
    def error(self, message: str):
        self.log('ERROR', message)
    
    def critical(self, message: str):
        self.log('CRITICAL', message)
    
    def section(self, title: str):
        """打印分段标题"""
        self.info(f"{'='*60}")
        self.info(f"  {title}")
        self.info(f"{'='*60}")
    
    def subsection(self, title: str):
        """打印子段标题"""
        self.info(f"--- {title} ---")
    
    def stat(self, key: str, value):
        """打印统计信息"""
        self.info(f"📊 {key}: {value}")
    
    def success(self, message: str):
        """打印成功信息"""
        self.info(f"✅ {message}")
    
    def failure(self, message: str):
        """打印失败信息"""
        self.error(f"❌ {message}")
    
    def progress(self, current: int, total: int, message: str = ""):
        """打印进度"""
        pct = current / total * 100 if total > 0 else 0
        self.info(f"📍 {current}/{total} ({pct:.1f}%) {message}")
    
    def summary(self):
        """打印摘要"""
        elapsed = time.time() - self.start_time
        self.section("执行摘要")
        self.info(f"总调用次数: {self.call_count}")
        self.info(f"总执行时间: {elapsed:.3f}秒")
        self.info(f"平均每次调用: {elapsed/self.call_count*1000:.2f}ms" if self.call_count > 0 else "无调用")

# 全局logger实例
_loggers = {}

def get_logger(name: str, log_file: str = None, debug_enabled: bool = None) -> DetailedLogger:
    """获取logger实例"""
    if name not in _loggers:
        _loggers[name] = DetailedLogger(name, log_file, debug_enabled)
    return _loggers[name]
