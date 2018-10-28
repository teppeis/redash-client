#!/usr/bin/env bash
# Clean up and set up Redash service for testing

set -eux

basedir=$(cd "$(dirname "$0")" && pwd)
cd "$basedir"

# Clean up
echo 'Clean up existing Redash...'
docker-compose down
rm -rf .postgres-data

# Set up
mkdir -p .postgres-data
echo 'Create Redash DB...'
docker-compose run --rm server create_db
echo 'Load Sample data...'
docker cp ./setup-sample-db.sh "$(docker-compose ps -q postgres)":/tmp/
docker-compose exec postgres bash /tmp/setup-sample-db.sh
echo 'Start Redash services...'
docker cp ./setup-sample-db.sh "$(docker-compose ps -q postgres)":/tmp/
docker-compose up -d
echo 'Initialize Redash...'
node ./init.js
echo 'Setting done successfully!'
echo 'Open http://localhost/'
