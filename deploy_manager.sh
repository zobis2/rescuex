
base_dir=$(pwd)


# Ensure Node.js dependencies are installed
if [ ! -d "$base_dir/node_modules" ]; then
    echo "Installing Node.js dependencies..."
    npm install folder-hash fs path crypto
fi


# Run Node.js script for hash calculation
echo "Running Node.js script to calculate hashes..."
node "$base_dir/deployManager.js"
