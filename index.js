const express = require('express');
const path = require('path');
const app = express();
const cors = require('cors');
const {User} = require('./config');
const admin = require('firebase-admin');
const qr = require('qrcode');
const fs = require('fs');
const router = express.Router();

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
app.get('/visitors', (req, res) => {
    res.status(200).render('visitors.pug');
});
app.get('/security', (req, res) => {
    res.status(200).render('security.pug');
});
router.post('/permanent/googleSignIn', async (req, res) => {
    try {
        const idToken = req.body.idToken;
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const email = decodedToken.email;
        
        // Save user's Gmail ID to Firebase
        await User.doc(email).set({ email });
        
        // Generate QR code
        const qrData = {
            email,
            signInTime: new Date().toISOString()
        };
        const qrString = JSON.stringify(qrData);
        await qr.toFile("user.png", qrString);

        res.json({ message: 'User signed in successfully' });
    } catch (error) {
        console.error('Error signing in with Google:', error);
        res.status(500).json({ error: 'An error occurred while signing in with Google' });
    }
});

module.exports = router;
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
        const visitors = db.collection('users').doc(userResponse.uid);

        visitors.get().then((docSnapshot) => {
            if (!docSnapshot.exists) {
                visitors.set({
                    email: data.email,
                    uid: userResponse.uid,
                }).catch((error) => {
                    console.log("Error setting document:", error);
                });
            } else {
                visitors.update({
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
            
            await qr.toFile("user.png", qrString);
            const sourcePath = 'user.png';
            const destinationPath = path.join(__dirname, 'static', 'user.png');

            fs.copyFile(sourcePath, destinationPath, (err) => {
                if (err) {
                    console.error('Error copying file:', err);
                    // Handle the error
                } else {
                    console.log('File copied successfully');
                    // Continue with your code
                }
            });
            res.render('permanent.pug', { message: 'User created successfully.', qrImage: 'user.png' });


    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred while creating the user.', details: error.message });
    }
    
});
app.post('/visitors', async (req, res) => {
    try {
        const data = req.body;
        const userResponse = await admin.auth().createUser({
            email: data.email,
            name: data.name,
            phone: data.phone,
            intime: data.intime,
            emailVerified: false,
            disabled: false,
        });

        const db = admin.firestore();
        const visitors = db.collection('visitors').doc(userResponse.uid);

        visitors.get().then((docSnapshot) => {
            if (!docSnapshot.exists) {
                visitors.set({
                    email: data.email,
                    name: data.name,
                    phone: data.phone,
                    intime: data.intime,
                    uid: userResponse.uid,
                }).catch((error) => {
                    console.log("Error setting document:", error);
                });
            } else {
                visitors.update({
                    email: data.email,
                    name: data.name,
                    phone: data.phone,
                    intime: data.intime,
                    uid: userResponse.uid,
                }).catch((error) => {
                    console.log("Error updating document:", error);
                });
            }
        }).catch((error) => {
            console.log("Error getting document:", error);
        });

        let qrString = JSON.stringify({email: data.email, name: data.name, phone: data.phone, intime: data.intime});
            
            await qr.toFile("visitors.png", qrString);
            const sourcePath = 'visitors.png';
            const destinationPath = path.join(__dirname, 'static', 'visitors.png');

            fs.copyFile(sourcePath, destinationPath, (err) => {
                if (err) {
                    console.error('Error copying file:', err);
                    // Handle the error
                } else {
                    console.log('File copied successfully');
                    // Continue with your code
                }
            });
            res.render('visitors.pug', { message: 'User created successfully.'});


    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred while creating the user.', details: error.message });
    }
    
});

app.listen(process.env.PORT || 1304, () => {
    console.log('running on port 1304');
});