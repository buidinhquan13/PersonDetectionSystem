from ultralytics import YOLO

def download_model():
    model = YOLO("yolov8n.pt")
    print("Downloaded YOLO model successfully.")

if __name__ == "__main__":
    download_model()