const path = require('path');
const express = require('express');
const db = require('./config/db.js')
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json())

// ემსახურე სტატიკურ ფაილებს public დირექტორიიდან
app.use(express.static(path.join(__dirname, 'public')));

// მთავარი route — დააბრუნე index.html (აუცილებელია აბსოლუტური ბილიკი)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


const login = require('./reg.js')

app.use('/login',login)
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
