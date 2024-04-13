const express = require('express');
const path = require('path');
const app = express();
const cors = require('cors');
const {User} = require('./config');
const admin = require('firebase-admin');
const qr = require('qrcode');


app.use('/static', express.static(path.join(__dirname, 'static')));
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, '/static/pug'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.get('/', (req, res) => {
    res.status(200).render('home.pug');
});

app.get('/permanent', (req, res) => {
    res.status(200).render('permanent.pug');
});

app.post('/permanent', async (req, res) => {
    try {
        const data = req.body;

        if (!data.email.endsWith('@iitgn.ac.in')) {
            return res.status(400).json({ error: 'Invalid email domain. Only @iitgn.ac.in is allowed.' });
        }

        const userResponse = await admin.auth().createUser({
            email: data.email,
            password: data.password,
            emailVerified: false,
            disabled: false,
        });

        const db = admin.firestore();
        const docRef = db.collection('users').doc(userResponse.uid);

        docRef.get().then((docSnapshot) => {
            if (!docSnapshot.exists) {
                docRef.set({
                    email: data.email,
                    uid: userResponse.uid,
                }).catch((error) => {
                    console.log("Error setting document:", error);
                });
            } else {
                docRef.update({
                    email: data.email,
                    uid: userResponse.uid,
                }).catch((error) => {
                    console.log("Error updating document:", error);
                });
            }
        }).catch((error) => {
            console.log("Error getting document:", error);
        });

        let qrString = JSON.stringify({email: data.email, uid: userResponse.uid});
            
            qr.toFile("user.png",qrString, function (err) {
                if (err) {
                    console.error(err);
                    return;
                }
            });
            res.render('permanent.pug', { message: 'User created successfully.', qrImage: 'user.png' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred while creating the user.', details: error.message });
    }
    
});

app.listen(process.env.PORT || 1304, () => {
    console.log('running on port 1304');
});