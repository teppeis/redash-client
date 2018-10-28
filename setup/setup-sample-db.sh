#!/usr/bin/env bash
# Run in postgres container

set -eux

basedir=$(cd "$(dirname "$0")" && pwd)
cd "$basedir"
createdb -U postgres dvdrental
wget http://www.postgresqltutorial.com/wp-content/uploads/2017/10/dvdrental.zip
unzip ./dvdrental.zip
pg_restore -U postgres -d dvdrental ./dvdrental.tar
