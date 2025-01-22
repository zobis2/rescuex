const express = require("express");
const {getUsers, saveUser} = require("../services/User/userService");
const router = express.Router();

// Get all users
router.get("/", async (req, res) => {
    try {
        const db = await getUsers();
        res.json(db.users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).send("Error fetching users");
    }
});

// Save a new user
router.post("/", async (req, res) => {
    try {
        const newUser = req.body;
        if (!newUser.email || !newUser.password) {
            throw new Error("Invalid email or password");
        }
        await saveUser(newUser);
        res.send("User added successfully");
    } catch (error) {
        console.error("Error saving user:", error);
        res.status(400).send(error.message);
    }
});

module.exports = router;
