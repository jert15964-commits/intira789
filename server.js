const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// Middleware
// ==========================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(express.static(__dirname)); // ให้เรียกไฟล์ html ในโฟลเดอร์ blackend ได้โดยตรง

// ==========================================
// Helper Functions (การจัดการ Error และ Response)
// ==========================================
const handleError = (res, error, customMessage) => {
    console.error(`${customMessage}:`, error);
    return res.status(500).json({
        success: false,
        message: `${customMessage}: ${error.message}`
    });
};

// ==========================================
// 1. API ระบบ Admin (ครบทุก Route)
// ==========================================

// ตรวจสอบจำนวน Admin ในระบบ
app.get('/api/admin/check-count', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT COUNT(*) AS count FROM admin');
        res.json({ success: true, count: rows[0].count });
    } catch (error) {
        handleError(res, error, 'เกิดข้อผิดพลาดในการตรวจสอบจำนวน Admin');
    }
});

// ลงทะเบียน Admin
app.post('/api/admin/register', async (req, res) => {
    const { id, password, name } = req.body;

    if (!id || !password) {
        return res.status(400).json({
            success: false,
            message: 'กรุณากรอก ID และ Password ให้ครบถ้วน'
        });
    }

    try {
        const sql = 'INSERT INTO admin (id, passwold, name) VALUES (?, ?, ?)';
        await db.query(sql, [parseInt(id), parseInt(password), name]);

        res.json({ success: true, message: 'บันทึกข้อมูล Admin เรียบร้อยแล้ว' });
    } catch (error) {
        handleError(res, error, 'เกิดข้อผิดพลาดในการบันทึก Admin');
    }
});

// เข้าสู่ระบบ Admin
app.post('/api/admin/login', async (req, res) => {
    const { id, password, name } = req.body;

    try {
        const sql = 'SELECT * FROM admin WHERE id = ? AND passwold = ? AND name = ?';
        const [rows] = await db.query(sql, [id, password, name]);

        if (rows.length > 0) {
            res.json({ success: true, message: 'เข้าสู่ระบบสำเร็จ', admin: rows[0] });
        } else {
            res.status(401).json({ success: false, message: 'ID, Password หรือ Name ไม่ถูกต้อง' });
        }
    } catch (error) {
        handleError(res, error, 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    }
});

// ยืนยันรหัสผ่านเดิมเพื่อแก้ไขข้อมูล
app.post('/api/admin/verify-password', async (req, res) => {
    const { password } = req.body;

    try {
        const sql = 'SELECT * FROM admin WHERE passwold = ? LIMIT 1';
        const [rows] = await db.query(sql, [password]);

        if (rows.length > 0) {
            res.json({ success: true, admin: rows[0] });
        } else {
            res.status(401).json({ success: false, message: 'รหัสผ่านเดิมไม่ถูกต้อง' });
        }
    } catch (error) {
        handleError(res, error, 'เกิดข้อผิดพลาดในการยืนยันรหัสผ่าน');
    }
});

// อัปเดตข้อมูล Admin
app.put('/api/admin/update', async (req, res) => {
    const { current_id, new_id, new_password, new_name } = req.body;

    try {
        const sql = 'UPDATE admin SET id = ?, passwold = ?, name = ? WHERE id = ?';
        await db.query(sql, [parseInt(new_id), parseInt(new_password), new_name, current_id]);

        res.json({ success: true, message: 'แก้ไขข้อมูล Admin สำเร็จ' });
    } catch (error) {
        handleError(res, error, 'เกิดข้อผิดพลาดในการแก้ไขข้อมูล Admin');
    }
});

// ==========================================
// 2. API ระบบจัดการหน้าหลัก (main_blackend)
// ==========================================
app.get('/api/main/all', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM main_blackend ORDER BY id_image ASC');
        res.json({ success: true, data: rows });
    } catch (error) {
        handleError(res, error, 'เกิดข้อผิดพลาดในการดึงข้อมูลหน้าหลัก');
    }
});

app.post('/api/main/add', async (req, res) => {
    const { id_image, text, image } = req.body;

    if (!id_image) {
        return res.status(400).json({ success: false, message: 'กรุณากรอกรหัสรูป (ID)' });
    }

    try {
        const sql = 'INSERT INTO main_blackend (id_image, text, image) VALUES (?, ?, ?)';
        await db.query(sql, [id_image, text, image]);

        res.json({ success: true, message: 'บันทึกข้อมูลเรียบร้อยแล้ว' });
    } catch (error) {
        handleError(res, error, 'เกิดข้อผิดพลาดในการบันทึกข้อมูลหน้าหลัก');
    }
});

app.delete('/api/main/delete/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await db.query('DELETE FROM main_blackend WHERE id_image = ?', [id]);
        res.json({ success: true, message: 'ลบข้อมูลสำเร็จ' });
    } catch (error) {
        handleError(res, error, 'เกิดข้อผิดพลาดในการลบข้อมูลหน้าหลัก');
    }
});

// ==========================================
// 3. API ระบบจัดการหน้าเกี่ยวกับเรา (about_us)
// ==========================================
app.get('/api/about/all', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM about_us ORDER BY id_imageA ASC');
        res.json({ success: true, data: rows });
    } catch (error) {
        handleError(res, error, 'เกิดข้อผิดพลาดในการดึงข้อมูลเกี่ยวกับเรา');
    }
});

app.post('/api/about/add', async (req, res) => {
    const { id_imageA, text_A, image_A } = req.body;

    if (!id_imageA) {
        return res.status(400).json({ success: false, message: 'กรุณากรอกรหัสรูป (ID)' });
    }

    try {
        const sql = 'INSERT INTO about_us (id_imageA, text_A, image_A) VALUES (?, ?, ?)';
        await db.query(sql, [id_imageA, text_A, image_A]);

        res.json({ success: true, message: 'บันทึกข้อมูลเรียบร้อยแล้ว' });
    } catch (error) {
        handleError(res, error, 'เกิดข้อผิดพลาดในการบันทึกข้อมูลเกี่ยวกับเรา');
    }
});

app.delete('/api/about/delete/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await db.query('DELETE FROM about_us WHERE id_imageA = ?', [id]);
        res.json({ success: true, message: 'ลบข้อมูลสำเร็จ' });
    } catch (error) {
        handleError(res, error, 'เกิดข้อผิดพลาดในการลบข้อมูลเกี่ยวกับเรา');
    }
});

// ==========================================
// 4. API ระบบจัดการหน้าไอเดีย (idea_int)
// ==========================================
app.get('/api/ideaint/all', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM idea_int ORDER BY id_ii ASC');
        res.json({ success: true, data: rows });
    } catch (error) {
        handleError(res, error, 'เกิดข้อผิดพลาดในการดึงข้อมูลไอเดีย');
    }
});

app.get('/api/ideaint/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.query('SELECT * FROM idea_int WHERE id_ii = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลไอเดียนี้' });
        }
        res.json({ success: true, data: rows[0] });
    } catch (error) {
        handleError(res, error, 'เกิดข้อผิดพลาดในการดึงข้อมูลไอเดีย');
    }
});

app.post('/api/ideaint/add', async (req, res) => {
    const { id_ii, name_ii, type_ii, image1_ii, image2_ii, image3_ii } = req.body;

    if (!id_ii) {
        return res.status(400).json({ success: false, message: 'กรุณากรอกรหัสไอเดีย (ID)' });
    }

    try {
        const sql = 'INSERT INTO idea_int (id_ii, name_ii, type_ii, image1_ii, image2_ii, image3_ii) VALUES (?, ?, ?, ?, ?, ?)';
        await db.query(sql, [parseInt(id_ii), name_ii, type_ii, image1_ii, image2_ii, image3_ii]);

        res.json({ success: true, message: 'บันทึกข้อมูลไอเดียเรียบร้อยแล้ว' });
    } catch (error) {
        handleError(res, error, 'เกิดข้อผิดพลาดในการบันทึกข้อมูลไอเดีย');
    }
});

app.put('/api/ideaint/update/:id', async (req, res) => {
    const { id } = req.params;
    const { name_ii, type_ii, image1_ii, image2_ii, image3_ii } = req.body;

    try {
        const sql = 'UPDATE idea_int SET name_ii = ?, type_ii = ?, image1_ii = ?, image2_ii = ?, image3_ii = ? WHERE id_ii = ?';
        await db.query(sql, [name_ii, type_ii, image1_ii, image2_ii, image3_ii, id]);

        res.json({ success: true, message: 'แก้ไขข้อมูลสำเร็จ' });
    } catch (error) {
        handleError(res, error, 'เกิดข้อผิดพลาดในการแก้ไขข้อมูลไอเดีย');
    }
});

app.delete('/api/ideaint/delete/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await db.query('DELETE FROM idea_int WHERE id_ii = ?', [id]);
        res.json({ success: true, message: 'ลบข้อมูลสำเร็จ' });
    } catch (error) {
        handleError(res, error, 'เกิดข้อผิดพลาดในการลบข้อมูลไอเดีย');
    }
});

// ==========================================
// 5. API ระบบจัดการหน้าตัวอย่างงาน (exam)
// ==========================================
app.get('/api/exam/all', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM exam ORDER BY id_exam ASC');
        res.json({ success: true, data: rows });
    } catch (error) {
        handleError(res, error, 'เกิดข้อผิดพลาดในการดึงข้อมูลตัวอย่างงาน');
    }
});

app.get('/api/exam/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.query('SELECT * FROM exam WHERE id_exam = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลตัวอย่างงานนี้' });
        }
        res.json({ success: true, data: rows[0] });
    } catch (error) {
        handleError(res, error, 'เกิดข้อผิดพลาดในการดึงข้อมูลตัวอย่างงาน');
    }
});

app.post('/api/exam/add', async (req, res) => {
    const { id_exam, name_exam, type, budget_exam, image1_exam, image2_exam, image3_exam } = req.body;

    if (!id_exam) {
        return res.status(400).json({ success: false, message: 'กรุณากรอกรหัสตัวอย่างงาน (ID)' });
    }

    try {
        const sql = 'INSERT INTO exam (id_exam, name_exam, type, budget_exam, image1_exam, image2_exam, image3_exam) VALUES (?, ?, ?, ?, ?, ?, ?)';
        await db.query(sql, [parseInt(id_exam), name_exam, type, budget_exam, image1_exam, image2_exam, image3_exam]);

        res.json({ success: true, message: 'บันทึกข้อมูลตัวอย่างงานเรียบร้อยแล้ว' });
    } catch (error) {
        handleError(res, error, 'เกิดข้อผิดพลาดในการบันทึกข้อมูลตัวอย่างงาน');
    }
});

app.put('/api/exam/update/:id', async (req, res) => {
    const { id } = req.params;
    const { name_exam, type, budget_exam, image1_exam, image2_exam, image3_exam } = req.body;

    try {
        const sql = 'UPDATE exam SET name_exam = ?, type = ?, budget_exam = ?, image1_exam = ?, image2_exam = ?, image3_exam = ? WHERE id_exam = ?';
        await db.query(sql, [name_exam, type, budget_exam, image1_exam, image2_exam, image3_exam, id]);

        res.json({ success: true, message: 'แก้ไขข้อมูลสำเร็จ' });
    } catch (error) {
        handleError(res, error, 'เกิดข้อผิดพลาดในการแก้ไขข้อมูลตัวอย่างงาน');
    }
});

app.delete('/api/exam/delete/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await db.query('DELETE FROM exam WHERE id_exam = ?', [id]);
        res.json({ success: true, message: 'ลบข้อมูลสำเร็จ' });
    } catch (error) {
        handleError(res, error, 'เกิดข้อผิดพลาดในการลบข้อมูลตัวอย่างงาน');
    }
});

// ==========================================
// 6. API ระบบจัดการช่องทางการติดต่อ (contact)
// ==========================================
app.get('/api/contact/all', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM contact');
        res.json({ success: true, data: rows });
    } catch (error) {
        handleError(res, error, 'เกิดข้อผิดพลาดในการดึงข้อมูลช่องทางติดต่อ');
    }
});

app.get('/api/contact/get', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM contact LIMIT 1');
        res.json({ success: true, data: rows.length > 0 ? rows[0] : null });
    } catch (error) {
        handleError(res, error, 'เกิดข้อผิดพลาดในการดึงข้อมูลช่องทางติดต่อ');
    }
});

app.post('/api/contact/save', async (req, res) => {
    const { tell, email, fecebook, line, image_line, address } = req.body;

    try {
        const [existing] = await db.query('SELECT * FROM contact LIMIT 1');

        if (existing.length > 0) {
            const sql = 'UPDATE contact SET tell = ?, email = ?, fecebook = ?, line = ?, image_line = ?, address = ? WHERE tell = ?';
            await db.query(sql, [tell, email, fecebook, line, image_line, address, existing[0].tell]);
        } else {
            const sql = 'INSERT INTO contact (tell, email, fecebook, line, image_line, address) VALUES (?, ?, ?, ?, ?, ?)';
            await db.query(sql, [tell, email, fecebook, line, image_line, address]);
        }

        res.json({ success: true, message: 'บันทึกข้อมูลช่องทางการติดต่อเรียบร้อยแล้ว' });
    } catch (error) {
        handleError(res, error, 'เกิดข้อผิดพลาดในการบันทึกข้อมูลช่องทางติดต่อ');
    }
});

// ==========================================
// 7. Catch-all Router สำหรับ API ที่ไม่มีจริง (404 Not Found)
// ⚠️ ต้องอยู่ล่างสุดของบรรดา Route ทั้งหมดเสมอ
// ==========================================
app.use('/api/', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'ไม่พบ API Route ที่เรียกใช้งาน (404 Not Found)'
    });
});

// ==========================================
// Start Server
// ==========================================
app.listen(PORT, () => {
    console.log(`Server กำลังทำงานที่ http://localhost:${PORT}`);
});