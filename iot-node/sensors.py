import time
import logging
from typing import Dict, Optional
from datetime import datetime
import os
from dotenv import load_dotenv

try:
    import board
    import adafruit_dht
    DHT_AVAILABLE = True
except ImportError:
    DHT_AVAILABLE = False
    print("DHT sensor library not available - using mock data")

try:
    import RPi.GPIO as GPIO
    GPIO_AVAILABLE = True
except ImportError:
    GPIO_AVAILABLE = False
    print("GPIO library not available - using mock data")

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SensorManager:
    def __init__(self):
        self.node_id = os.getenv('NODE_ID', 'node_001')
        self.park_id = os.getenv('PARK_ID', 'park_001')
        self.location = {
            'lat': float(os.getenv('LOCATION_LAT', '28.1234')),
            'lon': float(os.getenv('LOCATION_LON', '77.4567'))
        }
        
        self.dht_pin = 4
        self.soil_moisture_pin = 0
        self.light_sensor_pin = 1
        
        if DHT_AVAILABLE and GPIO_AVAILABLE:
            try:
                self.dht = adafruit_dht.DHT22(board.D4)
                logger.info("DHT22 sensor initialized")
            except Exception as e:
                logger.error(f"Failed to initialize DHT22: {e}")
                self.dht = None
        else:
            self.dht = None
            
        if GPIO_AVAILABLE:
            GPIO.setmode(GPIO.BCM)
            GPIO.setup(self.soil_moisture_pin, GPIO.IN)
            GPIO.setup(self.light_sensor_pin, GPIO.IN)
            logger.info("GPIO pins configured")
        else:
            logger.info("Using mock sensor data")

    def read_temperature_humidity(self) -> Dict[str, Optional[float]]:
        if self.dht and DHT_AVAILABLE:
            try:
                temperature = self.dht.temperature
                humidity = self.dht.humidity
                
                if temperature is not None and humidity is not None:
                    logger.info(f"Temperature: {temperature}°C, Humidity: {humidity}%")
                    return {
                        'temperature': temperature,
                        'humidity': humidity
                    }
            except Exception as e:
                logger.error(f"Error reading DHT22: {e}")
        
        return self._get_mock_temperature_humidity()

    def read_soil_moisture(self) -> float:
        if GPIO_AVAILABLE:
            try:
                reading = 0
                for _ in range(10):
                    reading += GPIO.input(self.soil_moisture_pin)
                    time.sleep(0.01)
                
                moisture_percentage = (reading / 10) * 100
                logger.info(f"Soil moisture: {moisture_percentage:.1f}%")
                return moisture_percentage
            except Exception as e:
                logger.error(f"Error reading soil moisture: {e}")
        
        return self._get_mock_soil_moisture()

    def read_light_intensity(self) -> float:
        if GPIO_AVAILABLE:
            try:
                reading = 0
                for _ in range(10):
                    reading += GPIO.input(self.light_sensor_pin)
                    time.sleep(0.01)
                
                light_percentage = (reading / 10) * 100
                light_lux = light_percentage * 1000
                logger.info(f"Light intensity: {light_lux:.0f} lux")
                return light_lux
            except Exception as e:
                logger.error(f"Error reading light intensity: {e}")
        
        return self._get_mock_light_intensity()

    def _get_mock_temperature_humidity(self) -> Dict[str, Optional[float]]:
        import random
        base_temp = 25.0
        base_humidity = 60.0
        
        temperature = base_temp + random.uniform(-5, 5)
        humidity = base_humidity + random.uniform(-15, 15)
        
        return {
            'temperature': temperature,
            'humidity': humidity
        }

    def _get_mock_soil_moisture(self) -> float:
        import random
        return random.uniform(20, 80)

    def _get_mock_light_intensity(self) -> float:
        import random
        current_hour = datetime.now().hour
        
        if 6 <= current_hour <= 18:
            base_light = 30000
            variation = 20000
        else:
            base_light = 1000
            variation = 500
        
        return base_light + random.uniform(-variation, variation)

    def get_all_readings(self) -> Dict[str, Dict[str, any]]:
        temp_humidity = self.read_temperature_humidity()
        soil_moisture = self.read_soil_moisture()
        light_intensity = self.read_light_intensity()
        
        readings = {
            'temperature': {
                'sensor_type': 'temperature',
                'value': temp_humidity['temperature'],
                'unit': '°C',
                'timestamp': datetime.utcnow().isoformat()
            },
            'humidity': {
                'sensor_type': 'humidity',
                'value': temp_humidity['humidity'],
                'unit': '%',
                'timestamp': datetime.utcnow().isoformat()
            },
            'soil_moisture': {
                'sensor_type': 'soil_moisture',
                'value': soil_moisture,
                'unit': '%',
                'timestamp': datetime.utcnow().isoformat()
            },
            'light_intensity': {
                'sensor_type': 'light_intensity',
                'value': light_intensity,
                'unit': 'lux',
                'timestamp': datetime.utcnow().isoformat()
            }
        }
        
        return readings

    def cleanup(self):
        if GPIO_AVAILABLE:
            GPIO.cleanup()
        logger.info("Sensor cleanup completed")

if __name__ == "__main__":
    sensor_manager = SensorManager()
    
    try:
        readings = sensor_manager.get_all_readings()
        print("Sensor Readings:")
        for sensor_type, reading in readings.items():
            print(f"  {sensor_type}: {reading['value']} {reading['unit']}")
    finally:
        sensor_manager.cleanup()
