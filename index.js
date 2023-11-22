// index.js
require('dotenv').config();
const cloudinary = require('cloudinary');
const PORT = process.env.PORT || 5000;

const app = require('./app.js');


cloudinary.config({ 
  cloud_name: process.env.CLOUDNAME,
  api_key: process.env.APIKEY,
  api_secret: process.env.APISECRET
});

app.listen(PORT, () => {
  console.log(`server is listening at http://localhost:${PORT}`);
});


