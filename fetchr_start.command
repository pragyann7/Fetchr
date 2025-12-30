#!/bin/bash
# ===== Fetchr Startup Script =====

PROJECT_DIR="/Users/pragyanshrestha/Project/Fetchr/Fetchr"

VENV_DIR="/Users/pragyanshrestha/Project/Fetchr/Fetchr/.venv"

cd "$PROJECT_DIR" || exit

if [ -d "$VENV_DIR" ]; then
    source "$VENV_DIR/bin/activate"
fi

echo "Starting Fetche Proxy Server on http://127.0.0.1:9000"
python manage.py runserver 9000 &

sleep 2

open "http://127.0.0.1:9000/"