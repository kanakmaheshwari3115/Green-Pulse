#!/usr/bin/env python3
import time
import signal
import logging
import schedule
import threading
from datetime import datetime
import os
from dotenv import load_dotenv

from sensors import SensorManager
from camera import CameraManager
from data_sender import DataSender, DataBuffer

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class IoTNode:
    def __init__(self):
        self.running = True
        self.sensor_manager = SensorManager()
        self.camera_manager = CameraManager()
        self.data_sender = DataSender()
        self.data_buffer = DataBuffer()
        
        self.sensor_interval = int(os.getenv('SENSOR_READ_INTERVAL', '30'))
        self.image_interval = int(os.getenv('IMAGE_CAPTURE_INTERVAL', '300'))
        
        logger.info(f"IoT Node initialized - ID: {self.data_sender.node_id}")
        logger.info(f"Park ID: {self.data_sender.park_id}")
        logger.info(f"Sensor interval: {self.sensor_interval}s")
        logger.info(f"Image interval: {self.image_interval}s")

    def collect_and_send_sensor_data(self):
        try:
            logger.info("Collecting sensor data...")
            readings = self.sensor_manager.get_all_readings()
            
            success = self.data_sender.send_sensor_data(readings)
            
            if success:
                logger.info("Sensor data sent successfully")
            else:
                logger.warning("Failed to send sensor data, buffering...")
                self.data_buffer.add_data('sensor', readings)
                
        except Exception as e:
            logger.error(f"Error in sensor data collection: {e}")

    def collect_and_send_image_data(self):
        try:
            logger.info("Capturing and analyzing images...")
            
            image_types = ["vegetation", "infrastructure", "water_body"]
            
            for image_type in image_types:
                image_path = self.camera_manager.capture_image(image_type)
                
                if image_path:
                    if image_type == "vegetation":
                        analysis = self.camera_manager.analyze_vegetation_health(image_path)
                    elif image_type == "infrastructure":
                        analysis = self.camera_manager.analyze_infrastructure(image_path)
                    elif image_type == "water_body":
                        analysis = self.camera_manager.analyze_biodiversity(image_path)
                    else:
                        analysis = {}
                    
                    success = self.data_sender.send_image_data(image_path, image_type, analysis)
                    
                    if success:
                        logger.info(f"Image data sent successfully: {image_type}")
                    else:
                        logger.warning(f"Failed to send image data for {image_type}, buffering...")
                        self.data_buffer.add_data('image', {
                            'image_path': image_path,
                            'image_type': image_type,
                            'analysis_results': analysis
                        })
                else:
                    logger.error(f"Failed to capture {image_type} image")
                    
        except Exception as e:
            logger.error(f"Error in image data collection: {e}")

    def send_heartbeat(self):
        try:
            self.data_sender.send_heartbeat()
        except Exception as e:
            logger.error(f"Error sending heartbeat: {e}")

    def retry_failed_data(self):
        try:
            failed_data = self.data_buffer.get_failed_data()
            if failed_data:
                logger.info(f"Retrying {len(failed_data)} failed data items...")
                successful_retries = self.data_sender.retry_failed_data(failed_data)
                self.data_buffer.clear_successful()
                logger.info(f"Successfully retried {successful_retries} items")
        except Exception as e:
            logger.error(f"Error retrying failed data: {e}")

    def setup_schedule(self):
        schedule.every(self.sensor_interval).seconds.do(self.collect_and_send_sensor_data)
        schedule.every(self.image_interval).seconds.do(self.collect_and_send_image_data)
        schedule.every(60).seconds.do(self.send_heartbeat)
        schedule.every(300).seconds.do(self.retry_failed_data)
        
        logger.info("Schedule setup complete")

    def run_scheduler(self):
        while self.running:
            schedule.run_pending()
            time.sleep(1)

    def start(self):
        logger.info("Starting IoT Node...")
        
        if not self.data_sender.test_connection():
            logger.error("Failed to connect to API server. Exiting...")
            return
        
        park_info = self.data_sender.get_park_info()
        if park_info:
            logger.info(f"Connected to park: {park_info.get('name', 'Unknown')}")
        else:
            logger.warning("Could not retrieve park information, continuing anyway...")
        
        self.setup_schedule()
        
        logger.info("IoT Node started successfully")
        
        scheduler_thread = threading.Thread(target=self.run_scheduler, daemon=True)
        scheduler_thread.start()
        
        try:
            while self.running:
                time.sleep(10)
                
        except KeyboardInterrupt:
            logger.info("Shutdown signal received")
        finally:
            self.shutdown()

    def shutdown(self):
        logger.info("Shutting down IoT Node...")
        self.running = False
        
        try:
            self.sensor_manager.cleanup()
            self.camera_manager.cleanup()
            logger.info("Cleanup completed")
        except Exception as e:
            logger.error(f"Error during cleanup: {e}")
        
        logger.info("IoT Node shutdown complete")

def signal_handler(signum, frame):
    logger.info(f"Received signal {signum}")
    if hasattr(signal_handler, 'node'):
        signal_handler.node.shutdown()

def main():
    logger.info("GreenPulse IoT Node starting...")
    
    node = IoTNode()
    signal_handler.node = node
    
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    try:
        node.start()
    except Exception as e:
        logger.error(f"Fatal error: {e}")
        node.shutdown()

if __name__ == "__main__":
    main()
