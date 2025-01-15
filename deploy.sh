#!/bin/bash

# Set the target script path
TARGET_SCRIPT="./deploy_manager.sh"

# Check if the target script exists
if [ ! -f "$TARGET_SCRIPT" ]; then
  echo "Error: $TARGET_SCRIPT does not exist!"
  exit 1
fi

# Make the target script executable if it's not already
chmod +x "$TARGET_SCRIPT"

# Run the target script
echo "Running $TARGET_SCRIPT..."
bash "$TARGET_SCRIPT"

# Check if the script executed successfully
if [ $? -eq 0 ]; then
  echo "$TARGET_SCRIPT executed successfully!"
else
  echo "Error: $TARGET_SCRIPT failed!"
  exit 1
fi
