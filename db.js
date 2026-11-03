const mysql = require('mysql2');

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '', // ค่าเริ่มต้นของ Laragon รหัสผ่านเป็นค่าว่าง
    database: 'mysql', // ชื่อฐานข้อมูลตามรูปภาพ
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

db.getConnection((err, connection) => {
    if (err) {
        console.error('❌ เชื่อมต่อฐานข้อมูลล้มเหลว:', err.message);
    } else {
        console.log('✅ เชื่อมต่อฐานข้อมูล Laragon สำเร็จ!');
        connection.release();
    }
});

module.exports = db.promise();