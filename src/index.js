const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db');
const apiRouter = require('./routes');

const port = process.env.PORT || 3000;
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use('/api', apiRouter);

app.get('/', (req, res) => {
    res.send('Hello, World');
});

db.authenticate()
.then(() => {
    console.log('Database connected.');
    db.sync();
    console.log('Database synchronized');
}).then(() => {
    console.log('Database ready');
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
})
.catch((error) => {
    console.error('Error connecting to the database:', error);
});
