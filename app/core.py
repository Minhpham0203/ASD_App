import cv2
import dlib

import time
import csv
import threading
import numpy as np

import matplotlib.pyplot as plt
import math

from tensorflow.keras.models import load_model
# from core import diagnose_image

# ==================== SETUP ====================
image_folder = "app/images"
num_images = 10
display_time = 3
# Ảnh xám hiển thị giữa
gray_img = np.full((480, 640, 3), 128, dtype=np.uint8)

# Dlib và webcam
face_detector = dlib.get_frontal_face_detector()
landmark_predictor = dlib.shape_predictor("app/core/shape_predictor_68_face_landmarks.dat")

# Tải model chẩn đoán ASD
MODEL_PATH = "app/core/best.h5"
model = load_model(MODEL_PATH)

# Dữ liệu ánh mắt sẽ được lưu vào list
eye_data = []
stop_event = threading.Event()

# ==================== GAZE THREAD ====================
def capture_eye_tracking():
    cap = cv2.VideoCapture(1)
    while not stop_event.is_set():
        ret, frame = cap.read()
        if not ret:
            continue
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = face_detector(gray)
        for face in faces:
            landmarks = landmark_predictor(gray, face)
            left_x = (landmarks.part(36).x + landmarks.part(39).x) // 2
            left_y = (landmarks.part(36).y + landmarks.part(39).y) // 2
            right_x = (landmarks.part(42).x + landmarks.part(45).x) // 2
            right_y = (landmarks.part(42).y + landmarks.part(45).y) // 2
            timestamp = time.time()
            eye_data.append([timestamp, right_x, right_y, left_x, left_y])
    cap.release()

# ==================== ANALYSIS HELPERS ====================
def euclidean_distance(p1, p2):
    return math.hypot(p2["x"] - p1["x"], p2["y"] - p1["y"])

def normalize(value, min_val, max_val):
    return np.clip((value - min_val) / (max_val - min_val), 0, 1)

def read_csv_data(csv_path):
    data = []
    with open(csv_path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                x = float(row["Point of Regard Right X [px]"])
                y = float(row["Point of Regard Right Y [px]"])
                if x == 0 and y == 0:
                    continue
                data.append({"timestamp": float(row["RecordingTime [ms]"]), "x": x, "y": y})
            except:
                continue
    return data

def exponential_moving_average(data, alpha=1):
    smoothed = [data[0]]
    for i in range(1, len(data)):
        prev = smoothed[-1]
        curr = data[i]
        smoothed.append({
            "timestamp": curr["timestamp"],
            "x": alpha * curr["x"] + (1 - alpha) * prev["x"],
            "y": alpha * curr["y"] + (1 - alpha) * prev["y"]
        })
    return smoothed

def calculate_velocity_acceleration_jerk(data):
    velocities, accelerations, jerks = [], [], []
    for i in range(len(data) - 1):
        dt = max(data[i+1]["timestamp"] - data[i]["timestamp"], 1e-6)
        d = euclidean_distance(data[i], data[i+1])
        velocities.append(d / dt)
    for i in range(1, len(velocities)):
        dt = max(data[i+1]["timestamp"] - data[i]["timestamp"], 1e-6)
        accelerations.append((velocities[i] - velocities[i-1]) / dt)
    for i in range(1, len(accelerations)):
        dt = max(data[i+2]["timestamp"] - data[i+1]["timestamp"], 1e-6)
        jerks.append((accelerations[i] - accelerations[i-1]) / dt)
    return velocities, accelerations, jerks

def render_scanpath(data, velocities, accelerations, jerks, alpha_line, skip_n, output_file):
    fig, ax = plt.subplots(figsize=(19.2, 10.8), dpi=100)
    ax.set_facecolor("black")
    plt.xlim(0, 1920)
    plt.ylim(0, 1080)
    plt.gca().invert_yaxis()

    v_min, v_max = min(velocities), max(velocities)
    a_min, a_max = min(accelerations), max(accelerations)
    j_min, j_max = min(jerks), max(jerks)

    for i in range(0, len(data) - 1, skip_n):
        p1, p2 = data[i], data[i+1]
        v = velocities[i]
        a = accelerations[i-1] if i-1 >= 0 else 0
        j = jerks[i-2] if i-2 >= 0 else 0
        if v < 1.47 and abs(a) < 62:
            color = (0, 1, 1)
        else:
            color = (normalize(v, v_min, v_max), normalize(a, a_min, a_max), normalize(j, j_min, j_max))
        plt.plot([p1["x"], p2["x"]], [p1["y"], p2["y"]], color=color, linewidth=1, alpha=alpha_line)

    plt.title("Scanpath Visualization"  , color="black")
    plt.savefig(output_file, dpi=300, bbox_inches='tight', transparent=False)
    plt.close()

# ==================== DIAGNOSE HELPER ====================
def diagnose_image(image_path: str,
                   threshold: float = 0.5,
                   resize_shape: tuple = (256,256)
                  ) -> tuple[np.ndarray, str]:
    """
    Dự đoán ASD/non-ASD và vẽ nhãn lên ảnh.
    Trả về ảnh BGR có annotate và nhãn.
    """
    img = cv2.imread(image_path)
    if img is None:
        raise FileNotFoundError(f"Không tìm thấy ảnh: {image_path}")
    img_resized = cv2.resize(img, resize_shape)
    inp = np.expand_dims(img_resized / 255.0, axis=0)
    yhat = model.predict(inp)
    prob = float(yhat[0][0])
    label = "non‑ASD" if prob > threshold else "ASD"
    return label
