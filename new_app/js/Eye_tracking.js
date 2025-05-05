document.addEventListener('DOMContentLoaded', () => {
    const statusDiv = document.getElementById('status');
    const outputStatusDiv = document.getElementById('output-status');
    const toggleWebcamButton = document.getElementById('toggle-webcam');
    const toggleSlideshowButton = document.getElementById('toggle-slideshow');
    const slideshowContainer = document.getElementById('slideshow-container');
    const slideshowImage = document.getElementById('slideshow-image');
    const fullscreenSlideshow = document.getElementById('fullscreen-slideshow');
    const fullscreenImage = document.getElementById('fullscreen-image');
    const closeFullscreenButton = document.getElementById('close-fullscreen');
    const patientSelect = document.getElementById('patient-select'); // Lấy tham chiếu đến select

    let eyeTrackingActive = false;
    let webcamEnabled = false;
    let slideshowEnabled = false;
    let currentPatientId = null;
    let currentPatientName = null;
    const gazeHistory = [];

    webgazer.params.showVideo = false;
    webgazer.params.showGazeDot = true;

    function initWebgazer() {
        webgazer.setGazeListener(function(data, elapsedTime) {
            if (eyeTrackingActive && data && webcamEnabled && currentPatientId) {
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
        })
        .catch(function(err) {
            if (err.message === 'Permission dismissed') {
                statusDiv.textContent = 'Lỗi: Quyền truy cập webcam bị từ chối. Vui lòng kiểm tra cài đặt trình duyệt của bạn và cho phép trang web này truy cập webcam để theo dõi mắt.';
            } else {
                statusDiv.textContent = 'Lỗi khởi tạo WebGazer: ' + err.message;
            }
            console.error("Lỗi WebGazer:", err);
        });
    }

    toggleWebcamButton.addEventListener('click', () => {
        webcamEnabled = !webcamEnabled;
        toggleWebcamButton.textContent = webcamEnabled ? 'Tắt Webcam' : 'Bật Webcam';
        eyeTrackingActive = webcamEnabled && currentPatientId; // Chỉ kích hoạt nếu webcam và bệnh nhân được chọn
        outputStatusDiv.textContent = eyeTrackingActive ? 'Đang thu thập dữ liệu...' : 'Đã dừng thu thập.';
        if (webcamEnabled) {
            initWebgazer();
        } else {
            webgazer.pause();
        }
    });

    // Lấy danh sách bệnh nhân từ server và đổ vào dropdown
    fetch('http://localhost:3000/patients')
        .then(response => response.json())
        .then(data => {
            console.log('Dữ liệu bệnh nhân từ server (Eye Tracking Page):', data);
            if (data.success && data.patients) {
                data.patients.forEach(patient => {
                    const option = document.createElement('option');
                    option.value = patient.ID; // Sử dụng ID làm giá trị
                    option.textContent = `${patient.ID} - ${patient['Name']}`; // Hiển thị ID và tên
                    patientSelect.appendChild(option);
                });
            } else {
                console.error('Lỗi khi tải danh sách bệnh nhân:', data ? data.message : 'Không có dữ liệu bệnh nhân.');
                statusDiv.textContent = 'Lỗi: Không thể tải danh sách bệnh nhân.';
            }
        })
        .catch(error => {
            console.error('Lỗi khi tải dữ liệu bệnh nhân:', error);
            statusDiv.textContent = 'Lỗi: Không thể kết nối đến server để tải danh sách bệnh nhân.';
        });

    // Lắng nghe sự kiện thay đổi trên dropdown bệnh nhân
    patientSelect.addEventListener('change', (event) => {
        const selectedPatientId = event.target.value;
        const selectedOption = patientSelect.options[patientSelect.selectedIndex];
        const selectedPatientText = selectedOption.textContent;
        const namePart = selectedPatientText.split(' - ')[1]; // Lấy phần tên sau dấu '-'

        currentPatientId = selectedPatientId;
        currentPatientName = namePart;
        eyeTrackingActive = webcamEnabled && currentPatientId; // Kích hoạt theo dõi khi có bệnh nhân được chọn
        outputStatusDiv.textContent = eyeTrackingActive ? 'Đang thu thập dữ liệu...' : 'Đã dừng thu thập.';
        console.log('Bệnh nhân đã chọn:', currentPatientId, currentPatientName);
    });

    // Slideshow ảnh (giữ nguyên)
    const allImageNames = Array.from({ length: 300 }, (_, i) => `${i + 1}.png`);
    let slideshowImages = [];
    let currentImageIndex = 0;
    const slideshowDelay = 3000; // 3 giây
    let slideshowInterval;

    function selectRandomImages(imageNames, count) {
        const shuffled = [...imageNames].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    function showCurrentImage() {
        if (slideshowImages.length > 0) {
            slideshowImage.src = `/images/${slideshowImages[currentImageIndex]}`;
            fullscreenImage.src = `/images/${slideshowImages[currentImageIndex]}`;
        }
    }

    function nextImage() {
        currentImageIndex = (currentImageIndex + 1) % slideshowImages.length;
        showCurrentImage();
    }

    function startSlideshow() {
        slideshowImages = selectRandomImages(allImageNames, 30);
        currentImageIndex = 0;
        showCurrentImage();
        slideshowInterval = setInterval(nextImage, slideshowDelay);
        slideshowEnabled = true;
        slideshowContainer.style.display = 'block';
        toggleSlideshowButton.textContent = 'Tắt Slideshow';
    }

    function stopSlideshow() {
        clearInterval(slideshowInterval);
        slideshowEnabled = false;
        slideshowContainer.style.display = 'none';
        fullscreenSlideshow.style.display = 'none';
        toggleSlideshowButton.textContent = 'Bật Slideshow';
    }

    toggleSlideshowButton.addEventListener('click', () => {
        if (!slideshowEnabled) {
            startSlideshow();
        } else {
            stopSlideshow();
        }
    });

    slideshowImage.addEventListener('click', () => {
        if (slideshowEnabled && slideshowImages.length > 0) {
            fullscreenImage.src = `/images/${slideshowImages[currentImageIndex]}`;
            fullscreenSlideshow.style.display = 'flex';
        }
    });

    closeFullscreenButton.addEventListener('click', () => {
        fullscreenSlideshow.style.display = 'none';
    });

    // Hàm gửi dữ liệu eye tracking lên server
    function sendEyeTrackingData() {
        if (eyeTrackingActive && gazeHistory.length > 0 && currentPatientId && currentPatientName) {
            const dataToSend = {
                patientId: currentPatientId,
                patientName: currentPatientName,
                data: gazeHistory
            };

            fetch('/upload-eye-data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dataToSend)
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    outputStatusDiv.textContent = `Dữ liệu đã được lưu cho bệnh nhân ${currentPatientId} - ${currentPatientName}.`;
                    gazeHistory.length = 0; // Xóa lịch sử sau khi gửi
                } else {
                    outputStatusDiv.textContent = `Lỗi khi lưu dữ liệu: ${data.message}`;
                }
            })
            .catch(error => {
                console.error('Lỗi khi gửi dữ liệu theo dõi mắt:', error);
                outputStatusDiv.textContent = 'Lỗi kết nối khi gửi dữ liệu.';
            });
        } else if (!currentPatientId) {
            outputStatusDiv.textContent = 'Vui lòng chọn bệnh nhân trước khi thu thập dữ liệu.';
        }
    }

    // Gọi hàm gửi dữ liệu định kỳ (ví dụ mỗi 5 giây)
    setInterval(sendEyeTrackingData, 5000);
});