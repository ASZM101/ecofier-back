const admin = require('firebase-admin');
const keys = require("keyring/serviceAccount.json")
// Handles image upload to firebase storage
export class BucketStorage {
    constructor() {
        admin.initializeApp({
            credential: admin.credential.cert(keys),
            storageBucket: '', // Replace with your Firebase Storage bucket URL
        });
    }

    getBucket() {
        return admin.storage().bucket();
    }
}