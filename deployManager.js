const { execSync } = require("child_process");
const { hashElement } = require("folder-hash");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto"); // For MD5 hashing

const baseDir = process.cwd();
const outputsDir = path.join(baseDir, "outputs", "builds");
const hashesFile = path.join(baseDir, ".hashes");
const latestCommitFile = path.join(baseDir, ".latest_commit");

// Directories to hash
const directories = {
  backend: "./backend",
  // backend_flask: "src",
  // platform_backend: "atom_platform/backend",
  frontend: "./frontend",
  // frontend_platform: "atom_platform/frontend",
};

const excludeOptions = {
  folders: { exclude: ["node_modules", "build"] },
  files: { include: ["*"] },
};
// Function to convert hash to readable MD5
function convertToReadableHash(input) {
  return crypto.createHash("md5").update(input).digest("hex").slice(0, 8); // Shortened MD5 hash
}
// Helper Functions
function runCommand(command) {
  console.log(`Running: ${command}`);
  execSync(command, { stdio: "inherit" });
}
// Stop and Remove All Containers
// Clean Docker Containers
function cleanDockerContainers() {
  try {
    // Get IDs of all running containers
    const runningContainers = execSync('docker ps -q').toString().trim().replace(/\n/g, ' '); // Replace newlines with spaces
    if (runningContainers) {
      // Stop running containers
      runCommand(`docker stop ${runningContainers}`);
    } else {
      console.log('No running containers to stop.');
    }

    // Get IDs of all containers (including stopped ones)
    const allContainers = execSync('docker ps -aq').toString().trim().replace(/\n/g, ' '); // Replace newlines with spaces
    if (allContainers) {
      // Remove all containers
      runCommand(`docker rm ${allContainers}`);
    } else {
      console.log('No containers to remove.');
    }

    console.log('Docker cleanup completed successfully.');
  } catch (error) {
    console.error('Error while cleaning Docker containers:', error.message);
  }
}
async function calculateHashes() {
  console.log("Calculating hashes...");
  const hashes = {};
  for (const [key, dir] of Object.entries(directories)) {
    const fullPath = path.join(baseDir, dir);
    if (fs.existsSync(fullPath)) {
      const result = await hashElement(fullPath, excludeOptions);
      hashes[key] = convertToReadableHash(result.hash);
      console.log(`${key}: ${result.hash}`);
    } else {
      console.warn(`Warning: ${fullPath} does not exist.`);
      hashes[key] = "";
    }
  }
  fs.writeFileSync(
    hashesFile,
    Object.entries(hashes)
      .map(([k, v]) => `${k}=${v}`)
      .join("\n"),
  );
  console.log(`Hashes saved to ${hashesFile}`);
  return hashes;
}

function cleanOldBuilds(buildDir, context, currentHash) {
  if (!fs.existsSync(buildDir)) return;
  console.log(`Cleaning old builds in ${buildDir}...`);

  const contextBuild = path.join(buildDir, context);
  if (!fs.existsSync(contextBuild)) return;

  fs.readdirSync(contextBuild).forEach((item) => {
    const fullPath = path.join(contextBuild, item);
    if (fs.statSync(fullPath).isDirectory() && item !== currentHash) {
      console.log(`Removing old build: ${fullPath}`);
      fs.rmSync(fullPath, { recursive: true, force: true });
    }
  });
}

function buildFrontend(name, dir, hash) {
  const buildPath = path.join(outputsDir, name, hash);
  if (
    fs.existsSync(buildPath) &&
    fs.readdirSync(buildPath).some((file) => file.endsWith(".html"))
  ) {
    console.log(
      `Skipping ${name} build as it already exists with hash ${hash}`,
    );
    return;
  }

  console.log(`Building ${name}...`);
  runCommand(`cd ${dir} && npm install && npm run build`);
  fs.mkdirSync(buildPath, { recursive: true });
  fs.renameSync(path.join(dir, "build"), buildPath);
  console.log(`${name} build completed: ${buildPath}`);
}

function buildDockerImage(name, context, tag) {
  const imageExists = execSync(`docker images -q ${name}:${tag}`)
    .toString()
    .trim();
  if (imageExists) {
    console.log(`Skipping ${name}:${tag} build as image already exists.`);
    return;
  }
  console.log(`Building Docker image ${name}:${tag}...`);
  runCommand(`docker build -t ${name}:${tag} ${context}`);
}
async function checkContainerIsUp(containerName) {
  console.log(
    `Checking if PostgreSQL container (${containerName}) is healthy...`,
  );

  const maxRetries = 10; // Maximum retries
  const delay = 5000; // Delay in milliseconds (5 seconds)
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      const status = execSync(
        `docker inspect -f '{{.State.Health.Status}}' ${containerName}`,
      )
        .toString()
        .trim();

      if (status === "healthy") {
        console.log("PostgreSQL container is healthy and running.");
        return; // Exit the function if the container is healthy
      } else if (status === "starting") {
        console.log(
          `PostgreSQL container is starting. Attempt ${attempt + 1}/${maxRetries}. Retrying in ${delay / 1000} seconds...`,
        );
        attempt++;
        await sleep(delay);
      } else {
        console.error(
          `PostgreSQL container is not healthy. Current status: ${status}`,
        );
        process.exit(1);
      }
    } catch (error) {
      console.error(
        `Error: Unable to check PostgreSQL container status. Ensure the container (${containerName}) exists and is running.`,
      );
      process.exit(1);
    }
  }

  console.error(
    "PostgreSQL container did not become healthy within the expected time.",
  );
  process.exit(1); // Exit if max retries are exceeded
}

// Helper function to sleep for a given duration
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
function cleanDockerTags(imageName, currentTag) {
  console.log(`Cleaning old tags for ${imageName} except ${currentTag}...`);

  try {
    // List all tags for the image
    const tags = execSync(
      `docker images --filter=reference="${imageName}:*" --format "{{.Tag}}"`,
    )
      .toString()
      .trim()
      .split("\n")
      .filter((tag) => tag); // Filter out empty lines

    if (!tags.length) {
      console.log(`No tags found for image ${imageName}.`);
      return;
    }

    tags.forEach((tag) => {
      if (tag !== currentTag) {
        console.log(`Deleting old tag: ${imageName}:${tag}`);
        execSync(`docker rmi -f ${imageName}:${tag}`);
      }
    });

    console.log(`Old tags for ${imageName} cleaned successfully.`);
  } catch (error) {
    console.error(`Error while cleaning tags for ${imageName}:`, error.message);
  }
}
async function startDockerStacks(hashes) {
  console.log("Building Docker images with tags...");

  const services = [
    { name: "back-end", dir: "./backend", hash: hashes.backend },
    // { name: "back-end-flask", dir: "src", hash: hashes.backend_flask },
    // {
    //   name: "atom-platform-backend",
    //   dir: "atom_platform/backend",
    //   hash: hashes.platform_backend,
    // },
  ];

  // Build Docker images
  services.forEach((service) => {
    const imageTag = `${service.name}:${service.hash}`;
    cleanDockerTags(service.name, service.hash);
    const imageExists = execSync(`docker images -q ${imageTag}`)
      .toString()
      .trim();

    if (!imageExists) {
      console.log(`Building image ${imageTag}...`);
      runCommand(
        `docker build -t ${imageTag} ${path.join(baseDir, service.dir)}`,
      );
    } else {
      console.log(`Skipping build for ${imageTag}, image already exists.`);
    }
  });

  // Start Docker Compose stacks
  console.log("Starting Docker stacks...");
  const frontendHash = hashes.frontend;
  // const frontendPlatformHash = hashes.frontend_platform;
// Stop and remove nginx container if it exists
  function cleanNginxContainer() {
    try {
      console.log("Checking for existing nginx container...");

      // Check if nginx container exists
      const nginxContainer = execSync(
          "docker ps -aq --filter name=nginx"
      )
          .toString()
          .trim();

      if (nginxContainer) {
        console.log(`Stopping nginx container (${nginxContainer})...`);
        runCommand(`docker stop ${nginxContainer}`);
        console.log(`Removing nginx container (${nginxContainer})...`);
        runCommand(`docker rm ${nginxContainer}`);
      } else {
        console.log("No existing nginx container found.");
      }

      // Check if nginx image exists
      console.log("Checking for existing nginx image...");
      const nginxImage = execSync(
          "docker images -q nginx"
      )
          .toString()
          .trim();

      if (nginxImage) {
        console.log(`Removing nginx image (${nginxImage})...`);
        runCommand(`docker rmi -f nginx`);
      } else {
        console.log("No existing nginx image found.");
      }

      console.log("Nginx cleanup completed.");
    } catch (error) {
      console.error("Error during nginx cleanup:", error.message);
    }
  }

// Perform nginx cleanup
  cleanNginxContainer();

  // Start Docker Compose
  runCommand(
    `cd ${path.join(baseDir, "server")} && FRONTEND_ADMIN=${frontendHash}  docker-compose up --build -d`,
  );

  async function copyBuildsOfFrontEndAndWaitForNginx() {
    // Wait for NGINX to be up
    async function waitForNginx(containerName) {
      console.log(`Waiting for NGINX container (${containerName}) to be up...`);
      let retries = 10;
      while (retries > 0) {
        try {
          runCommand(`docker exec ${containerName} nginx -t`);
          console.log("NGINX is up and running.");
          return;
        } catch (error) {
          console.log(`NGINX not ready. Retrying... (${10 - retries}/10)`);
          retries--;
          if (retries === 0) {
            console.error("NGINX did not start successfully. Exiting...");
            process.exit(1);
          }
          await sleep(5000); // Wait 5 seconds before retrying
        }
      }
    }

    function copyFrontendFiles(containerName, sourcePath, targetPath) {
      console.log(
        `Copying files from ${sourcePath} to ${targetPath} in ${containerName}...`,
      );
      runCommand(`docker cp ${sourcePath} ${containerName}:${targetPath}`);
    }

    // Wait for NGINX to be ready
    const nginxContainerName = "nginx"; // Adjust based on your container name
    await waitForNginx(nginxContainerName);

    // Copy frontend builds into the container
    const adminSourcePath = path.join(
      outputsDir,
      "frontend",
      frontendHash,
    );
    // const platformSourcePath = path.join(
    //   outputsDir,
    //   "frontend-platform",
    //   frontendPlatformHash,
    // );

    copyFrontendFiles(
      nginxContainerName,
      adminSourcePath,
      "/usr/share/nginx/admin",
    );
    // copyFrontendFiles(
    //   nginxContainerName,
    //   platformSourcePath,
    //   "/usr/share/nginx/platform",
    // );
  }

  await checkContainerIsUp("postgres"); /// postgres is up.
  runCommand(
    `cd ${path.join(baseDir, "")} && docker-compose down && BACKEND_TAG=${hashes.backend} docker-compose up -d`,
  );

  await copyBuildsOfFrontEndAndWaitForNginx();
}

// Main Process
(async () => {

  console.log("Pulling latest changes...");
  runCommand("git pull origin main");
  const commitId = execSync("git rev-parse --short origin/main")
    .toString()
    .trim();
  fs.writeFileSync(latestCommitFile, commitId);
  console.log(`Latest commit ID saved: ${commitId}`);
  // cleanDockerContainers()

  const hashes = await calculateHashes();
  // Clean and build frontend
  cleanOldBuilds(outputsDir, "frontend", hashes.frontend);
  buildFrontend(
    "frontend",
    path.join(baseDir, directories.frontend),
    hashes.frontend,
  );


  // Build Docker images
  buildDockerImage(
    "back-end",
    path.join(baseDir, directories.backend),
    hashes.backend,
  );

  function ensureNodeNetwork() {
    console.log("Checking if 'node-network' exists...");

    try {
      // Check if the network exists
      const existingNetworks = execSync(
        "docker network ls --filter name=node-network --format '{{.Name}}'",
      )
        .toString()
        .trim()
        .split("\n");

      if (existingNetworks.includes("node-network")) {
        console.log("'node-network' already exists.");
      } else {
        // Create the network if it doesn't exist
        console.log("'node-network' not found. Creating it...");
        execSync("docker network create node-network");
        console.log("'node-network' created successfully.");
      }
    } catch (error) {
      console.error("Error while ensuring 'node-network':", error.message);
      process.exit(1); // Exit if there’s an error creating the network
    }
  }

  // Call the function
  ensureNodeNetwork();

  // Start Docker stacks
  await startDockerStacks(hashes);

  console.log("Deployment completed successfully!");
})();
