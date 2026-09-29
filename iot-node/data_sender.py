import requests
import json
import logging
import time
import os
from datetime import datetime
from typing import Dict, List, Optional
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DataSender:
    def __init__(self):
        self.api_base_url = os.getenv('API_BASE_URL', 'http://localhost:8000')
        self.node_id = os.getenv('NODE_ID', 'node_001')
        self.park_id = os.getenv('PARK_ID', 'park_001')
        self.location = {
            'lat': float(os.getenv('LOCATION_LAT', '28.1234')),
            'lon': float(os.getenv('LOCATION_LON', '77.4567'))
        }
        
        self.session = requests.Session()
        self.session.timeout = 30

    def send_sensor_data(self, readings: Dict[str, Dict]) -> bool:
        try:
            sensor_data = {
                'node_id': self.node_id,
                'park_id': self.park_id,
                'location': self.location,
                'readings': list(readings.values()),
                'timestamp': datetime.utcnow().isoformat()
            }
            
            url = f"{self.api_base_url}/api/sensor-data"
            response = self.session.post(url, json=sensor_data)
            
            if response.status_code == 200:
                logger.info(f"Sensor data sent successfully: {len(readings)} readings")
                return True
            else:
                logger.error(f"Failed to send sensor data: {response.status_code} - {response.text}")
                return False
                
        except requests.exceptions.RequestException as e:
            logger.error(f"Network error sending sensor data: {e}")
            return False
        except Exception as e:
            logger.error(f"Error sending sensor data: {e}")
            return False

    def send_image_data(self, image_path: str, image_type: str, analysis_results: Dict) -> bool:
        try:
            image_data = {
                'node_id': self.node_id,
                'park_id': self.park_id,
                'image_path': image_path,
                'image_type': image_type,
                'analysis_results': analysis_results,
                'timestamp': datetime.utcnow().isoformat()
            }
            
            url = f"{self.api_base_url}/api/image-data"
            response = self.session.post(url, json=image_data)
            
            if response.status_code == 200:
                logger.info(f"Image data sent successfully: {image_type}")
                return True
            else:
                logger.error(f"Failed to send image data: {response.status_code} - {response.text}")
                return False
                
        except requests.exceptions.RequestException as e:
            logger.error(f"Network error sending image data: {e}")
            return False
        except Exception as e:
            logger.error(f"Error sending image data: {e}")
            return False

    def test_connection(self) -> bool:
        try:
            url = f"{self.api_base_url}/health"
            response = self.session.get(url)
            
            if response.status_code == 200:
                logger.info("API connection test successful")
                return True
            else:
                logger.error(f"API connection test failed: {response.status_code}")
                return False
                
        except requests.exceptions.RequestException as e:
            logger.error(f"API connection test failed: {e}")
            return False

    def get_park_info(self) -> Optional[Dict]:
        try:
            url = f"{self.api_base_url}/api/parks/{self.park_id}"
            response = self.session.get(url)
            
            if response.status_code == 200:
                park_info = response.json()
                logger.info(f"Park info retrieved: {park_info.get('name')}")
                return park_info
            else:
                logger.error(f"Failed to get park info: {response.status_code}")
                return None
                
        except requests.exceptions.RequestException as e:
            logger.error(f"Network error getting park info: {e}")
            return None
        except Exception as e:
            logger.error(f"Error getting park info: {e}")
            return None

    def send_heartbeat(self) -> bool:
        try:
            heartbeat_data = {
                'node_id': self.node_id,
                'park_id': self.park_id,
                'status': 'active',
                'timestamp': datetime.utcnow().isoformat()
            }
            
            url = f"{self.api_base_url}/api/heartbeat"
            response = self.session.post(url, json=heartbeat_data)
            
            if response.status_code == 200:
                logger.debug("Heartbeat sent successfully")
                return True
            else:
                logger.warning(f"Heartbeat failed: {response.status_code}")
                return False
                
        except Exception as e:
            logger.error(f"Error sending heartbeat: {e}")
            return False

    def retry_failed_data(self, failed_data: List[Dict], max_retries: int = 3) -> int:
        successful_retries = 0
        
        for data in failed_data:
            retry_count = 0
            
            while retry_count < max_retries:
                if data['type'] == 'sensor':
                    success = self.send_sensor_data(data['readings'])
                elif data['type'] == 'image':
                    success = self.send_image_data(
                        data['image_path'], 
                        data['image_type'], 
                        data['analysis_results']
                    )
                else:
                    success = False
                
                if success:
                    successful_retries += 1
                    break
                
                retry_count += 1
                time.sleep(2 ** retry_count)
        
        logger.info(f"Retried {len(failed_data)} failed items, {successful_retries} successful")
        return successful_retries

class DataBuffer:
    def __init__(self, max_size: int = 100):
        self.buffer = []
        self.max_size = max_size

    def add_data(self, data_type: str, data: Dict):
        if len(self.buffer) >= self.max_size:
            self.buffer.pop(0)
        
        self.buffer.append({
            'type': data_type,
            'data': data,
            'timestamp': datetime.utcnow().isoformat()
        })

    def get_failed_data(self) -> List[Dict]:
        return [item for item in self.buffer if item.get('failed', False)]

    def mark_failed(self, index: int):
        if 0 <= index < len(self.buffer):
            self.buffer[index]['failed'] = True

    def clear_successful(self):
        self.buffer = [item for item in self.buffer if item.get('failed', False)]

if __name__ == "__main__":
    data_sender = DataSender()
    
    if data_sender.test_connection():
        print("API connection successful")
        
        park_info = data_sender.get_park_info()
        if park_info:
            print(f"Connected to park: {park_info.get('name')}")
        else:
            print("Could not retrieve park information")
    else:
        print("API connection failed")
