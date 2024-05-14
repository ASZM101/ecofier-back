import {Option, Result} from "./utils.js";

import {Firestore} from '@google-cloud/firestore';

// This file interfaces with the backend hosted in Firebase.
export class Database {
    constructor() {
        this.db = new Firestore();
    }

    async getUser(username) {
        const user = await this
            .db
            .collection('users')
            .doc(username)
            .get();
        const data = user.data();
        if (data === undefined) {
            return Option.None();
        }
        return Option.Some(data);
    }

    async createUser(username, password, salt) {
        try {
            // Check if user already exists
            const user = await this.getUser(username);
            if (user.getOrNull() !== null) {
                return Result.Err('User already exists');
            }
            await this
                .db
                .collection('users')
                .doc(username)
                .set({
                    password: password,
                    salt: salt
                });
            return Result.Ok({username, password, salt});
        }
        catch (error) {
            return Result.Err(error);
        }
    }

    async updateUser(username, password, salt) {
        try {
            const result = await this
                .db
                .collection('users')
                .doc(username)
                .update({
                    password,
                    salt
                });
            return Result.Ok({username, password, salt});
        }
        catch (error) {
            return Result.Err(error);
        }
    }

    async deleteUser(username) {
        try {
            const result = await this
                .db
                .collection('users')
                .doc(username)
                .delete();
            return Result.Ok(username);
        }
        catch (error) {
            return Result.Err(error);
        }
    }
}