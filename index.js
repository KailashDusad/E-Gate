const express = require('express');
const path = require('path');
const app = express();

app.use('/static', express.static(path.join(__dirname, 'static')));
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, '/static/pug'));

app.get('/', (req, res) => {
    res.status(200).render('home.pug');
    });

app.listen(1304, () => {
    console.log('running on port 1304');
});
