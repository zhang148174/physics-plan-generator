#!/bin/bash
# 美博教育 - 高中物理学习规划生成器 启动脚本 (Mac/Linux)

echo ""
echo "╔════════════════════════════════════════════╗"
echo "║  📚 美博教育 - 高中物理学习规划生成器     ║"
echo "╚════════════════════════════════════════════╝"
echo ""

# 检查 Python
if ! command -v python3 &>/dev/null && ! command -v python &>/dev/null; then
    echo "❌ 未检测到Python，请先安装Python 3.7+"
    exit 1
fi

# 确定 Python 命令
PYTHON=$(command -v python3 || command -v python)
echo "✅ Python已检测到: $PYTHON"
echo ""

# 设置端口和API地址
PORT=${1:-8888}
API_URL=${2:-"http://110.185.163.23:50000/v1"}

echo "🚀 正在启动服务器..."
echo "   端口: $PORT"
echo "   API:  $API_URL"
echo ""

# 启动服务器
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
$PYTHON "$SCRIPT_DIR/server.py" "$PORT" "$API_URL"
