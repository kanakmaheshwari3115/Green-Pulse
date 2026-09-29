import asyncio
from datetime import datetime, timedelta
from typing import Dict, List, Any
from database import get_database
from scoring import EcologicalScorer

class DataAggregator:
    def __init__(self):
        self.db = get_database()
        self.scorer = EcologicalScorer()

    async def aggregate_hourly_data(self):
        """Aggregate sensor data into hourly summaries"""
        try:
            sensor_collection = self.db.sensor_data
            hourly_collection = self.db.hourly_aggregates
            
            end_time = datetime.utcnow()
            start_time = end_time - timedelta(hours=1)
            
            pipeline = [
                {"$match": {
                    "timestamp": {"$gte": start_time, "$lt": end_time}
                }},
                {"$unwind": "$readings"},
                {"$group": {
                    "_id": {
                        "park_id": "$park_id",
                        "sensor_type": "$readings.sensor_type",
                        "hour": {"$dateTrunc": {"date": "$timestamp", "unit": "hour"}}
                    },
                    "avg_value": {"$avg": "$readings.value"},
                    "min_value": {"$min": "$readings.value"},
                    "max_value": {"$max": "$readings.value"},
                    "count": {"$sum": 1},
                    "unit": {"$first": "$readings.unit"}
                }},
                {"$project": {
                    "_id": 0,
                    "park_id": "$_id.park_id",
                    "sensor_type": "$_id.sensor_type",
                    "hour": "$_id.hour",
                    "avg_value": {"$round": ["$avg_value", 2]},
                    "min_value": "$min_value",
                    "max_value": "$max_value",
                    "count": "$count",
                    "unit": "$unit"
                }}
            ]
            
            cursor = sensor_collection.aggregate(pipeline)
            hourly_data = await cursor.to_list(length=1000)
            
            if hourly_data:
                for record in hourly_data:
                    record["_id"] = f"{record['park_id']}_{record['sensor_type']}_{record['hour'].isoformat()}"
                    await hourly_collection.replace_one(
                        {"_id": record["_id"]},
                        record,
                        upsert=True
                    )
                
                print(f"[OK] Aggregated {len(hourly_data)} hourly records")
            
        except Exception as e:
            print(f"[ERROR] Error in hourly aggregation: {e}")

    async def aggregate_daily_data(self):
        """Aggregate data into daily summaries"""
        try:
            hourly_collection = self.db.hourly_aggregates
            daily_collection = self.db.daily_aggregates
            
            end_time = datetime.utcnow()
            start_time = end_time - timedelta(days=1)
            
            pipeline = [
                {"$match": {
                    "hour": {"$gte": start_time, "$lt": end_time}
                }},
                {"$group": {
                    "_id": {
                        "park_id": "$park_id",
                        "sensor_type": "$sensor_type",
                        "day": {"$dateTrunc": {"date": "$hour", "unit": "day"}}
                    },
                    "avg_value": {"$avg": "$avg_value"},
                    "min_value": {"$min": "$min_value"},
                    "max_value": {"$max": "$max_value"},
                    "total_count": {"$sum": "$count"},
                    "unit": {"$first": "$unit"}
                }},
                {"$project": {
                    "_id": 0,
                    "park_id": "$_id.park_id",
                    "sensor_type": "$_id.sensor_type",
                    "day": "$_id.day",
                    "avg_value": {"$round": ["$avg_value", 2]},
                    "min_value": "$min_value",
                    "max_value": "$max_value",
                    "total_count": "$total_count",
                    "unit": "$unit"
                }}
            ]
            
            cursor = hourly_collection.aggregate(pipeline)
            daily_data = await cursor.to_list(length=500)
            
            if daily_data:
                for record in daily_data:
                    record["_id"] = f"{record['park_id']}_{record['sensor_type']}_{record['day'].isoformat()}"
                    await daily_collection.replace_one(
                        {"_id": record["_id"]},
                        record,
                        upsert=True
                    )
                
                print(f"[OK] Aggregated {len(daily_data)} daily records")
            
        except Exception as e:
            print(f"[ERROR] Error in daily aggregation: {e}")

    async def calculate_daily_health_scores(self):
        """Calculate daily health scores for all parks"""
        try:
            parks_collection = self.db.parks
            sensor_collection = self.db.sensor_data
            image_collection = self.db.image_data
            health_collection = self.db.daily_health_scores
            
            parks = await parks_collection.find({}).to_list(length=100)
            
            for park in parks:
                park_id = park["park_id"]
                
                end_time = datetime.utcnow()
                start_time = end_time - timedelta(days=1)
                
                sensor_cursor = sensor_collection.find({
                    "park_id": park_id,
                    "timestamp": {"$gte": start_time, "$lt": end_time}
                })
                sensor_data = await sensor_cursor.to_list(length=1000)
                
                image_cursor = image_collection.find({
                    "park_id": park_id,
                    "timestamp": {"$gte": start_time, "$lt": end_time}
                })
                image_data = await image_cursor.to_list(length=50)
                
                if sensor_data:
                    from models import SensorData
                    sensor_objects = []
                    for data in sensor_data:
                        sensor_objects.append(SensorData(**data))
                    
                    image_analysis = None
                    if image_data:
                        latest_image = max(image_data, key=lambda x: x["timestamp"])
                        image_analysis = latest_image.get("analysis_results")
                    
                    health_score = self.scorer.calculate_overall_score(
                        sensor_objects, image_analysis, park.get("tree_count")
                    )
                    
                    health_dict = health_score.dict()
                    health_dict["_id"] = f"{park_id}_{end_time.date().isoformat()}"
                    health_dict["calculated_at"] = end_time.isoformat()
                    
                    await health_collection.replace_one(
                        {"_id": health_dict["_id"]},
                        health_dict,
                        upsert=True
                    )
                
            print(f"[OK] Calculated daily health scores for {len(parks)} parks")
            
        except Exception as e:
            print(f"[ERROR] Error calculating daily health scores: {e}")

    async def generate_weekly_reports(self):
        """Generate weekly performance reports"""
        try:
            daily_health_collection = self.db.daily_health_scores
            reports_collection = self.db.weekly_reports
            
            end_time = datetime.utcnow()
            start_time = end_time - timedelta(days=7)
            
            pipeline = [
                {"$match": {
                    "calculated_at": {"$gte": start_time, "$lt": end_time}
                }},
                {"$group": {
                    "_id": "$park_id",
                    "avg_overall_score": {"$avg": "$overall_score"},
                    "max_score": {"$max": "$overall_score"},
                    "min_score": {"$min": "$overall_score"},
                    "avg_tree_health": {"$avg": "$tree_health_score"},
                    "avg_microclimate": {"$avg": "$microclimate_score"},
                    "avg_soil_water": {"$avg": "$soil_water_score"},
                    "avg_biodiversity": {"$avg": "$biodiversity_score"},
                    "avg_infrastructure": {"$avg": "$infrastructure_score"},
                    "data_points": {"$sum": 1}
                }},
                {"$project": {
                    "_id": 0,
                    "park_id": "$_id",
                    "week_start": start_time,
                    "week_end": end_time,
                    "avg_overall_score": {"$round": ["$avg_overall_score", 2]},
                    "max_score": "$max_score",
                    "min_score": "$min_score",
                    "avg_tree_health": {"$round": ["$avg_tree_health", 2]},
                    "avg_microclimate": {"$round": ["$avg_microclimate", 2]},
                    "avg_soil_water": {"$round": ["$avg_soil_water", 2]},
                    "avg_biodiversity": {"$round": ["$avg_biodiversity", 2]},
                    "avg_infrastructure": {"$round": ["$avg_infrastructure", 2]},
                    "data_points": "$data_points"
                }}
            ]
            
            cursor = daily_health_collection.aggregate(pipeline)
            weekly_reports = await cursor.to_list(length=100)
            
            for report in weekly_reports:
                report["_id"] = f"{report['park_id']}_week_{start_time.date().isoformat()}"
                report["generated_at"] = end_time.isoformat()
                
                await reports_collection.replace_one(
                    {"_id": report["_id"]},
                    report,
                    upsert=True
                )
            
            print(f"[OK] Generated {len(weekly_reports)} weekly reports")
            
        except Exception as e:
            print(f"[ERROR] Error generating weekly reports: {e}")

    async def cleanup_old_data(self):
        """Clean up old raw data to manage storage"""
        try:
            cutoff_time = datetime.utcnow() - timedelta(days=30)
            
            sensor_collection = self.db.sensor_data
            image_collection = self.db.image_data
            heartbeat_collection = self.db.heartbeats
            
            sensor_result = await sensor_collection.delete_many({
                "timestamp": {"$lt": cutoff_time}
            })
            
            image_result = await image_collection.delete_many({
                "timestamp": {"$lt": cutoff_time}
            })
            
            heartbeat_result = await heartbeat_collection.delete_many({
                "timestamp": {"$lt": cutoff_time}
            })
            
            print(f"[OK] Cleaned up old data: {sensor_result.deleted_count} sensor records, "
                  f"{image_result.deleted_count} image records, {heartbeat_result.deleted_count} heartbeats")
            
        except Exception as e:
            print(f"[ERROR] Error cleaning up old data: {e}")

    async def run_aggregation_cycle(self):
        """Run the complete aggregation cycle"""
        print("[SYNC] Starting data aggregation cycle...")
        
        await self.aggregate_hourly_data()
        await self.aggregate_daily_data()
        await self.calculate_daily_health_scores()
        await self.generate_weekly_reports()
        
        print("[OK] Data aggregation cycle completed")

async def run_scheduled_aggregation():
    """Run aggregation tasks on a schedule"""
    aggregator = DataAggregator()
    
    while True:
        try:
            await aggregator.run_aggregation_cycle()
            
            await asyncio.sleep(3600)  # Run every hour
            
        except Exception as e:
            print(f"[ERROR] Error in scheduled aggregation: {e}")
            await asyncio.sleep(300)  # Wait 5 minutes before retrying

if __name__ == "__main__":
    asyncio.run(run_scheduled_aggregation())
