import torch
import torchvision.transforms as transforms
import torchvision.models as models
import torch.nn as nn
from ultralytics import YOLO
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Combines a ResNet classifier with a YOLO object detector to analyze X-ray images.
# Classifies as Fractured/Non Fractured and, when confident and fractured,
# provides detection boxes for likely fracture regions.
class HybridFractureDetector:
    
    # Load classifier/detector weights and set up preprocessing.
    # resnet_path: path to .pth classifier weights
    # yolo_path: path to .pt detector weights
    def __init__(self, resnet_path: str, yolo_path: str):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.detector = None
        self.classifier = None

        #Load ResNet Classifier
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

        #Load YOLO Detector
        self.detector = YOLO(yolo_path)
        logging.info(f"Loaded YOLO model from {yolo_path}")

        #Preprocessing Transform
        self.transform = transforms.Compose([
            transforms.Grayscale(num_output_channels=1),
            transforms.Resize(256),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485], std=[0.229])
        ])

    # Run classification on a PIL image and optionally detect fracture boxes.
    # image: PIL.Image
    # returns: dict with keys: class, confidence (0..1), detections (list), recommendation (str)
    def process_image(self, image):
        results = {}
        image = image.convert('RGB')

        #Classification
        img_tensor = self.transform(image).unsqueeze(0).to(self.device)
        with torch.no_grad():
            outputs = self.classifier(img_tensor)
            probs = torch.softmax(outputs, dim=1)
            pred_class_idx = torch.argmax(probs).item()
            confidence = probs[0][1].item()

        classification_result = 'Fractured' if pred_class_idx == 1 else 'Non Fractured'
        results['class'] = classification_result
        results['confidence'] = confidence

        #YOLO Detection (bounding boxes only)
        detections = []
        if classification_result == 'Fractured' and confidence >= 0.5:
            yolo_results = self.detector(image, conf=0.30) # 0.30 is default but can be adjusted to be more or less sensitive

            if len(yolo_results[0].boxes) > 0:
                boxes = yolo_results[0].boxes.xyxy.cpu().numpy()
                confidences = yolo_results[0].boxes.conf.cpu().numpy()
                
                for i, (box, conf) in enumerate(zip(boxes, confidences)):
                    x1, y1, x2, y2 = map(float, box.tolist())
                    detections.append({
                        "id": i + 1,
                        "label": f"Fracture Area {i + 1}",
                        "box": [x1, y1, x2, y2],
                        "confidence": float(conf)  # Add confidence score for each detection
                    })
        
        results["detections"] = detections

        #Recommendation
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

# File overview
# - Defines HybridFractureDetector that loads:
#   - A ResNet classifier (.pth) for fracture vs non-fracture classification
#   - A YOLO detector (.pt) to localize fracture regions when classification is positive
# - Exposes process_image(image) to return class, confidence, detections, and recommendation.
# - Logging informs when each model is loaded.
