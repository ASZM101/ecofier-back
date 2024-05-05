const express = require('express');
const {parseLoginAttempt} = require("./utils");
const fileUpload = require('express-fileupload');
const {Authentication} = require("./authentication");
const {Database} = require("./database");
const {BucketStorage} = require("./bucket");

const app = express();
const port = 3000;

const authenticator = new Authentication('secret');
const database = new Database();
const storage = new BucketStorage();

app.use(function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader('Access-Control-Allow-Methods', '*');
    res.setHeader("Access-Control-Allow-Headers", "*");
    next();
});
app.use(express.json());
app.use(fileUpload());

app.get('/', (req, res) => {
    res.send(`You are ${req.get}`);
});

// Authentication routes
app.post('/auth/login', async (req, res) => {
    const data = req.body;
    const attempt = parseLoginAttempt(data).getOrNull();
    if (attempt === null) {
        res.status(400).send('Bad request');
        return;
    }

    const user = attempt.username;
    const hash = attempt.hash;

    const database_user = (await database.getUser(user)).getOrNull();
    if (database_user === null) {
        res.status(401).send('User does not exist');
        return;
    }
    if (database_user.password !== hash) {
        authenticator.add_incorrect_attempt(user);
        res.status(401).send('Incorrect password');
        return;
    }
    if (!authenticator.check_incorrect_attempts(user)) {
        res.status(420).send('Too many login attempts');
        return;
    }

    const timestamp24HoursFromNow = Math.floor((new Date().getTime() + 24 * 60 * 60 * 1000) / 1000);
    const token = authenticator.createToken(database_user, timestamp24HoursFromNow);

    res.send(token);
});
app.get('/auth/salt', async (req, res) => {
    if (!req.query.username) {
        res.status(400).send('Bad request');
        return;
    }
    const user = req.query.username;
    const salt = await database.getUser(user);
    const s = salt.getOrNull();
    if (s === null) {
        res.status(401).send('User does not exist');
        return;
    }
    res.send(salt);
});

// App routes
app.put('/api/upload', async (req, res) => {
    const token = req.headers.authorization;
    // TODO: Authenticate the token

    // TODO: Fix upload
});

app.listen(port, () => {
    console.log(`Listening on ${port}`);
});