const express = require('express');
const session = require('express-session');
const path = require('path');
const app = express();
const cors = require('cors');
const { User } = require('./config');
const admin = require('firebase-admin');
const qr = require('qrcode');
const fs = require('fs');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// Check if Firebase Admin SDK is not already initialized
if (!admin.apps.length) {
    // Initialize Firebase Admin SDK
    const serviceAccount = require('./egate-27caa-firebase-adminsdk-lrl0e-50bd2f82a5.json');
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

// Configure Passport.js
passport.use(new GoogleStrategy({
    clientID: '757561340490-qmsjjo78o48i9ll4n1thagp5hdg2a58h.apps.googleusercontent.com',
    clientSecret: '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',
    callbackURL: 'http://localhost:1304/auth/google/callback',
    userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo',
    scope: ['email', 'profile']
},
function(accessToken, refreshToken, profile, cb) {
    // This function will be called after successful authentication
    return cb(null, profile);
}
));
app.use(session({
    secret: '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',
    resave: false,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

// Serialize user
passport.serializeUser(function(user, done) {
    done(null, user);
});

// Deserialize user
passport.deserializeUser(function(user, done) {
    done(null, user);
});

app.use('/static', express.static(path.join(__dirname, 'static')));
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, '/static/pug'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
// Routes
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

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),

  async function(req, res) {
    console.log('User:', req.user.emails[0].value);
    const userG = req.user;
    if (userG.emails[0].value.endsWith('@iitgn.ac.in')) {
        const userResponseG = await admin.auth().createUser({
            email: userG.emails[0].value,
            name: userG.name
        });
      
        const dbG = admin.firestore();
        const visitorsG = dbG.collection('users').doc(userResponseG.uid);
        visitorsG.get()
            .then((docSnapshot) => {
                if (!docSnapshot.exists) {
                    visitorsG.set({
                        email: userG.emails[0].value,
                        uid: userResponseG.uid, // Fixed variable name
                    }).catch((error) => {
                        console.log("Error setting document:", error);
                    });
                } else {
                    visitorsG.update({
                        email: userG.emails[0].value,
                        uid: userResponseG.uid, // Fixed variable name
                    }).catch((error) => {
                        console.log("Error updating document:", error);
                    });
                }
            })
            .catch((error) => {
                console.log("Error getting document:", error);
            });
        
        let qrString = JSON.stringify({ email: userG.emails[0].value, uid: userResponseG.uid }); // Fixed variable name

        await qr.toFile("userG.png", qrString);
        const sourcePathG = 'userG.png';
        const destinationPathG = path.join(__dirname, 'static', 'userG.png');

        fs.copyFile(sourcePathG, destinationPathG, (err) => {
            if (err) {
                console.error('Error copying file:', err);
            } else {
                console.log('File copied successfully');
            }
        });
        
        res.redirect('/permanent');

    } else {
        return res.json({ error: 'Invalid email domain. Only @iitgn.ac.in is allowed.' });
    }
});



app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.post('/permanent', async (req, res) => {
  try {
    const data = req.body;

    if (!data.email.endsWith('@iitgn.ac.in')) {
    //   return res.render('permanent.pug', { external: 'Invalid email domain. Only @iitgn.ac.in is allowed.' });
    return res.json({ error: 'Invalid email domain. Only @iitgn.ac.in is allowed.' });
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

    let qrString = JSON.stringify({ email: data.email, uid: userResponse.uid });

    await qr.toFile("user.png", qrString);
    const sourcePath = 'user.png';
    const destinationPath = path.join(__dirname, 'static', 'user.png');

    fs.copyFile(sourcePath, destinationPath, (err) => {
      if (err) {
        console.error('Error copying file:', err);
      } else {
        console.log('File copied successfully');
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

    let qrString = JSON.stringify({ email: data.email, name: data.name, phone: data.phone, intime: data.intime });

    await qr.toFile("visitors.png", qrString);
    const sourcePath = 'visitors.png';
    const destinationPath = path.join(__dirname, 'static', 'visitors.png');

    fs.copyFile(sourcePath, destinationPath, (err) => {
      if (err) {
        console.error('Error copying file:', err);
      } else {
        console.log('File copied successfully');
      }
    });

    res.render('visitors.pug', { message: 'User created successfully.' });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred while creating the user.', details: error.message });
  }

});

app.listen(process.env.PORT || 1304, () => {
  console.log('running on port 1304');
});




// clientID: '757561340490-qmsjjo78o48i9ll4n1thagp5hdg2a58h.apps.googleusercontent.com',
//     clientSecret: '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',