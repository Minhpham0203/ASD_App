const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const port = 3000;

app.use(bodyParser.json({ limit: '5mb' }));

// ... (các route /patients và /add-patient) ...

app.post('/upload-eye-data', async (req, res) => {
    const eyeData = req.body.data;
    const csvFilePath = path.join(__dirname, 'eye_tracking_data.csv');
    const header = "x,y,timestamp\n";
    const dataRows = eyeData.map(item => `${item.x},${item.y},${item.timestamp}\n`).join('');

    try {
        await fs.access(csvFilePath).catch(() => fs.writeFile(csvFilePath, header, 'utf8'));
        await fs.appendFile(csvFilePath, dataRows, 'utf8');
        res.json({ success: true });
    } catch (error) {
        console.error('Lỗi khi ghi file CSV theo dõi mắt:', error);
        res.status(500).json({ success: false, message: 'Không thể ghi dữ liệu theo dõi mắt vào file.' });
    }
});

app.use(express.static(__dirname));

app.listen(port, () => {
    console.log(`Server đang lắng nghe tại http://localhost:${port}`);
});