document.addEventListener('DOMContentLoaded', function() {
    const patientListTableBody = document.getElementById('patient-list-body');
    const addPatientForm = document.getElementById('add-patient-form');
    const addStatusDiv = document.getElementById('add-status');
    const editPatientSelect = document.getElementById('edit-patient-select');
    const editPatientForm = document.getElementById('edit-patient-form');
    const editStatusDiv = document.getElementById('edit-status');
    const deletePatientSelect = document.getElementById('delete-patient-select');
    const deleteButton = document.getElementById('delete-button');
    const deleteStatusDiv = document.getElementById('delete-status');

    let allPatientsData = []; // Lưu trữ toàn bộ dữ liệu bệnh nhân

    function fetchPatients() {
        fetch('/patients')
            .then(response => response.json())
            .then(data => {
                if (data.success && data.patients) {
                    allPatientsData = data.patients;
                    renderPatientTable(data.patients);
                    populateEditPatientSelect(data.patients);
                    populateDeletePatientSelect(data.patients);
                } else {
                    console.error('Lỗi khi tải danh sách bệnh nhân:', data ? data.message : 'Không có dữ liệu bệnh nhân.');
                    patientListTableBody.innerHTML = '<tr><td colspan="9">Không thể tải danh sách bệnh nhân.</td></tr>';
                }
            })
            .catch(error => {
                console.error('Lỗi kết nối khi tải bệnh nhân:', error);
                patientListTableBody.innerHTML = '<tr><td colspan="9">Lỗi kết nối đến server.</td></tr>';
            });
    }

    function renderPatientTable(patients) {
        patientListTableBody.innerHTML = '';
        patients.forEach(patient => {
            const row = patientListTableBody.insertRow();
            row.insertCell().textContent = patient.ID;
            row.insertCell().textContent = patient['Name'];
            row.insertCell().textContent = patient['DOB'] || '';
            row.insertCell().textContent = patient['Gender'] || '';
            row.insertCell().textContent = patient['Contact'] || '';
            row.insertCell().textContent = patient['Total sessions'] || '0';
            row.insertCell().textContent = patient['Latest session'] || '';
            row.insertCell().textContent = patient['Latest result'] || '';
        });
    }

    // --- Thêm bệnh nhân ---
    addPatientForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const formData = new FormData(this);
        const patientData = Object.fromEntries(formData);

        fetch('/add-patient', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(patientData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                addStatusDiv.textContent = 'Đã thêm bệnh nhân thành công.';
                addPatientForm.reset();
                fetchPatients(); // Cập nhật lại bảng
            } else {
                addStatusDiv.textContent = 'Lỗi khi thêm bệnh nhân: ' + data.message;
            }
        })
        .catch(error => {
            console.error('Lỗi khi thêm bệnh nhân:', error);
            addStatusDiv.textContent = 'Lỗi kết nối khi thêm bệnh nhân.';
        });
    });

    // --- Sửa bệnh nhân ---
    function populateEditPatientSelect(patients) {
        editPatientSelect.innerHTML = '<option value="">Chọn bệnh nhân để sửa</option>';
        patients.forEach(patient => {
            const option = document.createElement('option');
            option.value = patient.ID;
            option.textContent = `${patient.ID} - ${patient.Tên}`;
            editPatientSelect.appendChild(option);
        });
    }

    editPatientSelect.addEventListener('change', function() {
        const selectedId = this.value;
        const selectedPatient = allPatientsData.find(p => p.ID === selectedId);
        if (selectedPatient) {
            document.getElementById('edit-id').value = selectedPatient.ID;
            document.getElementById('edit-name').value = selectedPatient.Tên;
            document.getElementById('edit-dob').value = selectedPatient['Ngày Sinh'] || '';
            document.getElementById('edit-gender').value = selectedPatient['Giới Tính'] || '';
            document.getElementById('edit-contact').value = selectedPatient['Liên Hệ'] || '';
            editPatientForm.style.display = 'block';
        } else {
            editPatientForm.style.display = 'none';
        }
    });

    editPatientForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const formData = new FormData(this);
        const patientData = Object.fromEntries(formData);

        fetch('/edit-patient', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(patientData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                editStatusDiv.textContent = 'Đã sửa thông tin bệnh nhân thành công.';
                fetchPatients(); // Cập nhật lại bảng và dropdown
                editPatientForm.style.display = 'none';
                editPatientSelect.value = '';
            } else {
                editStatusDiv.textContent = 'Lỗi khi sửa thông tin bệnh nhân: ' + data.message;
            }
        })
        .catch(error => {
            console.error('Lỗi khi sửa bệnh nhân:', error);
            editStatusDiv.textContent = 'Lỗi kết nối khi sửa thông tin bệnh nhân.';
        });
    });

    // --- Xóa bệnh nhân ---
    function populateDeletePatientSelect(patients) {
        deletePatientSelect.innerHTML = '<option value="">Chọn bệnh nhân để xóa</option>';
        patients.forEach(patient => {
            const option = document.createElement('option');
            option.value = patient.ID;
            option.textContent = `${patient.ID} - ${patient.Tên}`;
            deletePatientSelect.appendChild(option);});
        }
    
        deletePatientSelect.addEventListener('change', function() {
            deleteButton.disabled = !this.value;
        });
    
        deleteButton.addEventListener('click', function() {
            const patientIdToDelete = deletePatientSelect.value;
            if (patientIdToDelete) {
                fetch('/delete-patient', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ id: patientIdToDelete })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        deleteStatusDiv.textContent = 'Đã xóa bệnh nhân thành công.';
                        fetchPatients(); // Cập nhật lại bảng và dropdown
                        deletePatientSelect.value = '';
                        deleteButton.disabled = true;
                    } else {
                        deleteStatusDiv.textContent = 'Lỗi khi xóa bệnh nhân: ' + data.message;
                    }
                })
                .catch(error => {
                    console.error('Lỗi khi xóa bệnh nhân:', error);
                    deleteStatusDiv.textContent = 'Lỗi kết nối khi xóa bệnh nhân.';
                });
            }
        });
    
        // --- Tabs ---
        function openTab(tabId) {
            const tabContents = document.querySelectorAll('.tab-content');
            tabContents.forEach(content => {
                content.style.display = 'none';
            });
            document.getElementById(tabId).style.display = 'block';
        }
    
        // Mặc định mở tab "add-patient" khi tải trang
        openTab('add-patient');
    
        // Tải danh sách bệnh nhân khi trang tải
        fetchPatients();
    });