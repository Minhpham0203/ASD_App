const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const port = 3000;

// Middleware để xử lý dữ liệu JSON trong body của request
app.use(bodyParser.json());

// Đường dẫn để lấy danh sách tất cả bệnh nhân
app.get('/patients', async (req, res) => {
    const csvFilePath = path.join(__dirname, 'patients.csv');

    try {
        const data = await fs.readFile(csvFilePath, 'utf8');
        const lines = data.trim().split('\n');
        const header = lines[0].split(',');
        const patients = [];

        // Bỏ qua header và xử lý từng dòng dữ liệu
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

// Đường dẫn để xử lý việc thêm bệnh nhân
app.post('/add-patient', async (req, res) => {
    const patientData = req.body;
    const csvFilePath = path.join(__dirname, 'patients.csv');
    const header = "ID,Tên,Ngày Sinh,Giới Tính,Liên Hệ,Số lần chẩn đoán, Lần chẩn đoán gần nhất, Kết quả chẩn đoán gần nhất\n";
    const dataRow = `${patientData.id},${patientData.name},${patientData.dob || ''},${patientData.gender || ''},${patientData.contact || ''}\n`;

    try {
        // Kiểm tra xem file đã tồn tại chưa. Nếu chưa, ghi header trước
        await fs.access(csvFilePath).catch(() => fs.writeFile(csvFilePath, header, 'utf8'));

        // Ghi dữ liệu bệnh nhân vào file
        await fs.appendFile(csvFilePath, dataRow, 'utf8');

        res.json({ success: true });
    } catch (error) {
        console.error('Lỗi khi ghi file CSV:', error);
        res.status(500).json({ success: false, message: 'Không thể ghi dữ liệu vào file.' });
    }
});

// Phục vụ các file tĩnh (HTML, CSS, JS) từ thư mục hiện tại
app.use(express.static(__dirname));

app.listen(port, () => {
    console.log(`Server đang lắng nghe tại http://localhost:${port}`);
});