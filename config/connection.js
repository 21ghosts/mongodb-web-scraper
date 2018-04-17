var mongoose = require('mongoose');

let connection = mongoose.connect(
    process.env.MONGODB_URI || "mongodb://localhost/mongoNews"
    
);

module.exports = connection;