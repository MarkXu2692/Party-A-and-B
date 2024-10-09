const express = require('express');
const app = express();
const PORT = 3001;

app.get('/', (req, res) => {
    res.send('welcome to my app\'s backend!');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
