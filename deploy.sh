#!/bin/bash
sudo fallocate -l 1G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

logfile="deploy.log"
network_name="node-network"

echo "Navigating to the GilGal directory..." | tee -a $logfile
#cd ~/GilGal

echo "Cleaning up system packages..." | tee -a $logfile
#sudo apt-get clean && sudo apt-get autoremove -y && sudo rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

echo "Pulling the latest changes from the GitHub repository..." | tee -a $logfile
git pull origin main
docker-compose down
# Exclude Postgres container and volume from removal
echo "Removing all containers except Postgres..." | tee -a $logfile
if [ "$(docker ps -aq -f name=postgres)" ]; then
    docker ps -aq | grep -v "$(docker ps -aq -f name=postgres)" | xargs -r docker rm -f
    echo "Removed all containers except Postgres." | tee -a $logfile
else
    echo "No containers to remove." | tee -a $logfile
fi

echo "Removing all Docker images except for Postgres..." | tee -a $logfile
if [ "$(docker images -q)" ]; then
    docker images -q | grep -v "$(docker images -q -f reference=postgres*)" | xargs -r docker rmi -f
    echo "Removed all images except Postgres." | tee -a $logfile
else
    echo "No images to remove." | tee -a $logfile
fi

echo "Pruning Docker networks and volumes (excluding Postgres)..." | tee -a $logfile
docker network prune -f
docker volume prune -f --filter "label!=postgres"
echo "Docker networks and volumes pruned." | tee -a $logfile

echo "Removing dangling Docker images..." | tee -a $logfile
docker image prune -f
echo "Dangling Docker images removed." | tee -a $logfile

echo "Pruning unused containers..." | tee -a $logfile
docker container prune -f
echo "Unused containers pruned." | tee -a $logfile

echo "Performing final Docker system prune (excluding Postgres volumes)..." | tee -a $logfile
docker system prune -a --volumes -f --filter "label!=postgres"
echo "Final system prune complete." | tee -a $logfile

# Check if the Docker network exists
echo "Checking if the Docker network $network_name exists..." | tee -a $logfile
if ! docker network ls | grep -q $network_name; then
    echo "Creating Docker network: $network_name" | tee -a $logfile
    docker network create $network_name | tee -a $logfile
    if [ $? -eq 0 ]; then
        echo "Docker network $network_name created successfully." | tee -a $logfile
    else
        echo "Failed to create Docker network $network_name. Exiting." | tee -a $logfile
        exit 1
    fi
else
    echo "Docker network $network_name already exists." | tee -a $logfile
fi

#echo "Navigating to control_app_web directory..." | tee -a $logfile
#cd control_app_web

echo "Running docker-compose to build and start containers in GilGa§l..." | tee -a $logfile

echo "Starting backend service..." | tee -a $logfile
docker-compose up --build -d back-end | tee -a $logfile
sleep 10  # Allow backend to start properly

echo "Starting frontend service..." | tee -a $logfile
docker-compose up --build -d front-end | tee -a $logfile
sleep 10

echo "Starting nginx service..." | tee -a $logfile
docker-compose up --build -d nginx | tee -a $logfile

echo "All services started successfully." | tee -a $logfile

#echo "Docker-compose executed for control_app_web." | tee -a $logfile
#
#echo "Navigating to atom_platform directory..." | tee -a $logfile
#cd ../atom_platform
#
#echo "Running docker-compose to build and start containers in atom_platform..." | tee -a $logfile
#docker-compose up --build -d
#echo "Docker-compose executed for atom_platform." | tee -a $logfile
