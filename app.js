const API_BASE_URL = 'http://localhost:3000/api';

// ฟังก์ชันแปลง URL จาก Google Drive ให้แสดงผลรูปภาพได้
function convertDriveUrl(url) {
    if (!url) return '';
    if (!url.includes('drive.google.com') && !url.includes('lh3.googleusercontent.com')) {
        // เพิ่มการรองรับการแปลงลิงก์ Drive แบบต่างๆ
        const match = url.match(/(?:file\/d\/|open\?id=|id=|uc\?id=|d\/)([a-zA-Z0-9_-]{25,})/);
        let fileId = null;
        if (match && match[1]) {
            fileId = match[1];
        } else if (/^[a-zA-Z0-9_-]{25,}$/.test(url)) {
            fileId = url;
        }
        
        if (fileId) {
            return `https://lh3.googleusercontent.com/d/${fileId}`;
        }
        return url;
    }
    return url;
}

// ==========================================
// 1. ดึงข้อมูลหน้าหลัก (main_blackend) มาแสดงใน Slider
// ==========================================
let slidesData = [];
let currentSlideIndex = 0;

async function loadMainData() {
    const loadingText = document.getElementById('loadingText');
    const imgElement = document.getElementById('bannerImage');
    
    if (!loadingText && !imgElement) return; // ถ้าไม่ใช่หน้า index.html ให้ข้าม

    try {
        const response = await fetch(`${API_BASE_URL}/main/all`);
        const result = await response.json();

        if (result.success && result.data && result.data.length > 0) {
            slidesData = result.data;
            renderDots();
            showSlide(0);
        } else if (loadingText) {
            loadingText.innerText = 'ไม่พบข้อมูลหน้าหลักในระบบ';
        }
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการโหลดข้อมูลหน้าหลัก:', error);
        if (loadingText) loadingText.innerText = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้';
    }
}

function showSlide(index) {
    if (slidesData.length === 0) return;

    currentSlideIndex = index;
    const item = slidesData[currentSlideIndex];

    const imgElement = document.getElementById('bannerImage');
    const loadingText = document.getElementById('loadingText');
    const textElement = document.getElementById('contentText');

    const imageUrl = convertDriveUrl(item.image);
    if (imgElement) {
        if (imageUrl) {
            imgElement.src = imageUrl;
            imgElement.style.display = 'block';
            if (loadingText) loadingText.style.display = 'none';
        } else {
            imgElement.style.display = 'none';
            if (loadingText) {
                loadingText.innerText = 'ไม่มีรูปภาพ';
                loadingText.style.display = 'block';
            }
        }
    }

    if (textElement) textElement.innerText = item.text || '---';
    updateDots();
}

function renderDots() {
    const dotsContainer = document.getElementById('dotsContainer');
    if (!dotsContainer) return;

    dotsContainer.innerHTML = '';
    slidesData.forEach((_, idx) => {
        const dot = document.createElement('div');
        dot.className = 'dot';
        dot.onclick = () => showSlide(idx);
        dotsContainer.appendChild(dot);
    });
}

function updateDots() {
    const dots = document.querySelectorAll('.dot');
    dots.forEach((dot, idx) => {
        if (idx === currentSlideIndex) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

function nextSlide() {
    if (slidesData.length > 0) {
        showSlide((currentSlideIndex + 1) % slidesData.length);
    }
}

function prevSlide() {
    if (slidesData.length > 0) {
        showSlide((currentSlideIndex - 1 + slidesData.length) % slidesData.length);
    }
}

// ==========================================
// 2. ดึงข้อมูลตัวอย่างงาน (exam) มาแสดง
// ==========================================
async function loadWorks() {
    const container = document.getElementById('worksContainer');
    if (!container) return; // ถ้าไม่มี Container แสดงผลให้ข้าม

    try {
        const response = await fetch(`${API_BASE_URL}/exam/all`);
        const result = await response.json();

        if (result.success && result.data) {
            console.log('ข้อมูลตัวอย่างงาน:', result.data);
            container.innerHTML = '';

            result.data.forEach(work => {
                const img1 = convertDriveUrl(work.image1_exam);
                const workCard = `
                    <div class="work-card">
                        <img src="${img1 || 'https://via.placeholder.com/300'}" alt="${work.name_exam || ''}">
                        <h3>${work.name_exam || 'ไม่มีชื่อรายการ'}</h3>
                        <p><strong>ประเภท:</strong> ${work.type || '-'}</p>
                        <p><strong>งบประมาณ:</strong> ${work.budget_exam ? work.budget_exam + ' บาท' : '-'}</p>
                    </div>
                `;
                container.innerHTML += workCard;
            });
        }
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการโหลดข้อมูลงาน:', error);
    }
}

// ==========================================
// 3. ดึงข้อมูลช่องทางการติดต่อ (contact) มาแสดง
// ==========================================
async function loadContactData() {
    const contactTell = document.getElementById('contact-tell');
    if (!contactTell) return; // ตรวจสอบว่าอยู่ในหน้า Contact หรือไม่ ถ้าไม่มี ID นี้ให้ข้ามไปทำงานหน้าอื่น

    const statusMessage = document.getElementById('statusMessage');
    const contactContent = document.getElementById('contactContent');

    if (statusMessage) {
        statusMessage.style.display = 'block';
        statusMessage.innerText = 'กำลังโหลดข้อมูล...';
    }

    try {
        const response = await fetch(`${API_BASE_URL}/contact/all`);
        const result = await response.json();

        if (result.success && result.data && result.data.length > 0) {
            
            if (statusMessage) statusMessage.style.display = 'none';
            if (contactContent) contactContent.style.display = 'flex';

            // เลือกข้อมูลรายการล่าสุด
            const latestData = result.data[result.data.length - 1];

            // จัดการเบอร์โทรศัพท์ (tell) ที่เป็น INT ให้เติม 0 ด้านหน้าให้ครบ 10 หลัก
            let tellValue = latestData.tell;
            let tellDisplay = (tellValue !== null && tellValue !== undefined) 
                ? String(tellValue).padStart(10, '0') 
                : '-';

            // นำข้อมูลไปแสดงผล
            document.getElementById('contact-tell').textContent = tellDisplay;
            document.getElementById('contact-email').textContent = latestData.email || '-';
            document.getElementById('contact-facebook').textContent = latestData.fecebook || latestData.facebook || '-';
            document.getElementById('contact-line').textContent = latestData.line || '-';
            document.getElementById('contact-address').textContent = latestData.address || '-';

            // จัดการแสดงรูป QR Code Line
            const qrImg = document.getElementById('contact-qr');
            const qrPlaceholder = document.getElementById('qr-placeholder');
            
            if (latestData.image_line) {
                qrImg.src = convertDriveUrl(latestData.image_line);
                qrImg.style.display = 'block';
                if (qrPlaceholder) qrPlaceholder.style.display = 'none';
            }

        } else {
            if (statusMessage) {
                statusMessage.style.display = 'block';
                statusMessage.innerText = 'ไม่พบข้อมูลการติดต่อในระบบ';
            }
        }
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการโหลดข้อมูลการติดต่อ:', error);
        if (statusMessage) {
            statusMessage.style.display = 'block';
            statusMessage.innerText = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้';
        }
    }
}

// ==========================================
// 4. ดึงข้อมูลสไตล์และไอเดีย (idea_int) มาแสดงแบบสุ่ม 4 รายการ
// ==========================================
// ฟังก์ชันสุ่ม Array (Fisher-Yates Shuffle)
// ==========================================
// 4. ดึงข้อมูลสไตล์และไอเดีย (idea_int) มาแสดงแบบสุ่ม 4 รายการ พร้อม Popup
// ==========================================

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

async function loadIdeaData() {
    const grid = document.getElementById('ideaGrid');
    if (!grid) return; 

    try {
        const response = await fetch(`${API_BASE_URL}/idea/all`);
        const result = await response.json();

        if (result.success && result.data && result.data.length > 0) {
            let shuffledData = shuffleArray([...result.data]);
            let randomFour = shuffledData.slice(0, 4);
            
            grid.innerHTML = ''; 

            randomFour.forEach(item => {
                const card = document.createElement('div');
                card.className = 'idea-card';
                card.style.cursor = 'pointer'; // เปลี่ยนเมาส์เป็นนิ้วชี้ให้รู้ว่ากดได้

                const imageUrl = convertDriveUrl(item.image1_ii);
                const name = item.name_ii || '-';                 
                const type = item.type_ii || '-';                 

                card.innerHTML = `
                    <img class="idea-img" src="${imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'}" alt="Idea Image">
                    <div class="idea-info">
                        <p>ชื่อ: ${name}</p>
                        <p>ประเภท: ${type}</p>
                    </div>
                `;

                // --- เพิ่มการคลิกเปิด Popup ตรงนี้ ---
                card.onclick = () => openIdeaModal(item);

                grid.appendChild(card);
            });
        } else {
            grid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center;">ไม่พบข้อมูลสไตล์และไอเดียในระบบ</p>';
        }
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการโหลดข้อมูลไอเดีย:', error);
        grid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: red;">ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์เพื่อโหลดข้อมูลไอเดียได้</p>';
    }
}

// --- ฟังก์ชันสำหรับเปิด Popup ---
function openIdeaModal(item) {
    const modal = document.getElementById('ideaModal');
    if (!modal) return;

    // เตรียม URL รูปทั้ง 3 รูป
    const url1 = convertDriveUrl(item.image1_ii);
    const url2 = convertDriveUrl(item.image2_ii);
    const url3 = convertDriveUrl(item.image3_ii);

    const img1 = document.getElementById('modalImg1');
    const img2 = document.getElementById('modalImg2');
    const img3 = document.getElementById('modalImg3');

    // ถ้ามี URL ให้แสดงรูป ถ้าไม่มีให้ซ่อน
    if (url1) { img1.src = url1; img1.style.display = 'block'; } else { img1.style.display = 'none'; }
    if (url2) { img2.src = url2; img2.style.display = 'block'; } else { img2.style.display = 'none'; }
    if (url3) { img3.src = url3; img3.style.display = 'block'; } else { img3.style.display = 'none'; }

    // ใส่ชื่อและประเภท
    document.getElementById('modalName').innerText = item.name_ii || '-';
    document.getElementById('modalType').innerText = item.type_ii || '-';

    // เปลี่ยนจาก display: none เป็น display: flex เพื่อโชว์ Modal
    modal.style.display = 'flex';
}

// --- ฟังก์ชันสำหรับปิด Popup ---
function closeIdeaModal() {
    const modal = document.getElementById('ideaModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// --- ทำให้คลิกพื้นที่ว่างสีดำนอกกรอบเพื่อปิด Popup ได้ ---
window.onclick = function(event) {
    const modal = document.getElementById('ideaModal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

// เรียกทำงานเมื่อโหลดหน้าเว็บเรียบร้อย
document.addEventListener('DOMContentLoaded', () => {
    loadMainData();
    loadWorks();
    loadContactData(); 
    loadIdeaData(); // เพิ่มการเรียกฟังก์ชันดึงข้อมูลไอเดียตรงนี้
});