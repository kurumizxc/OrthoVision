import torch
import torchvision.transforms as transforms
import torchvision.models as models
import torch.nn as nn
from ultralytics import YOLO
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

class HybridFractureDetector:
    def __init__(self, resnet_path: str, yolo_path: str):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.detector = None
        self.classifier = None

        # --- Load ResNet Classifier ---
        self.classifier = models.resnet18(weights=None)
        self.classifier.conv1 = nn.Conv2d(1, 64, kernel_size=7, stride=2, padding=3, bias=False)
        num_features = self.classifier.fc.in_features
        self.classifier.fc = nn.Sequential(
            nn.Dropout(0.5),
            nn.Linear(num_features, 2),
            nn.LogSoftmax(dim=1)
        )

        checkpoint = torch.load(resnet_path, map_location=self.device)
        self.classifier.load_state_dict(checkpoint['model_state_dict'])
        self.classifier.to(self.device).eval()
        logging.info(f"Loaded ResNet model from {resnet_path}")

        # --- Load YOLO Detector ---
        self.detector = YOLO(yolo_path)
        logging.info(f"Loaded YOLO model from {yolo_path}")

        # --- Preprocessing Transform ---
        self.transform = transforms.Compose([
            transforms.Grayscale(num_output_channels=1),
            transforms.Resize(256),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485], std=[0.229])
        ])

    def process_image(self, image):
        """Takes a PIL image, returns classification + bounding boxes (no image data)."""
        results = {}
        image = image.convert('RGB')

        # --- Classification ---
        img_tensor = self.transform(image).unsqueeze(0).to(self.device)
        with torch.no_grad():
            outputs = self.classifier(img_tensor)
            probs = torch.softmax(outputs, dim=1)
            pred_class_idx = torch.argmax(probs).item()
            confidence = probs[0][1].item()

        classification_result = 'Fractured' if pred_class_idx == 1 else 'Non Fractured'
        results['class'] = classification_result
        results['confidence'] = confidence

        # --- YOLO Detection (bounding boxes only) ---
        detections = []
        if classification_result == 'Fractured' and confidence >= 0.5:
            yolo_results = self.detector(image, conf=0.25)

            if len(yolo_results[0].boxes) > 0:
                for i, box in enumerate(yolo_results[0].boxes.xyxy):
                    x1, y1, x2, y2 = map(float, box.tolist())
                    detections.append({
                        "id": i + 1,
                        "label": f"Fracture Area {i + 1}",
                        "box": [x1, y1, x2, y2]
                    })

        results["detections"] = detections

        # --- Recommendation ---
        if classification_result == "Fractured":
            results["recommendation"] = (
                "Fracture identified on the imaging results. "
                "Please monitor the condition closely and refer to orthopedics for further evaluation and management."
            )
        else:
            results["recommendation"] = (
                "No signs of fracture on the imaging results. "
                "Please monitor the condition and refer to orthopedics for further evaluation if needed."
            )

        return results
