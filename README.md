# Ecofier

Ecofier is an application created for the [CS Base Climate Hackathon](https://csbase-climatehack.devpost.com).

Ecofier is an app where users can take a picture of their room, and the app will suggest ideas to make it more
environmentally-friendly or sustainable. The app will also provide a score based on how sustainable the room is.

This project is the backend of the app, written in NodeJS and express.js

## Installation
1. Clone the repository
2. Run `npm install` to install the dependencies
3. Run `npm run main` to start the server
4. The server will be running on `http://localhost:3000`

## API Endpoints

### GET /

- Description: Returns the IP address of the client
- Response: `You are {IP}`

### POST /auth/login

- Description: Authenticates a user's login attempt
- Request Body:
    - `username`: The user's unique username
    - `hash`: The hashed password
- Response: A JWT token if successful, or an error message

### GET /auth/salt

- Description: Returns the salt for a given user
- Query Parameters:
    - `username`: The user's unique username
- Response: The user's salt if successful, or an error message

### PUT /api/queue_inference

- Description: Queues an inference job
- Request Body:
    - `blob`: The image, in base64 format
- Response: The job ID if successful, or an error message

### GET /api/status

- Description: Returns the status of a job
- Query Parameters:
    - `job`: The job ID
- Response: The job's position in the queue or the job result if successful, or an error message