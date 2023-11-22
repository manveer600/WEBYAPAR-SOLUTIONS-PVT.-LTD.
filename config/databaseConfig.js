// databaseConfig.js
const mongoose = require('mongoose');

function databaseconnect(){ 
    mongoose.connect(process.env.MONGODB_URL)
    .then((conn)=>{
    console.log(`Connection Successfull to ${conn.connection.name} database`);
    })
    .catch((err)=>{
        console.log(err);
        // throw new Error(`Sorry can't connect to Database right now`);
    })
}

databaseconnect();



