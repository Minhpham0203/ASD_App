const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const port = 3000;

// Middleware để xử lý dữ liệu JSON trong body của request
app.use(bodyParser.json({ limit: '5mb' }));

// Phục vụ các file ảnh từ thư mục 'images' với tiền tố '/images'
app.use('/images', express.static(path.join(__dirname, 'images')));

// Phục vụ CSS từ thư mục 'css' với tiền tố '/css'
app.use('/css', express.static(path.join(__dirname, 'css')));

// Phục vụ JS từ thư mục 'js' với tiền tố '/js'
app.use('/js', express.static(path.join(__dirname, 'js')));

// Phục vụ file HTML cho trang chủ
app.get('/', async (req, res) => {
    try {
        const htmlPath = path.join(__dirname, 'pages', 'Home.html');
        const html = await fs.readFile(htmlPath, 'utf8');
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(html);
    } catch (error) {
        console.error('Lỗi khi tải trang chủ:', error);
        res.status(404).send('Không tìm thấy trang chủ');
    }
}); 

// Phục vụ file HTML cho trang theo dõi mắt
app.get('/eye-tracker', async (req, res) => {
    try {
        const htmlPath = path.join(__dirname, 'pages', 'Eye_tracking.html');
        const html = await fs.readFile(htmlPath, 'utf8');
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(html);
    } catch (error) {
        console.error('Lỗi khi tải trang theo dõi mắt:', error);
        res.status(404).send('Không tìm thấy trang theo dõi mắt');
    }
});

// Route xử lý dữ liệu theo dõi mắt
app.post('/upload-eye-data', async (req, res) => {
    const eyeData = req.body.data;
    const patientId = req.body.patientId;
    const patientName = req.body.patientName;

    if (!patientId || !patientName) {
        return res.status(400).json({ success: false, message: 'Thiếu thông tin bệnh nhân.' });
    }

const csvFileName = `${patientId}-${patientName}.csv`;
    const csvFilePath = path.join(__dirname, 'data', 'eye_tracking', csvFileName); // Tạo thư mục 'eye_tracking' nếu chưa có
    const header = "x,y,timestamp\n";
    const dataRows = eyeData.map(item => `${item.x},${item.y},${item.timestamp}\n`).join('');

    try {
        // Tạo thư mục 'eye_tracking' nếu chưa tồn tại
        const eyeTrackingDir = path.join(__dirname, 'data', 'eye_tracking');
        await fs.mkdir(eyeTrackingDir, { recursive: true });

        await fs.access(csvFilePath).catch(() => fs.writeFile(csvFilePath, header, 'utf8'));
        await fs.appendFile(csvFilePath, dataRows, 'utf8');
        res.json({ success: true });
    } catch (error) {
        console.error('Lỗi khi ghi file CSV theo dõi mắt:', error);
        res.status(500).json({ success: false, message: 'Không thể ghi dữ liệu theo dõi mắt vào file.' });
    }
});


// Phục vụ file HTML cho trang quản lý bệnh nhân
app.get('/patients-page', async (req, res) => {
    try {
        const htmlPath = path.join(__dirname, 'pages', 'Management.html');
        const html = await fs.readFile(htmlPath, 'utf8');
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(html);
    } catch (error) {
        console.error('Lỗi khi tải trang quản lý bệnh nhân:', error);
        res.status(404).send('Không tìm thấy trang quản lý bệnh nhân');
    }
});

// Route lấy danh sách tất cả bệnh nhân
app.get('/patients', async (req, res) => {
    const csvFilePath = path.join(__dirname, 'data', 'patients.csv');

    try {
        const data = await fs.readFile(csvFilePath, 'utf8');
        const lines = data.trim().split('\n');
        const header = lines[0].split(',');
        const patients = [];

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',');
            const patient = {};
            for (let j = 0; j < header.length; j++) {
                patient[header[j]] = values[j] ? values[j].trim() : '';
            }
            patients.push(patient);
        }

        res.json({ success: true, patients: patients });
    } catch (error) {
        console.error('Lỗi khi đọc file CSV:', error);
        res.status(500).json({ success: false, message: 'Không thể đọc dữ liệu từ file.' });
    }
});

// Route xử lý việc thêm bệnh nhân
app.post('/add-patient', async (req, res) => {
    const patientData = req.body;
    const csvFilePath = path.join(__dirname, 'data', 'patients.csv');
    const header = "ID,Name,DOB,Gender,Contact,Total sessions,Latest session,Latest result\n";
    const dataRow = `${patientData.id},${patientData.name},${patientData.dob || ''},${patientData.gender || ''},${patientData.contact || ''},0,,\n`; // Thêm giá trị mặc định cho các cột mới

    try {
        await fs.access(csvFilePath).catch(() => fs.writeFile(csvFilePath, header, 'utf8'));
        await fs.appendFile(csvFilePath, dataRow, 'utf8');
        res.json({ success: true });
    } catch (error) {
        console.error('Lỗi khi ghi file CSV:', error);
        res.status(500).json({ success: false, message: 'Không thể thêm bệnh nhân.' });
    }
});

// Route xử lý việc sửa bệnh nhân
app.post('/edit-patient', async (req, res) => {
    const patientData = req.body;
    const csvFilePath = path.join(__dirname, 'data', 'patients.csv');

    try {
        const data = await fs.readFile(csvFilePath, 'utf8');
        const lines = data.trim().split('\n');
        const header = lines[0].split(',');
        const patients = [];
        let found = false;

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',');
            const patient = {};
            for (let j = 0; j < header.length; j++) {
                patient[header[j]] = values[j] ? values[j].trim() : '';
            }
            if (patient.ID === patientData.id) {
                patient.Tên = patientData.name;
                patient['Dob'] = patientData.dob || '';
                patient['Gender'] = patientData.gender || '';
                patient['Contact'] = patientData.contact || '';
                found = true;
            }
            patients.push(patient);
        }

        if (found) {
            const updatedData = [header.join(','), ...patients.map(p => Object.values(p).join(','))].join('\n');
            await fs.writeFile(csvFilePath, updatedData, 'utf8');
            res.json({ success: true });
        } else {
            res.status(404).json({ success: false, message: 'Không tìm thấy bệnh nhân để sửa.' });
        }
    } catch (error) {
        console.error('Lỗi khi sửa file CSV:', error);
        res.status(500).json({ success: false, message: 'Không thể sửa thông tin bệnh nhân.' });
    }
});

// Route xử lý việc xóa bệnh nhân
app.post('/delete-patient', async (req, res) => {
    const patientIdToDelete = req.body.id;
    const csvFilePath = path.join(__dirname, 'data', 'patients.csv');

    try {
        const data = await fs.readFile(csvFilePath, 'utf8');
        const lines = data.trim().split('\n');
        const header = lines[0].split(',');
        const patients = [];
        let deleted = false;

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',');
            const patient = {};
            for (let j = 0; j < header.length; j++) {
                patient[header[j]] = values[j] ? values[j].trim() : '';
            }
            if (patient.ID !== patientIdToDelete) {
                patients.push(patient);
            } else {
                deleted = true;
            }
        }

        if (deleted) {
            const updatedData = [header.join(','), ...patients.map(p => Object.values(p).join(','))].join('\n');
            await fs.writeFile(csvFilePath, updatedData, 'utf8');
            res.json({ success: true });
        } else {
            res.status(404).json({ success: false, message: 'Không tìm thấy bệnh nhân để xóa.' });
        }
    } catch (error) {
        console.error('Lỗi khi xóa file CSV:', error);
        res.status(500).json({ success: false, message: 'Không thể xóa bệnh nhân.' });
    }
});


app.listen(port, () => {
    console.log(`Server đang lắng nghe tại http://localhost:${port}`);
});