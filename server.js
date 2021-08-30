const express = require('express');
const app = express();
const cors = require('cors');

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send('ciao')
});


app.listen('3001', (req, res) => {
    console.log('server started on port 3001')
})