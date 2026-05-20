import argparse
import time
import os
from .core.processor import CodeProcessor
from .config import config
from .llm.query_engine import QueryEngine

def main():
    parser = argparse.ArgumentParser(description='ArkTS Code Graph - 百万行级代码知识图谱构建工具')
    subparsers = parser.add_subparsers(dest='command', help='Available commands')
    
    build_parser = subparsers.add_parser('build', help='构建代码知识图谱')
    build_parser.add_argument('project_path', help='项目目录路径')
    build_parser.add_argument('--db', default=config.DATABASE_PATH, help='数据库文件路径')
    build_parser.add_argument('--force', action='store_true', help='强制重新解析所有文件')
    
    update_parser = subparsers.add_parser('update', help='更新单个文件')
    update_parser.add_argument('file_path', help='要更新的文件路径')
    update_parser.add_argument('--db', default=config.DATABASE_PATH, help='数据库文件路径')
    
    stats_parser = subparsers.add_parser('stats', help='查看数据库统计信息')
    stats_parser.add_argument('--db', default=config.DATABASE_PATH, help='数据库文件路径')
    
    query_parser = subparsers.add_parser('query', help='使用自然语言查询代码图谱')
    query_parser.add_argument('question', help='查询问题')
    query_parser.add_argument('--db', default=config.DATABASE_PATH, help='数据库文件路径')
    
    serve_parser = subparsers.add_parser('serve', help='启动可视化Web服务')
    serve_parser.add_argument('--host', default=config.WEB_HOST, help='服务地址')
    serve_parser.add_argument('--port', type=int, default=config.WEB_PORT, help='服务端口')
    serve_parser.add_argument('--db', default=config.DATABASE_PATH, help='数据库文件路径')
    
    args = parser.parse_args()
    
    if args.command == 'build':
        run_build(args)
    elif args.command == 'update':
        run_update(args)
    elif args.command == 'stats':
        run_stats(args)
    elif args.command == 'query':
        run_query(args)
    elif args.command == 'serve':
        run_serve(args)
    else:
        parser.print_help()

def run_build(args):
    print(f'开始构建代码知识图谱...')
    print(f'项目路径: {args.project_path}')
    print(f'数据库路径: {args.db}')
    print(f'CPU核心数: {config.MAX_WORKERS}')
    
    start_time = time.time()
    
    processor = CodeProcessor(args.db, max_workers=config.MAX_WORKERS, batch_size=config.BATCH_SIZE)
    stats = processor.build_graph(args.project_path, args.force)
    processor.close()
    
    elapsed_time = time.time() - start_time
    
    print(f'\n构建完成!')
    print(f'耗时: {elapsed_time:.2f} 秒')
    print(f'处理文件数: {stats["processed_files"]}')
    print(f'文件总数: {stats["files"]}')
    print(f'类数量: {stats["classes"]}')
    print(f'方法数量: {stats["methods"]}')
    print(f'调用关系: {stats["calls"]}')
    print(f'组件关系: {stats["components"]}')
    
    db_size = os.path.getsize(args.db) / (1024 * 1024) if os.path.exists(args.db) else 0
    print(f'数据库大小: {db_size:.2f} MB')

def run_update(args):
    print(f'更新文件: {args.file_path}')
    
    processor = CodeProcessor(args.db)
    result = processor.update_file(args.file_path)
    processor.close()
    
    if result:
        print('文件已更新')
    else:
        print('文件未变更，无需更新')

def run_stats(args):
    processor = CodeProcessor(args.db)
    stats = processor.db.get_stats()
    processor.close()
    
    print('代码知识图谱统计信息:')
    print(f'文件数: {stats["files"]}')
    print(f'类数量: {stats["classes"]}')
    print(f'方法数量: {stats["methods"]}')
    print(f'调用关系: {stats["calls"]}')
    print(f'组件关系: {stats["components"]}')
    
    db_size = os.path.getsize(args.db) / (1024 * 1024) if os.path.exists(args.db) else 0
    print(f'数据库大小: {db_size:.2f} MB')

def run_query(args):
    print(f'查询问题: {args.question}')
    
    engine = QueryEngine(args.db)
    result = engine.query(args.question)
    engine.close()
    
    print('\n查询结果:')
    print(result)

def run_serve(args):
    from .web.server import start_server
    print(f'启动Web服务: http://{args.host}:{args.port}')
    print(f'数据库路径: {args.db}')
    start_server(args.host, args.port, args.db)

if __name__ == '__main__':
    main()