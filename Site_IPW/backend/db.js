const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Gert05102006!',
    database: 'escola_db'
});

db.connect(err => {
    if (err) {
        console.error('Erro MySQL:', err);
    } else {
        console.log('Ligado à base de dados');
    }
});

module.exports = db;
