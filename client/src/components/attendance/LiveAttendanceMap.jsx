import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow, Circle } from '@react-google-maps/api';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Users, 
  Navigation, 
  Wifi, 
  WifiOff,
  Clock,
  Building,
  Smartphone,
  Monitor,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Home,
  Navigation2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyDPVqF1eIKiHDxzP4D3OciR1VvyLL7Xv0Y';

const mapContainerStyle = {
  width: '100%',
  height: '600px',
  borderRadius: '12px'
};

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: true,
  mapTypeControl: true,
  fullscreenControl: true,
  styles: [
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [{ visibility: "off" }]
    }
  ]
};

const LiveAttendanceMap = ({ attendance }) => {
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [map, setMap] = useState(null);
  const [infoWindowOpen, setInfoWindowOpen] = useState(null);

  // Office location - Blackhole Infiverse
  const officeLocation = {
    lat: 19.160122,
    lng: 72.839720,
    address: "Blackhole Infiverse, Kali Gali, 176/1410, Rd Number 3, near Hathi Circle, above Bright Connection, Motilal Nagar II, Goregaon West, Mumbai, Maharashtra 400104"
  };

  const [mapCenter, setMapCenter] = useState(officeLocation);

  // Filter employees with location data
  const employeesWithLocation = attendance?.filter(emp => 
    emp.location && emp.location.latitude && emp.location.longitude
  ) || [];

  // Load map callback
  const onLoad = useCallback((map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Fit bounds to show all markers
  useEffect(() => {
    if (map && employeesWithLocation.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      
      // Add office location
      bounds.extend(new window.google.maps.LatLng(officeLocation.lat, officeLocation.lng));
      
      // Add all employee locations
      employeesWithLocation.forEach(emp => {
        if (emp.location?.latitude && emp.location?.longitude) {
          bounds.extend(new window.google.maps.LatLng(
            emp.location.latitude,
            emp.location.longitude
          ));
        }
      });
      
      map.fitBounds(bounds);
      
      // Set a minimum zoom level
      const listener = window.google.maps.event.addListener(map, 'idle', () => {
        if (map.getZoom() > 16) map.setZoom(16);
        window.google.maps.event.removeListener(listener);
      });
    }
  }, [map, employeesWithLocation]);

  // Calculate distance from office
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c; // Distance in kilometers
    return d * 1000; // Convert to meters
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'present':
        return 'text-green-500';
      case 'absent':
        return 'text-red-500';
      case 'late':
        return 'text-yellow-500';
      case 'on-leave':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  const getMarkerColor = (status, distance) => {
    if (distance <= 500) return '#10b981'; // Green - inside office
    
    switch (status?.toLowerCase()) {
      case 'present':
        return '#3b82f6'; // Blue
      case 'late':
        return '#f59e0b'; // Amber
      default:
        return '#6b7280'; // Gray
    }
  };

  const getMarkerIcon = (status, distance, workLocationType) => {
    const color = getMarkerColor(status, distance);
    const size = 40;
    
    let icon = '👤';
    if (workLocationType === 'Home') {
      icon = '🏠';
    } else if (distance <= 500) {
      icon = '🏢';
    }
    
    return {
      path: window.google.maps.SymbolPath.CIRCLE,
      fillColor: color,
      fillOpacity: 0.9,
      strokeColor: '#ffffff',
      strokeWeight: 3,
      scale: 12,
    };
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'present':
        return <CheckCircle className="w-4 h-4" />;
      case 'absent':
        return <XCircle className="w-4 h-4" />;
      case 'late':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatTime = (time) => {
    if (!time) return 'Not recorded';
    return new Date(time).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="space-y-6">
      {/* Map Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Live Location Map
          </CardTitle>
          <CardDescription>
            Real-time employee locations and office proximity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4" />
              <span>Office Location: Mumbai, Maharashtra</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>{employeesWithLocation.length} employees with location data</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Map Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Area */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={mapCenter}
                  zoom={14}
                  options={mapOptions}
                  onLoad={onLoad}
                  onUnmount={onUnmount}
                >
                  {/* Office Location Marker */}
                  <Marker
                    position={{ lat: officeLocation.lat, lng: officeLocation.lng }}
                    icon={{
                      path: window.google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
                      fillColor: '#ef4444',
                      fillOpacity: 1,
                      strokeColor: '#ffffff',
                      strokeWeight: 2,
                      scale: 8,
                      rotation: 180
                    }}
                    title="Office Location"
                    onClick={() => {
                      setSelectedEmployee(null);
                      setInfoWindowOpen('office');
                    }}
                  />

                  {/* Office Radius Circle */}
                  <Circle
                    center={{ lat: officeLocation.lat, lng: officeLocation.lng }}
                    radius={500}
                    options={{
                      fillColor: '#3b82f6',
                      fillOpacity: 0.1,
                      strokeColor: '#3b82f6',
                      strokeOpacity: 0.4,
                      strokeWeight: 2,
                    }}
                  />

                  {/* Office Info Window */}
                  {infoWindowOpen === 'office' && (
                    <InfoWindow
                      position={{ lat: officeLocation.lat, lng: officeLocation.lng }}
                      onCloseClick={() => setInfoWindowOpen(null)}
                    >
                      <div className="p-2">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                          <Building className="w-5 h-5 text-red-500" />
                          Office Location
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {officeLocation.address}
                        </p>
                        <div className="mt-2 text-xs text-gray-500">
                          <p>Lat: {officeLocation.lat}</p>
                          <p>Lng: {officeLocation.lng}</p>
                        </div>
                      </div>
                    </InfoWindow>
                  )}

                  {/* Employee Markers */}
                  {employeesWithLocation.map((employee) => {
                    const distance = calculateDistance(
                      officeLocation.lat,
                      officeLocation.lng,
                      employee.location.latitude,
                      employee.location.longitude
                    );

                    return (
                      <React.Fragment key={employee._id}>
                        <Marker
                          position={{
                            lat: employee.location.latitude,
                            lng: employee.location.longitude
                          }}
                          icon={getMarkerIcon(employee.status, distance, employee.workLocationType)}
                          title={employee.user?.name}
                          onClick={() => {
                            setSelectedEmployee(employee);
                            setInfoWindowOpen(employee._id);
                          }}
                          animation={window.google.maps.Animation.DROP}
                        />

                        {/* Employee Info Window */}
                        {infoWindowOpen === employee._id && (
                          <InfoWindow
                            position={{
                              lat: employee.location.latitude,
                              lng: employee.location.longitude
                            }}
                            onCloseClick={() => {
                              setInfoWindowOpen(null);
                              setSelectedEmployee(null);
                            }}
                          >
                            <div className="p-3 min-w-[250px]">
                              <div className="flex items-center gap-3 mb-3">
                                <Avatar className="w-12 h-12">
                                  <AvatarImage src={employee.user?.avatar} />
                                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                                    {employee.user?.name?.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <h3 className="font-bold text-base">{employee.user?.name}</h3>
                                  <p className="text-xs text-gray-600">{employee.user?.email}</p>
                                </div>
                              </div>

                              <div className="space-y-2 text-sm">
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-600">Status:</span>
                                  <Badge variant="outline" className={getStatusColor(employee.status)}>
                                    {employee.status}
                                  </Badge>
                                </div>

                                <div className="flex items-center justify-between">
                                  <span className="text-gray-600">Location:</span>
                                  <span className="font-medium">
                                    {employee.workLocationType || 'Office'}
                                  </span>
                                </div>

                                <div className="flex items-center justify-between">
                                  <span className="text-gray-600">Distance:</span>
                                  <span className={`font-medium ${distance <= 500 ? 'text-green-600' : 'text-orange-600'}`}>
                                    {distance <= 500 ? (
                                      <>
                                        <CheckCircle className="w-3 h-3 inline mr-1" />
                                        {distance.toFixed(0)}m (In office)
                                      </>
                                    ) : (
                                      <>
                                        <Navigation2 className="w-3 h-3 inline mr-1" />
                                        {(distance / 1000).toFixed(1)}km away
                                      </>
                                    )}
                                  </span>
                                </div>

                                <div className="flex items-center justify-between">
                                  <span className="text-gray-600">Check In:</span>
                                  <span className="font-medium">
                                    {formatTime(employee.startDayTime)}
                                  </span>
                                </div>

                                {employee.location?.address && (
                                  <div className="mt-2 pt-2 border-t">
                                    <p className="text-xs text-gray-500 flex items-start gap-1">
                                      <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                      <span>{employee.location.address}</span>
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </InfoWindow>
                        )}
                      </React.Fragment>
                    );
                  })}
                </GoogleMap>
              </LoadScript>

              {/* Map Legend */}
              <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-lg border max-w-xs">
                <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Map Legend
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full" />
                    <span>Office Location</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                    <span>Employee (In Office Radius)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full" />
                    <span>Employee (Remote)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-amber-500 rounded-full" />
                    <span>Late Arrival</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full border-2 border-blue-500 bg-blue-100" />
                    <span>500m Office Radius</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t text-xs text-gray-600">
                  <p className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {employeesWithLocation.length} employees tracked
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Employee List */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Employee Locations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-80 overflow-y-auto">
              {employeesWithLocation.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No location data available</p>
                </div>
              ) : (
                employeesWithLocation.map((employee) => {
                  const distance = calculateDistance(
                    officeLocation.lat,
                    officeLocation.lng,
                    employee.location.latitude,
                    employee.location.longitude
                  );
                  
                  return (
                    <motion.div
                      key={employee._id}
                      whileHover={{ scale: 1.02 }}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        selectedEmployee?._id === employee._id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedEmployee(employee)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={employee.user?.avatar} />
                          <AvatarFallback className="text-xs">
                            {employee.user?.name?.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm truncate">
                              {employee.user?.name}
                            </p>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getStatusColor(employee.status)}`}
                            >
                              {getStatusIcon(employee.status)}
                              <span className="ml-1">{employee.status}</span>
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-2 mt-1">
                            <Navigation className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-600">
                              {distance <= 500 ? (
                                <span className="text-green-600 font-medium flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3" />
                                  In office ({distance.toFixed(0)}m)
                                </span>
                              ) : (
                                <span className="text-orange-600 flex items-center gap-1">
                                  <Navigation2 className="w-3 h-3" />
                                  {(distance / 1000).toFixed(1)}km away
                                </span>
                              )}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 mt-1">
                            {employee.workLocationType === 'Home' ? (
                              <Home className="w-3 h-3 text-purple-500" />
                            ) : employee.source === 'StartDay' ? (
                              <Smartphone className="w-3 h-3 text-blue-500" />
                            ) : employee.source === 'Biometric' ? (
                              <Monitor className="w-3 h-3 text-green-500" />
                            ) : (
                              <Building className="w-3 h-3 text-gray-500" />
                            )}
                            <span className="text-xs text-gray-500">
                              {formatTime(employee.startDayTime)}
                            </span>
                            {employee.workLocationType === 'Home' && (
                              <Badge variant="outline" className="text-xs text-purple-600">
                                WFH
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Selected Employee Details */}
          {selectedEmployee && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Employee Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={selectedEmployee.user?.avatar} />
                    <AvatarFallback>
                      {selectedEmployee.user?.name?.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium">{selectedEmployee.user?.name}</h4>
                    <p className="text-sm text-gray-600">{selectedEmployee.user?.email}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <Badge className={getStatusColor(selectedEmployee.status)}>
                      {selectedEmployee.status}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Location Type:</span>
                    <span className="font-medium flex items-center gap-1">
                      {selectedEmployee.workLocationType === 'Home' ? (
                        <><Home className="w-3 h-3" /> Work From Home</>
                      ) : (
                        <><Building className="w-3 h-3" /> Office</>
                      )}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Check In:</span>
                    <span>{formatTime(selectedEmployee.startDayTime)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Address:</span>
                    <span className="text-right text-xs">
                      {selectedEmployee.location?.address || 'Unknown'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Distance from Office:</span>
                    <span className={calculateDistance(
                      officeLocation.lat,
                      officeLocation.lng,
                      selectedEmployee.location.latitude,
                      selectedEmployee.location.longitude
                    ) <= 500 ? 'text-green-600 font-medium' : 'text-orange-600'}>
                      {calculateDistance(
                        officeLocation.lat,
                        officeLocation.lng,
                        selectedEmployee.location.latitude,
                        selectedEmployee.location.longitude
                      ) <= 500 
                        ? `${calculateDistance(
                            officeLocation.lat,
                            officeLocation.lng,
                            selectedEmployee.location.latitude,
                            selectedEmployee.location.longitude
                          ).toFixed(0)}m (In office)`
                        : `${(calculateDistance(
                            officeLocation.lat,
                            officeLocation.lng,
                            selectedEmployee.location.latitude,
                            selectedEmployee.location.longitude
                          ) / 1000).toFixed(1)}km`
                      }
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Coordinates:</span>
                    <span className="text-xs text-gray-500">
                      {selectedEmployee.location.latitude.toFixed(4)}, {selectedEmployee.location.longitude.toFixed(4)}
                    </span>
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-3"
                  onClick={() => {
                    if (map && selectedEmployee.location) {
                      map.panTo({
                        lat: selectedEmployee.location.latitude,
                        lng: selectedEmployee.location.longitude
                      });
                      map.setZoom(16);
                      setInfoWindowOpen(selectedEmployee._id);
                    }
                  }}
                >
                  <Navigation className="w-3 h-3 mr-2" />
                  View on Map
                </Button>

                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full"
                  onClick={() => setSelectedEmployee(null)}
                >
                  Close Details
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveAttendanceMap;
