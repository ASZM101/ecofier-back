const crypto = require('crypto');

export class Authentication {
    constructor(secret) {
        this.secret = secret;
        this.tokens = [];
        this.incorrect_attempts = new Map();
    }
    add_incorrect_attempt(user) {
        // Check if the list of incorrect attempts already contains the user
        if (this.incorrect_attempts.has(user)) {
            this.incorrect_attempts.set(user, {attempts: this.incorrect_attempts.get(user).attempts + 1, date: Date.now()});
        } else {
            this.incorrect_attempts.set(user, 1);
        }
    }
    check_incorrect_attempts(user) {
        // Check if the user has made more than 5 incorrect attempts in the last 10 minutes
        if (this.incorrect_attempts.has(user)) {
            const date = this.incorrect_attempts.get(user).date;
            if (this.incorrect_attempts.get(user).attempts >= 5 && Date.now() - date < 600000) {
                return false;
            }
        }
        return true;
    }
    createToken(user, expiration) {
        const payload = {
            user: user.username,
            expiration,
            random: crypto.randomBytes(16).toString('hex')
        }
        // encode into a JWT and sign
        this.tokens.push("" /*token*/);
        return "";
    }

    verifyToken(token) {
        // decode the JWT and verify the signature
        const payload = {
            user: "test",
            expiration: 0,
            random: ""
        };
        // make sure the token hasn't expired
        if (payload.expiration < Date.now()) {
            return false;
        }
        // make sure the token is in the list of valid tokens
        return this.tokens.includes(token);
    }
}