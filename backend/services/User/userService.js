const {awsS3} = require("../awsServices");

const BUCKET_NAME = "rescuex-eu-bucket";
const FILE_KEY = "db/db.json";
const s3=awsS3;
const getUsers = async () => {
    try {
        const data = await s3
            .getObject({ Bucket: BUCKET_NAME, Key: FILE_KEY })
            .promise();
        return JSON.parse(data.Body.toString());
    } catch (error) {
        if (error.code === "NoSuchKey") {
            return { users: [] }; // Return an empty list if the file doesn't exist
        }
        throw new Error("Error fetching users");
    }
};

const saveUser = async (user) => {
    const db = await getUsers();
    const { users } = db;

    // Check if the username already exists
    if (users.some((u) => u.username === user.username)) {
        throw new Error("User already exists");
    }

    // Add new user
    users.push(user);

    // Save back to S3
    const updatedData = JSON.stringify({ users }, null, 2);
    await s3
        .putObject({
            Bucket: BUCKET_NAME,
            Key: FILE_KEY,
            Body: updatedData,
            ContentType: "application/json",
        })
        .promise();
};

module.exports = { getUsers, saveUser };
