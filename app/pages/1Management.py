import streamlit as st
import pandas as pd
import os, glob
import shutil
from pathlib import Path
# Cấu hình chung
st.set_page_config(page_title="ASD Eye Tracking", page_icon="👀", layout="centered")
st.markdown("""
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&display=swap');
    
    * {
        font-family: 'Poppins', sans-serif;
        line-height: 1.5;
        letter-spacing: 0.02em;
    }
    
    h1 {
        font-size: 46px;
        text-transform: uppercase;
        color: #003366 !important;
        background: none !important;
        -webkit-text-fill-color: #003366 !important;
        
    }
    
    h4 {
        font-size: 24px;
        font-weight: bold;
        text-transform: uppercase;
        color: #003366;
        /* line-height: calc(24px * 1.5); */
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

st.title("Management")
st.header("All Patients")

# Đường dẫn chung
base_path = "app/management"
records_file = os.path.join(base_path, "all-records.xlsx")

# ===== Hiển thị tất cả bệnh nhân =====
data = pd.read_excel(records_file)
st.dataframe(data.set_index(data.columns[0]), use_container_width=True)

# Tạo 3 tab
tab1, tab2, tab3 = st.tabs(["Add patient", "Edit patient", "Delete patient"])

# ===== TAB 1: Add patient (dùng nguyên code của bạn) =====
with tab1:
    id = st.text_input("ID", placeholder="", key="add_id")
    name = st.text_input("Name", key="add_name")
    dob = st.text_input("Date of Birth", placeholder="22-oct-2004", key="add_dob")
    gender = st.text_input("Gender", placeholder="Male/ Female", key="add_gender")
    contact = st.text_input("Contact", key="add_contact")

    if st.button("Add Patient", key="add_button"):
        if id.strip() and name.strip():
            folder_name = f"{id}-{name}"
            patient_folder_path = os.path.join(base_path, folder_name)
            try:
                # Tạo thư mục bệnh nhân nếu chưa có
                os.makedirs(patient_folder_path, exist_ok=True)
                
                # Tạo dòng dữ liệu mới
                new_data = {
                    "ID": id,
                    "Name": name,
                    "DOB": dob,
                    "Gender": gender,
                    "Contact": contact
                }
                
                # Đọc file cũ và cập nhật
                df_old = pd.read_excel(records_file)
                df_new = pd.concat([df_old, pd.DataFrame([new_data])], ignore_index=True)
                df_new.to_excel(records_file, index=False)
                
                st.success("Patient added successfully and saved to file!")
            except Exception as e:
                st.error(f"Error creating patient folder or updating file: {e}")
        else:
            st.error("Please fill in at least the ID and Name fields!")

# ===== TAB 2: Edit patient =====
with tab2:
    # Đọc danh sách bệnh nhân
    df = pd.read_excel(records_file)
    patient_list = df["ID"].astype(str) + "-" + df["Name"]
    selected = st.selectbox("Select patient to edit", patient_list, key="edit_select")
    
    if selected:
        idx = patient_list.tolist().index(selected)
        rec = df.loc[idx]
        # Hiển thị form với giá trị hiện tại
        edit_id = st.text_input("ID", value=rec["ID"], key="edit_id")
        edit_name = st.text_input("Name", value=rec["Name"], key="edit_name")
        edit_dob = st.text_input("Date of Birth", value=rec["DOB"], key="edit_dob")
        edit_gender = st.text_input("Gender", value=rec["Gender"], key="edit_gender")
        edit_contact = st.text_input("Contact", value=rec["Contact"], key="edit_contact")

        if st.button("Save Changes", key="save_button"):
            if edit_id.strip() and edit_name.strip():
                old_folder = os.path.join(base_path, f"{rec['ID']}-{rec['Name']}")
                new_folder = os.path.join(base_path, f"{edit_id}-{edit_name}")
                try:
                    # Đổi tên thư mục nếu ID hoặc Name thay đổi
                    if old_folder != new_folder:
                        os.rename(old_folder, new_folder)
                    # Cập nhật file Excel
                    df.loc[idx, ["ID","Name","DOB","Gender","Contact"]] = [
                        edit_id, edit_name, edit_dob, edit_gender, edit_contact
                    ]
                    df.to_excel(records_file, index=False)
                    st.success("Patient information updated successfully!")
                except Exception as e:
                    st.error(f"Error updating patient info: {e}")
            else:
                st.error("Please fill in at least the ID and Name fields!")

# ===== TAB 3: Delete patient =====
with tab3:
    df = pd.read_excel(records_file)
    patient_list = df["ID"].astype(str) + "-" + df["Name"]
    selected_del = st.selectbox("Select patient to delete", patient_list, key="del_select")
    
    if st.button("Delete Patient", key="del_button"):
        idx = patient_list.tolist().index(selected_del)
        rec = df.loc[idx]
        folder = os.path.join(base_path, f"{rec['ID']}-{rec['Name']}")
        try:
            # Xóa thư mục bệnh nhân
            shutil.rmtree(folder)
            # Xóa dòng trong Excel
            df = df.drop(idx).reset_index(drop=True)
            df.to_excel(records_file, index=False)
            st.success("Patient deleted successfully!")
        except Exception as e:
            st.error(f"Error deleting patient: {e}")



# ===== Hiển thị lịch sử chẩn đoán (dùng nguyên code của bạn) =====
st.header("Patient's history")
data0 = pd.read_excel(records_file)
patient_list = data0["ID"].astype(str) + "-" + data0["Name"]
selected_patient = st.selectbox("Choose patient", patient_list, key="history_select")
patient_folder = selected_patient
patient_path = os.path.join(base_path, patient_folder)

if os.path.exists(patient_path):
    session_dirs = [
        d for d in os.listdir(patient_path)
        if os.path.isdir(os.path.join(patient_path, d))
    ]
    if session_dirs:
        selected_session = st.selectbox("Choose session", session_dirs, key="session_select")
        session_path = os.path.join(patient_path, selected_session)
        image_file = os.path.join(session_path, "scanpath.png")
        csv_files = glob.glob(os.path.join(session_path, "*.csv"))
        if csv_files:
            csv_name = os.path.basename(csv_files[0])            # "ASD.csv"
            caption = os.path.splitext(csv_name)[0]              # "ASD"
        st.image(
            os.path.join(session_path, "scanpath.png"),
            caption="Diagnosed as "+caption
        )
    else:
        st.warning("No sessions found for this patient.")
else:
    st.warning("No folder found for this patient.")
