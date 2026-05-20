import os
from dataclasses import dataclass

@dataclass
class Config:
    DATABASE_PATH: str = "code_graph.db"
    BATCH_SIZE: int = 1000
    MAX_WORKERS: int = os.cpu_count() or 8
    ARKTS_EXTENSIONS: tuple = (".ets", ".arkts", ".ts")
    LLM_API_KEY: str = "sk-uqelhavcdhfxjzjesdenxpbtqombamjniazzjtbssmdcwdvg"
    LLM_API_URL: str = "https://api.siliconflow.cn/v1/chat/completions"
    LLM_MODEL: str = "Qwen/Qwen2.5-7B-Instruct"
    WEB_HOST: str = "127.0.0.1"
    WEB_PORT: int = 8000

config = Config()

def get_project_root() -> str:
    return os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))