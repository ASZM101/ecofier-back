import express from 'express';
import {parseLoginAttempt} from "./utils.js";
import {Authentication} from "./authentication.js";
import {Database} from "./database.js";
import {Inference} from "./inference.js";

const app = express();
const port = 3000;

const authenticator = new Authentication('secret');
const database = new Database();
const inference = new Inference();

const generateJobId = () => {
    const lettersOrNumbers = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let jobId = '';
    for (let i = 0; i < 32; i++) {
        jobId += lettersOrNumbers.charAt(Math.floor(Math.random() * lettersOrNumbers.length));
    }
    return jobId;
}

console.log(
    "Using environment variables:\nGOOGLE_CLOUD_SECRET=" + process.env.GOOGLE_CLOUD_SECRET + "\nHF_SECRET=" + process.env.HF_SECRET + "\nJWT_SECRET=" + process.env.JWT_SECRET
)

app.use(function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader('Access-Control-Allow-Methods', '*');
    res.setHeader("Access-Control-Allow-Headers", "*");
    next();
});
app.use(express.json());

app.get('/', (req, res) => {
    res.send(`You are ${req.ip}`);
});

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

const authenticate = (req, res) => {
    const auth = req.headers.authorization;
    if (!auth) {
        res.status(401).send('Unauthorized');
        return null;
    }
    const token = auth.split(' ')[1];
    const user = authenticator.verifyToken(token);
    if (user.isErr()) {
        res.status(401).send('Unauthorized');
        return null;
    }
    return user;
}

app.put('/api/queue_inference', async (req, res) => {
    const user = authenticate(req, res);
    if (user === null) {
        return;
    }
    const data = req.body;
    const isUserPriority = user.inner().priority;
    const jobId = generateJobId();
    if (isUserPriority) {
        inference.addJob(
            {
                blob: data.blob,
                job_id: "normal-" + jobId,
            }
        )
        res.status(200).send({job_id: "normal-" + jobId});
    }
});
app.get('/api/status', async (req, res) => {
    const user = authenticate(req, res);
    if (user === null) {
        return;
    }
    const data = req.query;
    if (data['job'] === undefined) {
        res.status(400).send('Bad request');
        return;
    }
    const job = inference.getPositionInQueue(data['job']);
    if (job === -1) {
        res.status(404).send({
            'err': "Job not found"
        });
        return;
    }
    if (job === 1) {
        const jobResult = await inference.getJobResult(data['job']);
        if (jobResult.isErr()) {
            res.status(500).send({
                'err': jobResult.inner()
            });
            return;
        }
        res.status(200).send(jobResult.inner());
        return;
    }
    res.status(200).send(
        {
            position: job,
        }
    )
});
app.listen(port, () => {
    console.log(`Listening on ${port}`);
});