# Google Maps Integration - Live Attendance Tracking

## Overview
The Live Attendance section now includes full Google Maps integration that shows real-time employee locations on an interactive map.

## Features

### ✨ Interactive Map Features
- **Real Google Maps Integration**: Uses Google Maps JavaScript API for accurate visualization
- **Office Location Marker**: Red marker showing the exact office location in Mumbai
- **Office Radius Circle**: 500m radius circle indicating the office vicinity
- **Employee Location Markers**: Colored markers for each working employee
- **Real-time Updates**: Locations update automatically via WebSocket
- **Interactive Info Windows**: Click any marker to see detailed employee information

### 🎯 Employee Tracking
- **Live Location Tracking**: See where each employee is working from
- **Distance Calculation**: Automatic distance calculation from office
- **Work From Home Detection**: Special markers for WFH employees
- **Status Indicators**: Color-coded markers based on attendance status
  - 🟢 Green: In office radius (< 500m)
  - 🔵 Blue: Present but remote
  - 🟡 Amber: Late arrival
  - ⚫ Gray: Other status

### 📍 Location Details
- **Geolocation Coordinates**: Exact lat/lng for each employee
- **Address Information**: Reverse geocoded addresses
- **Check-in Time**: When the employee started their day
- **Work Location Type**: Office or Home designation

## Setup Instructions

### 1. Google Maps API Key
The application uses the Gemini API key which has Google Maps API access enabled.

**Current API Key**: `AIzaSyDPVqF1eIKiHDxzP4D3OciR1VvyLL7Xv0Y`

### 2. Environment Variables

**Server (.env)**:
```env
GOOGLE_MAPS_API_KEY=AIzaSyDPVqF1eIKiHDxzP4D3OciR1VvyLL7Xv0Y
OFFICE_LAT=19.160122
OFFICE_LNG=72.839720
OFFICE_RADIUS=500
OFFICE_ADDRESS="Blackhole Infiverse, Kali Gali, 176/1410, Rd Number 3, near Hathi Circle, above Bright Connection, Motilal Nagar II, Goregaon West, Mumbai, Maharashtra 400104"
```

**Client (.env)**:
```env
VITE_GOOGLE_MAPS_API_KEY=AIzaSyDPVqF1eIKiHDxzP4D3OciR1VvyLL7Xv0Y
VITE_API_URL=http://localhost:5000/api
```

### 3. Required NPM Packages
The following package is required:
```bash
npm install @react-google-maps/api
```

## How to Use

### Accessing the Live Attendance Map

1. **Navigate to Live Attendance**
   - Go to Admin Dashboard
   - Click on "Live Attendance" or "Attendance Analytics"
   - Select the "Location Map" tab

2. **View Employee Locations**
   - The map automatically loads with all employees who have location data
   - Office location is marked with a red arrow marker
   - Each employee has a colored circle marker

3. **Interact with Markers**
   - Click on any employee marker to see detailed information
   - Info window shows:
     - Employee name and avatar
     - Current status
     - Location type (Office/Home)
     - Distance from office
     - Check-in time
     - Full address

4. **Employee List Panel**
   - Right side panel shows all tracked employees
   - Click on an employee to:
     - Highlight their location on the map
     - See detailed information
     - View their coordinates

## Map Features

### Office Location
- **Marker**: Red arrow pointing down
- **Circle**: 500m radius blue circle
- **Info**: Click to see office address and coordinates

### Employee Markers
**Color Coding**:
- **Green Circle**: Employee is within office radius (< 500m)
- **Blue Circle**: Employee is present but working remotely
- **Amber Circle**: Employee arrived late
- **Gray Circle**: Other status

**Animations**:
- Markers drop with animation when loaded
- Smooth transitions when zooming/panning

### Map Controls
- **Zoom**: Use + / - buttons or scroll wheel
- **Pan**: Click and drag to move around
- **Street View**: Available via pegman icon
- **Map Type**: Switch between map, satellite views
- **Fullscreen**: Expand map to fullscreen mode

## Data Flow

### 1. Employee Check-in
```javascript
// When employee starts day
POST /api/attendance/start-day/:userId
Body: {
  latitude: 19.160122,
  longitude: 72.839720,
  address: "...",
  accuracy: 10,
  workFromHome: false
}
```

### 2. Live Data Fetch
```javascript
// Admin fetches live attendance
GET /api/attendance/live
Response: {
  success: true,
  attendance: [...],
  stats: {...}
}
```

### 3. Real-time Updates
```javascript
// Socket events
socket.on('attendance:day-started', (data) => {
  // Update map markers
});
```

## Technical Details

### Components

**LiveAttendanceMap.jsx**
- Main map component using `@react-google-maps/api`
- Renders Google Maps with markers
- Handles marker clicks and info windows
- Calculates distances using geolib

**LiveAttendanceDashboard.jsx**
- Parent component managing data fetch
- Integrates map into tabbed interface
- Handles WebSocket real-time updates

### Key Functions

**Distance Calculation**:
```javascript
calculateDistance(lat1, lon1, lat2, lon2) {
  // Uses Haversine formula
  // Returns distance in meters
}
```

**Marker Colors**:
```javascript
getMarkerColor(status, distance) {
  if (distance <= 500) return '#10b981'; // Green
  // Color based on status
}
```

**Map Bounds**:
```javascript
// Auto-fits map to show all markers
bounds.extend(officeLocation);
bounds.extend(employeeLocation);
map.fitBounds(bounds);
```

## API Endpoints

### Get Live Attendance
**Endpoint**: `GET /api/attendance/live`

**Query Parameters**:
- `date` (optional): Date to fetch (default: today)
- `department` (optional): Filter by department
- `status` (optional): Filter by status

**Response**:
```json
{
  "success": true,
  "attendance": [
    {
      "_id": "...",
      "user": {
        "name": "John Doe",
        "email": "john@example.com",
        "avatar": "..."
      },
      "location": {
        "latitude": 19.160122,
        "longitude": 72.839720,
        "address": "...",
        "accuracy": 10
      },
      "workLocationType": "Office",
      "status": "present",
      "startDayTime": "2025-11-15T09:00:00Z"
    }
  ],
  "stats": {
    "totalEmployees": 50,
    "presentToday": 45,
    "absentToday": 5,
    "avgAttendance": 90
  }
}
```

## Troubleshooting

### Map Not Loading
1. **Check API Key**: Ensure `VITE_GOOGLE_MAPS_API_KEY` is set in client/.env
2. **Check Console**: Look for Google Maps API errors
3. **API Limits**: Verify you haven't exceeded API quotas
4. **Network**: Check if Google Maps API is accessible

### No Employee Markers
1. **Location Data**: Ensure employees have checked in with location
2. **Permissions**: Verify employees allowed location access
3. **Data Format**: Check that location has latitude/longitude fields

### Markers Not Updating
1. **WebSocket**: Verify socket connection is active
2. **Events**: Check socket event listeners are registered
3. **Auto-refresh**: The dashboard auto-refreshes every 30 seconds

### Distance Calculation Issues
1. **Coordinates**: Verify office coordinates are correct
2. **Units**: Distance is returned in meters (convert to km if needed)
3. **Accuracy**: GPS accuracy affects distance calculations

## Security Notes

- Location data is stored securely in the database
- Only admins can view employee locations
- Employees must consent to location tracking
- Location data is encrypted in transit (HTTPS)
- API key is restricted to specific domains

## Performance Optimization

- Map loads lazily with LoadScript
- Markers are optimized for large datasets
- Info windows load on-demand
- Auto-refresh interval is configurable
- Map bounds adjust automatically

## Future Enhancements

- [ ] Geofencing alerts when employees leave office radius
- [ ] Location history timeline
- [ ] Heat maps for office density
- [ ] Route tracking for field employees
- [ ] Custom map styles
- [ ] Export location data to CSV
- [ ] Location-based attendance reports
- [ ] Multi-office support

## Support

For issues or questions:
- Check browser console for errors
- Verify API key and environment variables
- Ensure location permissions are granted
- Contact: suravijay816@gmail.com
