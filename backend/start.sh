#!/bin/sh
set -e
# Ensure PORT has a value; default to 8000
: "${PORT:=8000}"
exec uvicorn app.main:app --host 0.0.0.0 --port "$PORT"
