import time
import logging
import os
from datetime import datetime
from typing import Dict, Optional, List
import cv2
import numpy as np
from dotenv import load_dotenv

try:
    from picamera import PiCamera
    from picamera.array import PiRGBArray
    PICAMERA_AVAILABLE = True
except ImportError:
    PICAMERA_AVAILABLE = False
    print("PiCamera library not available - using mock data")

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class CameraManager:
    def __init__(self):
        self.node_id = os.getenv('NODE_ID', 'node_001')
        self.park_id = os.getenv('PARK_ID', 'park_001')
        self.image_dir = os.getenv('IMAGE_DIR', './images')
        
        if not os.path.exists(self.image_dir):
            os.makedirs(self.image_dir)
        
        if PICAMERA_AVAILABLE:
            try:
                self.camera = PiCamera()
                self.camera.resolution = (1296, 972)
                self.camera.framerate = 30
                logger.info("PiCamera initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize PiCamera: {e}")
                self.camera = None
        else:
            self.camera = None
            logger.info("Using mock camera data")

    def capture_image(self, image_type: str = "vegetation") -> Optional[str]:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{self.node_id}_{image_type}_{timestamp}.jpg"
        filepath = os.path.join(self.image_dir, filename)
        
        if self.camera and PICAMERA_AVAILABLE:
            try:
                self.camera.capture(filepath, use_video_port=True)
                logger.info(f"Image captured: {filename}")
                return filepath
            except Exception as e:
                logger.error(f"Failed to capture image: {e}")
                return None
        else:
            return self._create_mock_image(filepath, image_type)

    def _create_mock_image(self, filepath: str, image_type: str) -> str:
        height, width = 720, 960
        
        if image_type == "vegetation":
            image = self._create_vegetation_mock_image(height, width)
        elif image_type == "infrastructure":
            image = self._create_infrastructure_mock_image(height, width)
        elif image_type == "water_body":
            image = self._create_water_body_mock_image(height, width)
        else:
            image = np.zeros((height, width, 3), dtype=np.uint8)
        
        cv2.imwrite(filepath, image)
        logger.info(f"Mock image created: {filepath}")
        return filepath

    def _create_vegetation_mock_image(self, height: int, width: int) -> np.ndarray:
        image = np.zeros((height, width, 3), dtype=np.uint8)
        
        image[:, :, 1] = np.random.randint(100, 200, (height, width))
        image[:, :, 0] = np.random.randint(50, 150, (height, width))
        
        for _ in range(np.random.randint(3, 8)):
            center_x = np.random.randint(0, width)
            center_y = np.random.randint(0, height)
            radius = np.random.randint(30, 100)
            color = (
                np.random.randint(20, 80),
                np.random.randint(80, 180),
                np.random.randint(20, 80)
            )
            cv2.circle(image, (center_x, center_y), radius, color, -1)
        
        return image

    def _create_infrastructure_mock_image(self, height: int, width: int) -> np.ndarray:
        image = np.ones((height, width, 3), dtype=np.uint8) * 200
        
        for _ in range(np.random.randint(2, 5)):
            start_x = np.random.randint(0, width)
            start_y = np.random.randint(0, height)
            end_x = np.random.randint(0, width)
            end_y = np.random.randint(0, height)
            cv2.line(image, (start_x, start_y), (end_x, end_y), (100, 100, 100), 3)
        
        for _ in range(np.random.randint(1, 3)):
            x = np.random.randint(50, width - 50)
            y = np.random.randint(50, height - 50)
            w = np.random.randint(50, 150)
            h = np.random.randint(50, 150)
            cv2.rectangle(image, (x, y), (x + w, y + h), (150, 150, 150), 2)
        
        return image

    def _create_water_body_mock_image(self, height: int, width: int) -> np.ndarray:
        image = np.zeros((height, width, 3), dtype=np.uint8)
        
        image[:, :, 2] = 150
        image[:, :, 1] = 100
        image[:, :, 0] = 50
        
        noise = np.random.randint(-30, 30, (height, width, 3))
        image = np.clip(image + noise, 0, 255).astype(np.uint8)
        
        return image

    def analyze_vegetation_health(self, image_path: str) -> Dict[str, float]:
        try:
            image = cv2.imread(image_path)
            if image is None:
                return self._get_mock_vegetation_analysis()
            
            hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
            
            lower_green = np.array([35, 40, 40])
            upper_green = np.array([85, 255, 255])
            green_mask = cv2.inRange(hsv, lower_green, upper_green)
            
            green_percentage = np.sum(green_mask > 0) / (image.shape[0] * image.shape[1]) * 100
            
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            edges = cv2.Canny(gray, 50, 150)
            edge_density = np.sum(edges > 0) / (image.shape[0] * image.shape[1]) * 100
            
            vegetation_health = min(100, (green_percentage * 0.7 + edge_density * 0.3))
            
            return {
                'vegetation_health': vegetation_health / 100,
                'green_coverage': green_percentage / 100,
                'edge_density': edge_density / 100
            }
        
        except Exception as e:
            logger.error(f"Error analyzing vegetation: {e}")
            return self._get_mock_vegetation_analysis()

    def _get_mock_vegetation_analysis(self) -> Dict[str, float]:
        import random
        return {
            'vegetation_health': random.uniform(0.4, 0.9),
            'green_coverage': random.uniform(0.3, 0.8),
            'edge_density': random.uniform(0.1, 0.4)
        }

    def analyze_infrastructure(self, image_path: str) -> Dict[str, float]:
        try:
            image = cv2.imread(image_path)
            if image is None:
                return self._get_mock_infrastructure_analysis()
            
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            edges = cv2.Canny(gray, 50, 150)
            edge_density = np.sum(edges > 0) / (image.shape[0] * image.shape[1]) * 100
            
            _, thresh = cv2.threshold(gray, 127, 255, cv2.THRESH_BINARY)
            contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            infrastructure_score = min(100, (edge_density * 0.6 + len(contours) * 0.4))
            
            return {
                'infrastructure_health': infrastructure_score / 100,
                'edge_density': edge_density / 100,
                'structure_count': len(contours)
            }
        
        except Exception as e:
            logger.error(f"Error analyzing infrastructure: {e}")
            return self._get_mock_infrastructure_analysis()

    def _get_mock_infrastructure_analysis(self) -> Dict[str, float]:
        import random
        return {
            'infrastructure_health': random.uniform(0.5, 0.9),
            'edge_density': random.uniform(0.2, 0.6),
            'structure_count': random.randint(5, 20)
        }

    def analyze_biodiversity(self, image_path: str) -> Dict[str, float]:
        try:
            image = cv2.imread(image_path)
            if image is None:
                return self._get_mock_biodiversity_analysis()
            
            hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
            
            color_ranges = [
                ([35, 40, 40], [85, 255, 255]),  # Green
                ([0, 40, 40], [10, 255, 255]),   # Red/Brown
                ([20, 40, 40], [30, 255, 255]),  # Yellow
            ]
            
            color_distributions = []
            for lower, upper in color_ranges:
                mask = cv2.inRange(hsv, np.array(lower), np.array(upper))
                percentage = np.sum(mask > 0) / (image.shape[0] * image.shape[1]) * 100
                color_distributions.append(percentage)
            
            diversity_index = 1 - sum((p/100) ** 2 for p in color_distributions if p > 0)
            
            return {
                'biodiversity_index': diversity_index,
                'color_diversity': len([p for p in color_distributions if p > 5]) / len(color_distributions)
            }
        
        except Exception as e:
            logger.error(f"Error analyzing biodiversity: {e}")
            return self._get_mock_biodiversity_analysis()

    def _get_mock_biodiversity_analysis(self) -> Dict[str, float]:
        import random
        return {
            'biodiversity_index': random.uniform(0.3, 0.8),
            'color_diversity': random.uniform(0.4, 0.9)
        }

    def cleanup(self):
        if self.camera and PICAMERA_AVAILABLE:
            self.camera.close()
        logger.info("Camera cleanup completed")

if __name__ == "__main__":
    camera_manager = CameraManager()
    
    try:
        image_path = camera_manager.capture_image("vegetation")
        if image_path:
            analysis = camera_manager.analyze_vegetation_health(image_path)
            print("Vegetation Analysis:")
            for key, value in analysis.items():
                print(f"  {key}: {value:.3f}")
    finally:
        camera_manager.cleanup()
