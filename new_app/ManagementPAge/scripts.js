function openTab(tabId) {
    const tabs = document.querySelectorAll('.tab-content');
    const buttons = document.querySelectorAll('.tab-button');
    tabs.forEach(tab => tab.classList.remove('active'));
    buttons.forEach(button => button.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    const currentButton = Array.from(buttons).find(button => button.getAttribute('onclick').includes(`'${tabId}'`));
    if (currentButton) {
        currentButton.classList.add('active');
    }

    // Tải danh sách bệnh nhân khi chuyển sang tab "Tất Cả Bệnh Nhân"
    if (tabId === 'all-patients') {
        loadPatientList();
    }
}

async function loadPatientList() {
    const patientListBody = document.getElementById('patient-list-body');
    patientListBody.innerHTML = ''; // Xóa dữ liệu cũ

    try {
        const response = await fetch('/patients');
        const result = await response.json();

        if (result.success && result.patients) {
            result.patients.forEach(patient => {
                const row = patientListBody.insertRow();
                row.insertCell().textContent = patient.ID;
                row.insertCell().textContent = patient.Tên;
                row.insertCell().textContent = patient['Ngày Sinh'];
                row.insertCell().textContent = patient['Giới Tính'];
                row.insertCell().textContent = patient['Liên Hệ'];
                row.insertCell().textContent = patient['Số lần chẩn đoán'];
                row.insertCell().textContent = patient['Lần chẩn đoán gần nhất'];
                row.insertCell().textContent = patient['Kết quả chẩn đoán gần nhất'];
                // Thêm cột "Hành Động" nếu cần (ví dụ: nút chỉnh sửa, xóa)
               
            });
        } else {
            console.error('Lỗi khi tải danh sách bệnh nhân:', result.message || 'Không xác định');
            patientListBody.innerHTML = '<tr><td colspan="6">Không thể tải danh sách bệnh nhân.</td></tr>';
        }
    } catch (error) {
        console.error('Lỗi mạng khi tải danh sách bệnh nhân:', error);
        patientListBody.innerHTML = '<tr><td colspan="6">Lỗi mạng khi tải danh sách bệnh nhân.</td></tr>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const addPatientForm = document.getElementById('add-patient-form');
    const addStatusDiv = document.getElementById('add-status');

    addPatientForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(addPatientForm);
        const patientData = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('/add-patient', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(patientData),
            });

            const result = await response.json();

            if (result.success) {
                addStatusDiv.textContent = 'Thêm bệnh nhân thành công!';
                addPatientForm.reset();
                // Tải lại danh sách bệnh nhân sau khi thêm thành công
                if (document.getElementById('all-patients').classList.contains('active')) {
                    loadPatientList();
                }
            } else {
                addStatusDiv.textContent = `Lỗi khi thêm bệnh nhân: ${result.message || 'Không xác định'}`;
            }
        } catch (error) {
            console.error('Lỗi mạng:', error);
            addStatusDiv.textContent = 'Lỗi mạng khi gửi yêu cầu.';
        }
    });

    // Tải danh sách bệnh nhân ban đầu nếu tab "Tất Cả Bệnh Nhân" đang hoạt động
    if (document.getElementById('all-patients').classList.contains('active')) {
        loadPatientList();
    }
});