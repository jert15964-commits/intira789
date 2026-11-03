const express = require('express');

const path = require('path');
const app = express();
const PORT = 8080; // พอร์ตสำหรับรัน Frontend
// ตั้งค่า Static Folder
app.use(express.static(__dirname));
// Routing ส่งหน้า index.html เป็นหลัก
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
    res.sendFile(path.join(__dirname, 'idea.html'));
    res.sendFile(path.join(__dirname, 'example.html'));
});

app.get('/about.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'about.html'));
});

app.get('/idea.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'idea.html'));
});

app.get('/example.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'example.html'));
});

app.get('/contact.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'contact.html'));
});

app.listen(PORT, () => {
    console.log(`Frontend Server กำลังทำงานที่ http://localhost:${PORT}`);
});