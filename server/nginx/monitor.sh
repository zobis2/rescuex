#!/bin/bash

# Services to check
services=(
  "front-end:3000"
  "back-end:5000"

)

# Function to check service availability
check_service() {
  service=$1
  host=$(echo $service | cut -d: -f1)
  port=$(echo $service | cut -d: -f2)
  if ! curl -s --head --request GET http://$host:$port | grep "200 OK" > /dev/null; then
    return 1
  fi
  return 0
}

while true; do
  # Check all services
  for service in "${services[@]}"; do
    if ! check_service $service; then
      echo "Service $service is down. Restarting nginx."
      nginx -s reload
    fi
  done
  sleep 100
done
