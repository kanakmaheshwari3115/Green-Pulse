import numpy as np
from typing import Dict, List, Tuple
from datetime import datetime, timedelta
from models import SensorData, HealthScore, SensorType

class EcologicalScorer:
    def __init__(self):
        self.optimal_ranges = {
            SensorType.TEMPERATURE: {"min": 20, "max": 30, "unit": "°C"},
            SensorType.HUMIDITY: {"min": 40, "max": 70, "unit": "%"},
            SensorType.SOIL_MOISTURE: {"min": 30, "max": 60, "unit": "%"},
            SensorType.LIGHT_INTENSITY: {"min": 20000, "max": 50000, "unit": "lux"},
            SensorType.PH: {"min": 6.0, "max": 7.5, "unit": "pH"},
        }
        
        self.score_weights = {
            "tree_health": 0.30,
            "microclimate": 0.25,
            "soil_water": 0.20,
            "biodiversity": 0.15,
            "infrastructure": 0.10
        }

    def calculate_sensor_score(self, sensor_type: SensorType, value: float) -> float:
        if sensor_type not in self.optimal_ranges:
            return 5.0
        
        optimal = self.optimal_ranges[sensor_type]
        min_opt, max_opt = optimal["min"], optimal["max"]
        
        if min_opt <= value <= max_opt:
            return 10.0
        elif value < min_opt:
            distance = min_opt - value
            return max(0, 10.0 - (distance / min_opt) * 10)
        else:
            distance = value - max_opt
            return max(0, 10.0 - (distance / max_opt) * 10)

    def calculate_tree_health_score(self, sensor_data: List[SensorData], image_analysis: Dict = None) -> float:
        scores = []
        
        for data in sensor_data:
            for reading in data.readings:
                if reading.sensor_type in [SensorType.TEMPERATURE, SensorType.HUMIDITY, SensorType.SOIL_MOISTURE]:
                    score = self.calculate_sensor_score(reading.sensor_type, reading.value)
                    scores.append(score)
        
        if image_analysis:
            vegetation_health = image_analysis.get("vegetation_health", 0.5)
            scores.append(vegetation_health * 10)
        
        return np.mean(scores) if scores else 5.0

    def calculate_microclimate_score(self, sensor_data: List[SensorData]) -> float:
        temp_scores = []
        humidity_scores = []
        
        for data in sensor_data:
            for reading in data.readings:
                if reading.sensor_type == SensorType.TEMPERATURE:
                    temp_scores.append(self.calculate_sensor_score(reading.sensor_type, reading.value))
                elif reading.sensor_type == SensorType.HUMIDITY:
                    humidity_scores.append(self.calculate_sensor_score(reading.sensor_type, reading.value))
        
        temp_score = np.mean(temp_scores) if temp_scores else 5.0
        humidity_score = np.mean(humidity_scores) if humidity_scores else 5.0
        
        return (temp_score + humidity_score) / 2

    def calculate_soil_water_score(self, sensor_data: List[SensorData]) -> float:
        soil_scores = []
        ph_scores = []
        turbidity_scores = []
        
        for data in sensor_data:
            for reading in data.readings:
                if reading.sensor_type == SensorType.SOIL_MOISTURE:
                    soil_scores.append(self.calculate_sensor_score(reading.sensor_type, reading.value))
                elif reading.sensor_type == SensorType.PH:
                    ph_scores.append(self.calculate_sensor_score(reading.sensor_type, reading.value))
                elif reading.sensor_type == SensorType.TURBIDITY:
                    turbidity_scores.append(self.calculate_sensor_score(reading.sensor_type, reading.value))
        
        soil_score = np.mean(soil_scores) if soil_scores else 5.0
        water_score = np.mean(ph_scores + turbidity_scores) if (ph_scores + turbidity_scores) else 5.0
        
        return (soil_score + water_score) / 2

    def calculate_biodiversity_score(self, image_analysis: Dict = None, tree_count: int = None) -> float:
        base_score = 5.0
        
        if image_analysis:
            biodiversity_index = image_analysis.get("biodiversity_index", 0.5)
            base_score = biodiversity_index * 10
        
        if tree_count:
            if tree_count > 100:
                tree_score = 10.0
            elif tree_count > 50:
                tree_score = 7.5
            elif tree_count > 20:
                tree_score = 5.0
            else:
                tree_score = 2.5
            base_score = (base_score + tree_score) / 2
        
        return base_score

    def calculate_infrastructure_score(self, image_analysis: Dict = None) -> float:
        if not image_analysis:
            return 7.0
        
        infrastructure_health = image_analysis.get("infrastructure_health", 0.7)
        maintenance_score = image_analysis.get("maintenance_score", 0.7)
        
        return ((infrastructure_health + maintenance_score) / 2) * 10

    def calculate_overall_score(self, sensor_data: List[SensorData], image_analysis: Dict = None, 
                              tree_count: int = None) -> HealthScore:
        park_id = sensor_data[0].park_id if sensor_data else "unknown"
        
        tree_health = self.calculate_tree_health_score(sensor_data, image_analysis)
        microclimate = self.calculate_microclimate_score(sensor_data)
        soil_water = self.calculate_soil_water_score(sensor_data)
        biodiversity = self.calculate_biodiversity_score(image_analysis, tree_count)
        infrastructure = self.calculate_infrastructure_score(image_analysis)
        
        weights = self.score_weights
        overall_score = (
            tree_health * weights["tree_health"] +
            microclimate * weights["microclimate"] +
            soil_water * weights["soil_water"] +
            biodiversity * weights["biodiversity"] +
            infrastructure * weights["infrastructure"]
        )
        
        factors = {
            "tree_health_score": tree_health,
            "microclimate_score": microclimate,
            "soil_water_score": soil_water,
            "biodiversity_score": biodiversity,
            "infrastructure_score": infrastructure,
            "weights": weights
        }
        
        return HealthScore(
            park_id=park_id,
            overall_score=round(overall_score, 2),
            tree_health_score=round(tree_health, 2),
            microclimate_score=round(microclimate, 2),
            soil_water_score=round(soil_water, 2),
            biodiversity_score=round(biodiversity, 2),
            infrastructure_score=round(infrastructure, 2),
            factors=factors
        )

    def generate_recommendations(self, health_score: HealthScore) -> List[str]:
        recommendations = []
        
        if health_score.tree_health_score < 5:
            recommendations.append("Tree health is poor - check irrigation and consider fertilization")
        
        if health_score.microclimate_score < 5:
            recommendations.append("Microclimate conditions are suboptimal - consider adding more canopy cover")
        
        if health_score.soil_water_score < 5:
            recommendations.append("Soil and water conditions need attention - check drainage and irrigation")
        
        if health_score.biodiversity_score < 5:
            recommendations.append("Biodiversity is low - consider planting native species")
        
        if health_score.infrastructure_score < 5:
            recommendations.append("Infrastructure maintenance required - check pathways and amenities")
        
        if health_score.overall_score >= 8:
            recommendations.append("Park is in excellent condition - maintain current practices")
        
        return recommendations
