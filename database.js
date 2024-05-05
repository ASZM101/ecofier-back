import {Option, Result} from "./utils";

const {Firestore} = require('@google-cloud/firestore');

// This file interfaces with the backend hosted in Firebase.
export class Database {
    constructor() {
        this.db = new Firestore();
    }

    async getUser(username): Promise<Option> {
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

    async createUser(username, password, salt): Promise<Result> {
        try {
            const result = await this
                .db
                .collection('users')
                .doc(username)
                .set({
                    password,
                    salt
                });
            return Result.Ok({username, password, salt});
        }
        catch (error) {
            return Result.Err(error);
        }
    }

    async updateUser(username, password, salt): Promise<Result> {
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

    async deleteUser(username): Promise<Result> {
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