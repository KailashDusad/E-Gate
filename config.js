const admin = require('firebase-admin');

const serviceAccount = require('./egate-27caa-firebase-adminsdk-lrl0e-50bd2f82a5.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();
const User = db.collection('users');

module.exports = { User };
