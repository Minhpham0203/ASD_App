import streamlit as st
import os
import random
from PIL import Image
import pandas as pd
from datetime import datetime
from core import *
# ==================== STREAMLIT UI ====================
st.set_page_config(page_title="ASD Eye Tracking", page_icon="👀", layout="centered")
st.markdown("""
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&display=swap');
    
    * {
        font-family: 'Poppins', sans-serif;
        line-height: 1.5;
        letter-spacing: 0.02em;
    }
    
    /* Đây là phần bạn sửa lại */
    h1 {
        font-size: 46px;
        text-transform: uppercase;
        color: #003366 !important;
        background: none !important;
        -webkit-text-fill-color: #003366 !important;
        text-align: left;
    }
    
    h4 {
        font-size: 24px;
        font-weight: bold;
        text-transform: uppercase;
        color: #003366;
        letter-spacing: calc(24px * 0.02);
    }
    
    p, select, input {
        font-size: 18px;
        line-height: calc(18px * 1.5);
        margin-bottom: calc(18px * 1);
        letter-spacing: calc(18px * 0.02);
    }
    
    .small-text {
        font-size: 16px;
        text-align: right;
        line-height: calc(16px * 1.5);
        margin-bottom: calc(16px * 1);
        letter-spacing: calc(16px * 0.02);
    }
    </style>
""", unsafe_allow_html=True)


st.title("Diagnose via Eye Tracking")

data0 = pd.read_excel("app/management/all-records.xlsx")
patient_list = data0["ID"].astype(str) + "-" + data0["Name"]
selected_patient = st.selectbox("Choose patient", patient_list)

if st.button("Start"):
    # Tạo folder phiên chẩn đoán
    current_time = datetime.now().strftime("%Hh%M-%d-%b-%Y").lower()
    patient_folder = os.path.join("app", "management", selected_patient, current_time)
    os.makedirs(patient_folder, exist_ok=True)

    # Bắt đầu thu ánh mắt
    stop_event.clear()
    cam_thread = threading.Thread(target=capture_eye_tracking)
    cam_thread.start()

    # Trình chiếu ảnh
    image_paths = [os.path.join(image_folder, f) for f in os.listdir(image_folder) if f.lower().endswith((".jpg", ".png"))]
    selected_images = random.sample(image_paths, min(num_images, len(image_paths)))
    img_placeholder = st.empty()
    for img_path in selected_images:
        img = Image.open(img_path)
        img_placeholder.image(img, use_column_width=True)
        time.sleep(display_time)
        img_placeholder.image(gray_img, use_column_width=True)
        time.sleep(1)

    # Dừng thu ánh mắt
    stop_event.set()
    cam_thread.join()
    st.success("Eye tracking completed!")

    # Lưu CSV
    csv_path = os.path.join(patient_folder, "eye_tracking_data.csv")
    with open(csv_path, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["RecordingTime [ms]", "Point of Regard Right X [px]", "Point of Regard Right Y [px]", "Point of Regard Left X [px]", "Point of Regard Left Y [px]"])
        writer.writerows(eye_data)

    # Vẽ scanpath
    raw_data = read_csv_data(csv_path)
    if len(raw_data) >= 10:
        smooth = exponential_moving_average(raw_data, alpha=1)
        v, a, j = calculate_velocity_acceleration_jerk(smooth)
        scanpath_img = os.path.join(patient_folder, "scanpath.png")
        render_scanpath(smooth, v, a, j, alpha_line=0.5, skip_n=3, output_file=scanpath_img)

        # Chẩn đoán và annotate
        label = diagnose_image(scanpath_img)
        

        # Cập nhật Excel all-records.xlsx
        xl_file = "app/management/all-records.xlsx"
        df = pd.read_excel(xl_file)
        pid = selected_patient.split("-", 1)[0]
        mask = df["ID"].astype(str) == pid
        # Tăng tổng số phiên
        df.loc[mask, "Total sessions"] = df.loc[mask, "Total sessions"].fillna(0).astype(int) + 1
        # Cập nhật phiên gần nhất và kết quả
        patient_session_folder= os.path.basename(patient_folder)
        df.loc[mask, "Latest session"] = patient_session_folder
        df.loc[mask, "Latest  Result"] = label
        df.to_excel(xl_file, index=False)

        new_path = os.path.join(patient_folder, f"{label}.csv")

        os.rename(csv_path, new_path)

    st.success("Diagnosis completed!")
