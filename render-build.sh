#!/usr/bin/env bash
# exit on error
set -o errexit

echo "Installing Python dependencies..."
cd backend
pip install -r requirements.txt

echo "Building React frontend..."
cd ../frontend
npm install
npm run build
