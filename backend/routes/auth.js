const express = require('express');
const router = express.Router();



router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    const payload = {
        username,
        password
    };


    try {
        if(username==='admin' && password==='admin'){
            res.json({ message: 'Login successful' });
        }
        else
        {
            res.status(401).json({ message: 'Invalid credentials' });

        }
        return;
        const bucketName='atom-construction-bucket-eu';

        const Key='control-app/login_database.json'
        const params = {
            Bucket: bucketName,
            Key
        };

        const data = await s3.getObject(params).promise();
        const db=JSON.parse(data.Body.toString());
        // const params = {
        //     FunctionName: 'control_app_login',
        //     Payload: JSON.stringify(payload),
        // };
        // const data = await lambda.invoke(params).promise();
        // const responsePayload = JSON.parse(data.Payload);
        //
        // const loginResult = responsePayload.body;
        //
        // if (loginResult === 'True') {
        // } else {
        //     res.status(401).json({ message: 'Invalid credentials' });
        // }
        if(db[username]&&db[username]===password){
            res.json({ message: 'Login successful' });

        }
        else {
            res.status(401).json({ message: 'Invalid credentials' });
        }

    } catch (error) {
        console.error('Error invoking Lambda function:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
