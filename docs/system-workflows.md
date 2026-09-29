# GreenPulse System Workflows Documentation

## Overview

This document outlines all operational workflows within the GreenPulse system, covering user interactions, automated processes, and system operations. Each workflow includes detailed steps, decision points, and error handling procedures.

## Table of Contents

1. [User Workflows](#user-workflows)
2. [Automated System Workflows](#automated-system-workflows)
3. [Data Processing Workflows](#data-processing-workflows)
4. [Monitoring and Alerting Workflows](#monitoring-and-alerting-workflows)
5. [Maintenance Workflows](#maintenance-workflows)
6. [Emergency Response Workflows](#emergency-response-workflows)

## User Workflows

### 1. Park Management Workflow

#### 1.1 Create New Park
```mermaid
flowchart TD
    A[User Accesses Admin Panel] --> B[Clicks 'Add New Park']
    B --> C[Fills Park Information]
    C --> D[Validates Input]
    D --> E{Validation Success?}
    E -->|Yes| F[Submits to API]
    E -->|No| G[Shows Error Messages]
    G --> C
    F --> H[API Creates Park Record]
    H --> I[Returns Success Response]
    I --> J[Updates UI with New Park]
    J --> K[Redirects to Park Dashboard]
```

**Detailed Steps:**
1. **Navigation**: User navigates to `/admin/parks`
2. **Form Entry**: User enters park details:
   - Park ID (unique identifier)
   - Park name
   - Geographic coordinates
   - Area in square meters
   - Tree count (optional)
   - Description (optional)
3. **Validation**: Frontend validates:
   - Required fields filled
   - Coordinate format valid
   - Park ID unique
4. **API Submission**: POST request to `/api/parks`
5. **Database Storage**: Park record created in MongoDB
6. **UI Update**: Success message and redirect

**Error Handling:**
- Duplicate park ID: Show error, suggest alternative
- Invalid coordinates: Show map for manual selection
- Network error: Offer retry option

#### 1.2 Update Park Information
```mermaid
flowchart TD
    A[User Selects Park] --> B[Clicks 'Edit Park']
    B --> C[Loads Current Park Data]
    C --> D[User Modifies Fields]
    D --> E[Validates Changes]
    E --> F{Validation Success?}
    F -->|Yes| G[Submits Update]
    F -->|No| H[Shows Validation Errors]
    H --> D
    G --> I[API Updates Record]
    I --> J[Returns Updated Data]
    J --> K[UI Refreshes with New Data]
```

### 2. Dashboard Interaction Workflow

#### 2.1 Real-time Monitoring
```mermaid
flowchart TD
    A[User Opens Dashboard] --> B[Establishes WebSocket Connection]
    B --> C[Subscribes to Park Updates]
    C --> D[Loads Initial Data]
    D --> E[Displays Dashboard]
    E --> F[Receives Real-time Updates]
    F --> G{Update Type?}
    G -->|Sensor Data| H[Updates Sensor Charts]
    G -->|Health Score| I[Updates Health Display]
    G -->|Alert| J[Shows Alert Notification]
    H --> K[Continues Monitoring]
    I --> K
    J --> K
    K --> F
```

**WebSocket Message Types:**
- `sensor_update`: New sensor readings
- `health_update`: Updated health scores
- `alert`: System alerts and notifications
- `node_status`: IoT node online/offline status

#### 2.2 Historical Data Analysis
```mermaid
flowchart TD
    A[User Selects Time Range] --> B[Clicks 'Generate Report']
    B --> C[API Fetches Historical Data]
    C --> D[Processes Data for Visualization]
    D --> E[Generates Charts and Tables]
    E --> F[Displays Analytics Dashboard]
    F --> G[User Interacts with Visualizations]
    G --> H{User Action?}
    H -->|Export Data| I[Generates Download File]
    H -->|Drill Down| J[Shows Detailed View]
    H -->|Change Parameters| A
    I --> K[File Downloaded]
    J --> L[Displays Detailed Analytics]
    L --> G
    K --> G
```

### 3. IoT Node Management Workflow

#### 3.1 Node Registration
```mermaid
flowchart TD
    A[New Node Powered On] --> B[Node Reads Configuration]
    B --> C[Establishes Network Connection]
    C --> D[Tests API Connectivity]
    D --> E{API Reachable?}
    E -->|Yes| F[Sends Registration Request]
    E -->|No| G[Enters Offline Mode]
    G --> H[Retries Connection]
    H --> D
    F --> I[API Validates Node]
    I --> J{Node Valid?}
    J -->|Yes| K[Creates Node Record]
    J -->|No| L[Rejects Registration]
    L --> M[Node Enters Error State]
    K --> N[Starts Data Collection]
    N --> O[Sends Periodic Heartbeats]
```

**Node Registration Data:**
```json
{
  "node_id": "node_001",
  "park_id": "park_001",
  "firmware_version": "1.0.0",
  "hardware_version": "v1.0",
  "sensor_types": ["temperature", "humidity", "soil_moisture", "light_intensity"],
  "capabilities": ["camera", "wifi", "ethernet"],
  "location": {"lat": 28.6139, "lon": 77.2090}
}
```

#### 3.2 Sensor Data Collection Cycle
```mermaid
flowchart TD
    A[Timer Triggers Collection] --> B[Initialize Sensors]
    B --> C[Read Temperature/Humidity]
    C --> D[Read Soil Moisture]
    D --> E[Read Light Intensity]
    E --> F[Validate Readings]
    F --> G{Data Valid?}
    G -->|Yes| H[Package Sensor Data]
    G -->|No| I[Retry Reading]
    I --> C
    H --> J[Transmit to API]
    J --> K{Transmission Success?}
    K -->|Yes| L[Update Success Metrics]
    K -->|No| M[Buffer Failed Data]
    M --> N[Schedule Retry]
    L --> O[Wait for Next Cycle]
    N --> O
    O --> A
```

## Automated System Workflows

### 1. Data Processing Pipeline

#### 1.1 Real-time Data Processing
```mermaid
flowchart TD
    A[Sensor Data Received] --> B[Validate Data Format]
    B --> C{Format Valid?}
    C -->|No| D[Log Error & Reject]
    C -->|Yes| E[Enrich with Metadata]
    E --> F[Store in Raw Collection]
    F --> G[Trigger Health Score Calculation]
    G --> H[Update Real-time Aggregates]
    H --> I[Broadcast WebSocket Updates]
    I --> J[Check for Alert Conditions]
    J --> K{Alert Triggered?}
    K -->|Yes| L[Generate Alert]
    K -->|No| M[Processing Complete]
    L --> N[Send Notifications]
    N --> M
```

**Data Enrichment Process:**
```python
def enrich_sensor_data(raw_data):
    enriched = raw_data.copy()
    
    # Add geographic context
    enriched["geographic_region"] = determine_region(raw_data["location"])
    
    # Add temporal context
    enriched["time_of_day"] = categorize_time(raw_data["timestamp"])
    enriched["season"] = determine_season(raw_data["timestamp"])
    
    # Add quality metrics
    enriched["data_quality"] = calculate_quality_score(raw_data)
    
    # Add historical context
    enriched["historical_comparison"] = get_historical_comparison(raw_data)
    
    return enriched
```

#### 1.2 Health Score Calculation Workflow
```mermaid
flowchart TD
    A[Trigger Health Calculation] --> B[Collect Recent Sensor Data]
    B --> C[Collect Recent Image Analysis]
    C --> D[Validate Data Availability]
    D --> E{Sufficient Data?}
    E -->|No| F[Skip Calculation]
    E -->|Yes| G[Calculate Component Scores]
    G --> H[Apply Weighted Aggregation]
    H --> I[Calculate Trend Analysis]
    I --> J[Generate Recommendations]
    J --> K[Store Health Score]
    K --> L[Broadcast Update]
    L --> M[Check for Score Anomalies]
    M --> N{Anomaly Detected?}
    N -->|Yes| O[Generate Alert]
    N -->|No| P[Calculation Complete]
    O --> P
```

### 2. Background Processing Workflows

#### 2.1 Hourly Data Aggregation
```mermaid
flowchart TD
    A[Hourly Timer Trigger] --> B[Define Time Window]
    B --> C[Query Raw Sensor Data]
    C --> D[Group by Park and Sensor Type]
    D --> E[Calculate Aggregates]
    E --> F[Store Hourly Aggregates]
    F --> G[Update Performance Metrics]
    G --> H[Check Data Quality]
    H --> I{Quality Issues?}
    I -->|Yes| J[Generate Quality Alert]
    I -->|No| K[Aggregation Complete]
    J --> K
```

**Aggregation Calculations:**
```python
def calculate_hourly_aggregates(raw_data):
    aggregates = {}
    
    for sensor_type in SENSOR_TYPES:
        values = [reading["value"] for reading in raw_data 
                 if reading["sensor_type"] == sensor_type]
        
        if values:
            aggregates[sensor_type] = {
                "avg_value": np.mean(values),
                "min_value": np.min(values),
                "max_value": np.max(values),
                "std_dev": np.std(values),
                "count": len(values),
                "quality_score": calculate_data_quality(values)
            }
    
    return aggregates
```

#### 2.2 Daily Report Generation
```mermaid
flowchart TD
    A[Daily Timer Trigger] --> B[Collect Daily Aggregates]
    B --> C[Generate Health Score Summary]
    C --> D[Create Performance Report]
    D --> E[Identify Trends and Patterns]
    E --> F[Generate Recommendations]
    F --> G[Create PDF Report]
    G --> H[Email Report to Stakeholders]
    H --> I[Archive Report]
    I --> J[Daily Report Complete]
```

### 3. Maintenance Workflows

#### 3.1 Database Maintenance
```mermaid
flowchart TD
    A[Maintenance Timer Trigger] --> B[Check Database Health]
    B --> C{Database Healthy?}
    C -->|No| D[Initiate Recovery Procedures]
    C -->|Yes| E[Optimize Indexes]
    E --> F[Compact Collections]
    F --> G[Update Statistics]
    G --> H[Create Backups]
    H --> I[Archive Old Data]
    I --> J[Maintenance Complete]
    D --> K[Log Recovery Actions]
    K --> L[Notify Administrators]
    L --> J
```

#### 3.2 System Health Monitoring
```mermaid
flowchart TD
    A[Health Check Timer] --> B[Check API Response Time]
    B --> C[Check Database Connectivity]
    C --> D[Check IoT Node Status]
    D --> E[Check Disk Space]
    E --> F[Check Memory Usage]
    F --> G[Check Network Connectivity]
    G --> H[Compile Health Report]
    H --> I{All Systems Healthy?}
    I -->|No| J[Generate Health Alert]
    I -->|Yes| K[Log Healthy Status]
    J --> L[Notify Administrators]
    K --> M[Continue Monitoring]
    L --> M
```

## Data Processing Workflows

### 1. Image Analysis Pipeline

#### 1.1 Vegetation Health Analysis
```mermaid
flowchart TD
    A[Image Captured] --> B[Preprocess Image]
    B --> C[Convert to HSV Color Space]
    C --> D[Apply Green Color Mask]
    D --> E[Calculate Green Coverage]
    E --> F[Detect Edges for Density]
    F --> G[Calculate Vegetation Metrics]
    G --> H[Generate Health Score]
    H --> I[Store Analysis Results]
    I --> J[Trigger Health Recalculation]
```

**Image Processing Steps:**
```python
def analyze_vegetation_health(image_path):
    # Step 1: Load and preprocess
    image = cv2.imread(image_path)
    resized = cv2.resize(image, (1296, 972))
    
    # Step 2: Color analysis
    hsv = cv2.cvtColor(resized, cv2.COLOR_BGR2HSV)
    green_mask = create_green_mask(hsv)
    green_percentage = calculate_coverage(green_mask)
    
    # Step 3: Texture analysis
    gray = cv2.cvtColor(resized, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 50, 150)
    texture_density = calculate_texture_density(edges)
    
    # Step 4: Health scoring
    health_score = calculate_vegetation_health_score(
        green_percentage, texture_density
    )
    
    return {
        "health_score": health_score,
        "green_coverage": green_percentage,
        "texture_density": texture_density,
        "analysis_timestamp": datetime.utcnow()
    }
```

#### 1.2 Biodiversity Assessment
```mermaid
flowchart TD
    A[Image Captured] --> B[Extract Color Features]
    B --> C[Identify Vegetation Types]
    C --> D[Calculate Color Distribution]
    D --> E[Apply Diversity Index Formula]
    E --> F[Assess Habitat Complexity]
    F --> G[Generate Biodiversity Score]
    G --> H[Update Park Biodiversity Metrics]
```

### 2. Anomaly Detection Workflow

#### 2.1 Sensor Anomaly Detection
```mermaid
flowchart TD
    A[New Sensor Reading] --> B[Compare to Historical Baseline]
    B --> C[Calculate Statistical Deviation]
    C --> D{Deviation > Threshold?}
    D -->|No| E[Normal Processing]
    D -->|Yes| F[Check for Sensor Fault]
    F --> G{Sensor Fault?}
    G -->|Yes| H[Generate Sensor Alert]
    G -->|No| I[Generate Environmental Alert]
    H --> J[Mark Sensor for Maintenance]
    I --> K[Log Environmental Anomaly]
    J --> L[Notify Maintenance Team]
    K --> M[Notify Park Management]
    L --> N[Continue Monitoring]
    M --> N
```

**Anomaly Detection Algorithm:**
```python
def detect_sensor_anomaly(reading, historical_data):
    # Calculate baseline statistics
    values = [r["value"] for r in historical_data]
    mean = np.mean(values)
    std_dev = np.std(values)
    
    # Calculate z-score
    z_score = abs(reading["value"] - mean) / std_dev
    
    # Determine anomaly level
    if z_score > 3:
        return "critical", "Extreme deviation detected"
    elif z_score > 2:
        return "high", "Significant deviation detected"
    elif z_score > 1.5:
        return "medium", "Moderate deviation detected"
    else:
        return "normal", "Within expected range"
```

#### 2.2 Health Score Trend Analysis
```mermaid
flowchart TD
    A[New Health Score Calculated] --> B[Compare to Historical Scores]
    B --> C[Calculate Trend Line]
    C --> D[Identify Trend Direction]
    D --> E{Trend Declining?}
    E -->|No| F[Normal Processing]
    E -->|Yes| G[Calculate Decline Rate]
    G --> H{Decline Rate > Threshold?}
    H -->|No| I[Generate Warning Alert]
    H -->|Yes| J[Generate Critical Alert]
    I --> K[Schedule Follow-up Assessment]
    J --> L[Immediate Notification Required]
    K --> M[Continue Monitoring]
    L --> M
```

## Monitoring and Alerting Workflows

### 1. Alert Generation Workflow

#### 1.1 Alert Classification
```mermaid
flowchart TD
    A[Trigger Event Detected] --> B[Analyze Event Context]
    B --> C[Determine Alert Category]
    C --> D{Alert Category}
    D -->|System| E[System Alert Workflow]
    D -->|Environmental| F[Environmental Alert Workflow]
    D -->|Maintenance| G[Maintenance Alert Workflow]
    E --> H[Assign Severity Level]
    F --> H
    G --> H
    H --> I[Generate Alert Message]
    I --> J[Route to Recipients]
    J --> K[Log Alert]
    K --> L[Schedule Follow-up]
```

**Alert Severity Classification:**
```python
def classify_alert_severity(event_type, impact_level, urgency):
    if event_type == "sensor_failure":
        return "critical"
    elif event_type == "health_decline" and impact_level > 0.5:
        return "high"
    elif event_type == "environmental_anomaly" and urgency == "immediate":
        return "high"
    elif impact_level > 0.3:
        return "medium"
    else:
        return "low"
```

#### 1.2 Notification Routing
```mermaid
flowchart TD
    A[Alert Generated] --> B[Check Alert Severity]
    B --> C{Severity Level}
    C -->|Critical| D[Immediate SMS & Email]
    C -->|High| E[Email & Dashboard Notification]
    C -->|Medium| F[Dashboard Notification]
    C -->|Low| G[Log Only]
    D --> H[Track Delivery Status]
    E --> H
    F --> I[Update Alert Status]
    G --> I
    H --> I
    I --> J[Monitor Response]
```

### 2. System Health Monitoring

#### 2.1 Component Health Checks
```mermaid
flowchart TD
    A[Health Check Timer] --> B[Check API Response Time]
    B --> C[Check Database Connection]
    C --> D[Check WebSocket Connections]
    D --> E[Check IoT Node Heartbeats]
    E --> F[Check Disk Space Usage]
    F --> G[Check Memory Usage]
    G --> H[Check Network Latency]
    H --> I[Compile Health Metrics]
    I --> J[Calculate Overall Health Score]
    J --> K{Health Score < 80?}
    K -->|Yes| L[Generate Health Alert]
    K -->|No| M[Log Healthy Status]
    L --> N[Notify Administrators]
    M --> O[Continue Monitoring]
    N --> O
```

#### 2.2 Performance Monitoring
```mermaid
flowchart TD
    A[Performance Timer] --> B[Collect API Metrics]
    B --> C[Collect Database Metrics]
    C --> D[Collect IoT Metrics]
    D --> E[Analyze Performance Trends]
    E --> F{Performance Degradation?}
    F -->|No| G[Update Performance Dashboard]
    F -->|Yes| H[Identify Bottleneck]
    H --> I[Generate Performance Alert]
    I --> J[Recommend Optimizations]
    J --> K[Notify Operations Team]
    G --> L[Continue Monitoring]
    K --> L
```

## Maintenance Workflows

### 1. Scheduled Maintenance

#### 1.1 Daily Maintenance Tasks
```mermaid
flowchart TD
    A[Daily Maintenance Timer] --> B[Database Backup]
    B --> C[Log File Rotation]
    C --> D[Cache Cleanup]
    D --> E[Performance Metrics Collection]
    E --> F[Health Score Verification]
    F --> G[Data Quality Checks]
    G --> H[Generate Daily Report]
    H --> I[Archive Maintenance Logs]
    I --> J[Daily Maintenance Complete]
```

#### 1.2 Weekly Maintenance Tasks
```mermaid
flowchart TD
    A[Weekly Maintenance Timer] --> B[Database Optimization]
    B --> C[Index Rebuilding]
    C --> D[System Security Updates]
    D --> E[Performance Baseline Update]
    E --> F[IoT Node Firmware Check]
    F --> G[Storage Capacity Review]
    G --> H[Generate Weekly Report]
    H --> I[Schedule Maintenance Window]
    I --> J[Weekly Maintenance Complete]
```

### 2. Emergency Maintenance

#### 2.1 System Failure Response
```mermaid
flowchart TD
    A[Failure Detected] --> B[Assess Impact Scope]
    B --> C{Critical System?}
    C -->|Yes| D[Activate Emergency Response]
    C -->|No| E[Standard Troubleshooting]
    D --> F[Notify All Stakeholders]
    F --> G[Initiate Failover Procedures]
    G --> H[Start Recovery Process]
    H --> I[Verify System Recovery]
    I --> J{System Recovered?}
    J -->|No| K[Escalate to Critical Incident]
    J -->|Yes| L[Document Incident]
    K --> M[Engage Senior Leadership]
    L --> N[Conduct Post-Mortem]
    M --> H
    N --> O[Update Procedures]
    O --> P[Recovery Complete]
```

#### 2.2 Data Recovery Procedures
```mermaid
flowchart TD
    A[Data Corruption Detected] --> B[Isolate Affected Systems]
    B --> C[Identify Corruption Scope]
    C --> D{Backup Available?}
    D -->|Yes| E[Initiate Restore Procedure]
    D -->|No| F[Attempt Data Repair]
    E --> G[Restore from Latest Backup]
    G --> H[Verify Data Integrity]
    H --> I{Data Valid?}
    I -->|No| J[Try Earlier Backup]
    I -->|Yes| K[Resume Normal Operations]
    J --> G
    F --> L{Repair Successful?}
    L -->|Yes| M[Validate Repaired Data]
    L -->|No| N[Escalate to Data Recovery Team]
    M --> K
    N --> O[Engage External Specialists]
```

## Emergency Response Workflows

### 1. Critical Alert Response

#### 1.1 Environmental Emergency
```mermaid
flowchart TD
    A[Critical Environmental Alert] --> B[Verify Alert Validity]
    B --> C{Alert Confirmed?}
    C -->|No| D[Mark as False Positive]
    C -->|Yes| E[Activate Emergency Protocol]
    E --> F[Notify Park Management]
    F --> G[Notify Environmental Agencies]
    G --> H[Deploy Field Team]
    H --> I[Initiate Continuous Monitoring]
    I --> J[Provide Regular Updates]
    J --> K[Document Response Actions]
    K --> L[Review Emergency Response]
```

#### 1.2 System Emergency
```mermaid
flowchart TD
    A[System Failure Alert] --> B[Assess System Impact]
    B --> C{Core Services Affected?}
    C -->|Yes| D[Activate Disaster Recovery]
    C -->|No| E[Standard Recovery Procedures]
    D --> F[Switch to Backup Systems]
    F --> G[Notify All Users]
    G --> H[Initiate Full System Restore]
    H --> I[Verify System Functionality]
    I --> J[Return to Primary Systems]
    E --> K[Troubleshoot Issue]
    K --> L[Apply Fix]
    L --> M[Verify Resolution]
    M --> N[Restore Full Service]
```

### 2. Communication Workflows

#### 2.1 Stakeholder Notification
```mermaid
flowchart TD
    A[Event Requiring Notification] --> B[Identify Affected Stakeholders]
    B --> C[Determine Communication Channels]
    C --> D[Draft Notification Message]
    D --> E[Review Message Content]
    E --> F{Message Approved?}
    F -->|No| G[Revise Message]
    F -->|Yes| H[Send Notifications]
    G --> D
    H --> I[Track Delivery Status]
    I --> J[Log Communication]
    J --> K[Monitor for Responses]
    K --> L[Follow-up if Needed]
```

#### 2.2 Incident Reporting
```mermaid
flowchart TD
    A[Incident Occurs] --> B[Document Initial Details]
    B --> C[Assess Incident Severity]
    C --> D[Create Incident Report]
    D --> E[Notify Response Team]
    E --> F[Begin Investigation]
    F --> G[Collect Evidence]
    G --> H[Analyze Root Cause]
    H --> I[Develop Resolution Plan]
    I --> J[Implement Resolution]
    J --> K[Verify Resolution Success]
    K --> L[Complete Incident Report]
    L --> M[Share Lessons Learned]
```

This comprehensive system workflows documentation provides detailed operational procedures for all aspects of the GreenPulse system, ensuring consistent and reliable operations across all scenarios.
