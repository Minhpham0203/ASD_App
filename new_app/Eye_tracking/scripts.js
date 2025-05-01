document.addEventListener('DOMContentLoaded', () => {
    const statusDiv = document.getElementById('status');
    const startButton = document.getElementById('start-button');
    const stopButton = document.getElementById('stop-button');
    const outputStatusDiv = document.getElementById('output-status');

    let eyeTrackingActive = false;
    const gazeHistory = [];

    webgazer.params.showVideo = false;
    webgazer.params.showGazeDot = true;

    webgazer.setGazeListener(function(data, elapsedTime) {
        if (eyeTrackingActive && data) {
            gazeHistory.push({
                x: data.x,
                y: data.y,
                timestamp: Date.now()
            });
        }
    })
    .begin()
    .then(function() {
        statusDiv.textContent = 'WebGazer đã sẵn sàng.';
        startButton.disabled = false;
    })
    .catch(function(err) {
        if (err.message === 'Permission dismissed') {
            statusDiv.textContent = 'Lỗi: Quyền truy cập webcam bị từ chối. Vui lòng kiểm tra cài đặt trình duyệt của bạn và cho phép trang web này truy cập webcam để theo dõi mắt.';
        } else {
            statusDiv.textContent = 'Lỗi khởi tạo WebGazer: ' + err.message;
        }
        console.error("Lỗi WebGazer:", err);
    });

    startButton.addEventListener('click', () => {
        eyeTrackingActive = true;
        startButton.disabled = true;
        stopButton.disabled = false;
        outputStatusDiv.textContent = 'Đang thu thập dữ liệu...';
    });

    stopButton.addEventListener('click', () => {
        eyeTrackingActive = false;
        startButton.disabled = false;
        stopButton.disabled = true;
        outputStatusDiv.textContent = 'Đã dừng thu thập. Đang gửi dữ liệu...';
        webgazer.end();

        if (gazeHistory.length > 0) {
            fetch('/upload-eye-data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ data: gazeHistory }),
            })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    outputStatusDiv.textContent = 'Dữ liệu theo dõi mắt đã được gửi và lưu thành công.';
                    gazeHistory.length = 0;
                } else {
                    outputStatusDiv.textContent = `Lỗi khi gửi dữ liệu: ${result.message || 'Không xác định'}`;
                }
            })
            .catch(error => {
                console.error('Lỗi mạng khi gửi dữ liệu:', error);
                outputStatusDiv.textContent = 'Lỗi mạng khi gửi dữ liệu.';
            });
        } else {
            outputStatusDiv.textContent = 'Không có dữ liệu để gửi.';
        }

        webgazer.begin()
        .then(function() {
            statusDiv.textContent = 'WebGazer đã sẵn sàng.';
            startButton.disabled = false;
        })
        .catch(function(err) {
            if (err.message === 'Permission dismissed') {
                statusDiv.textContent = 'Lỗi: Quyền truy cập webcam bị từ chối. Vui lòng kiểm tra cài đặt trình duyệt của bạn và cho phép trang web này truy cập webcam để theo dõi mắt.';
            } else {
                statusDiv.textContent = 'Lỗi khởi tạo lại WebGazer: ' + err.message;
            }
            console.error("Lỗi WebGazer:", err);
        });
    });
});