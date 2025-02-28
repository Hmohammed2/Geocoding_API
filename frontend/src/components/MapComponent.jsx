import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from './contexts/AuthContext';
import Papa from 'papaparse';
import Alert from './Alert';
import { useAlert } from './contexts/AlertContext';
import AnalyticsDashboard from './AnalyticsDashboard';

const MapComponent = () => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const circleRef = useRef(null);
  const poiMarkersRef = useRef([]);

  // State for map parameters and POI results
  const [lat, setLat] = useState(37.4220);
  const [lng, setLng] = useState(-122.0841);
  const [radius, setRadius] = useState(500);
  const [businessCategory, setBusinessCategory] = useState('restaurant');
  const [poiData, setPoiData] = useState([]);
  const [useAddress, setUseAddress] = useState(false);
  const [address, setAddress] = useState('');
  const { user } = useAuth();
  const { alert, showAlert } = useAlert();

  // Load the Google Maps API and initialize the map on mount.
  useEffect(() => {
    const googleApiKey = import.meta.env.VITE_GOOGLE_API_KEY;
    const loadScript = () => {
      if (!window.google) {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${googleApiKey}`;
        script.async = true;
        script.defer = true;
        script.onload = initMap;
        document.body.appendChild(script);
      } else {
        initMap();
      }
    };

    const initMap = () => {
      mapInstanceRef.current = new window.google.maps.Map(mapContainerRef.current, {
        center: { lat: parseFloat(lat), lng: parseFloat(lng) },
        zoom: 14,
      });
      circleRef.current = new window.google.maps.Circle({
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#FF0000',
        fillOpacity: 0.35,
        map: mapInstanceRef.current,
        center: { lat: parseFloat(lat), lng: parseFloat(lng) },
        radius: Number(radius),
      });
    };

    loadScript();
  }, []); // run once on mount

  const fetchPOIs = async (currentLat, currentLng, currentRadius, currentType) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/poi`,
        {
          lat: currentLat,
          lng: currentLng,
          radius: currentRadius,
          type: currentType,
        },
        {
          headers: {
            'x-api-key': user.apiKey,
          },
        }
      );
      if (response.data && response.data.results) {
        setPoiData(response.data.results);
        poiMarkersRef.current.forEach(marker => marker.setMap(null));
        poiMarkersRef.current = [];
        response.data.results.forEach(poi => {
          if (poi.geometry && poi.geometry.location) {
            const { lat, lng } = poi.geometry.location;
            const marker = new window.google.maps.Marker({
              position: { lat, lng },
              map: mapInstanceRef.current,
              title: poi.name,
            });

            const photoHtml = (poi.photos && poi.photos.length > 0)
              ? `<img src="https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${poi.photos[0].photo_reference}&key=${import.meta.env.VITE_GOOGLE_API_KEY}" style="width:100%; height:auto;" />`
              : '';

            const infoWindow = new window.google.maps.InfoWindow({
              content: `
                <div style="max-width:200px;">
                  ${photoHtml}
                  <strong>${poi.name}</strong><br/>
                  ${poi.vicinity ? poi.vicinity : ''}<br/>
                  ${poi.rating ? 'Rating: ' + poi.rating : ''}<br/>
                  <button 
                    id="get-directions-btn" 
                    data-lat="${lat}" 
                    data-lng="${lng}"
                    class="bg-blue-500 text-white py-2 px-4 rounded mt-2 hover:bg-blue-600 transition duration-300"
                  >
                    Get Directions
                  </button>
                </div>
              `,
            });
            marker.addListener('click', () => {
              infoWindow.open(mapInstanceRef.current, marker);
            });

            window.google.maps.event.addListener(infoWindow, 'domready', () => {
              const btn = document.getElementById('get-directions-btn');
              if (btn) {
                btn.addEventListener('click', () => {
                  getDirections(lat, lng);
                });
              }
            });
            poiMarkersRef.current.push(marker);
          }
        });
      }
    } catch (error) {
      showAlert('Error fetching POIs:', 'error');
      console.error('Error fetching POIs:', error);
    }
  };

  const getDirections = (destinationLat, destinationLng) => {
    if (!navigator.geolocation) {
      showAlert("Geolocation is not supported by this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(position => {
      const origin = { lat: position.coords.latitude, lng: position.coords.longitude };
      const destination = { lat: destinationLat, lng: destinationLng };

      const directionsService = new window.google.maps.DirectionsService();
      const directionsRenderer = new window.google.maps.DirectionsRenderer();
      directionsRenderer.setMap(mapInstanceRef.current);

      directionsService.route(
        {
          origin,
          destination,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            directionsRenderer.setDirections(result);
          } else {
            showAlert('Could not get directions: ' + status, 'error');
          }
        }
      );
    });
  };

  const updateMap = (e) => {
    e.preventDefault();
    const newRadius = parseFloat(radius);
    if (useAddress) {
      if (!address) {
        showAlert('Please enter an address.', 'error');
        return;
      }
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: address }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const location = results[0].geometry.location;
          const newLat = location.lat();
          const newLng = location.lng();
          setLat(newLat);
          setLng(newLng);
          const newCenter = { lat: newLat, lng: newLng };
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setCenter(newCenter);
            if (circleRef.current) {
              circleRef.current.setOptions({
                center: newCenter,
                radius: newRadius,
              });
            } else {
              circleRef.current = new window.google.maps.Circle({
                strokeColor: '#FF0000',
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: '#FF0000',
                fillOpacity: 0.35,
                map: mapInstanceRef.current,
                center: newCenter,
                radius: newRadius,
              });
            }
            fetchPOIs(newLat, newLng, newRadius, businessCategory);
          }
        } else {
          showAlert('Geocode was not successful: ' + status, 'error');
        }
      });
    } else {
      const newLat = parseFloat(lat);
      const newLng = parseFloat(lng);
      const newCenter = { lat: newLat, lng: newLng };

      if (mapInstanceRef.current) {
        mapInstanceRef.current.setCenter(newCenter);
        if (circleRef.current) {
          circleRef.current.setOptions({
            center: newCenter,
            radius: newRadius,
          });
        } else {
          circleRef.current = new window.google.maps.Circle({
            strokeColor: '#FF0000',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#FF0000',
            fillOpacity: 0.35,
            map: mapInstanceRef.current,
            center: newCenter,
            radius: newRadius,
          });
        }
        fetchPOIs(newLat, newLng, newRadius, businessCategory);
      }
    }
  };

  const flattenPOI = (poi) => ({
    name: poi.name || '',
    vicinity: poi.vicinity || '',
    rating: poi.rating || '',
    lat: poi.geometry?.location?.lat || '',
    lng: poi.geometry?.location?.lng || '',
    place_id: poi.place_id || '',
  });

  const exportCSV = () => {
    if (poiData.length === 0) {
      showAlert('No POI data available to export.', 'error');
      return;
    }

    const flattenedData = poiData.map(flattenPOI);
    const csv = Papa.unparse(flattenedData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'poi_results.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-8xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-semibold mb-6 text-center text-gray-800">POI Analysis Map</h2>
      {alert && <Alert />}
      <form onSubmit={updateMap} className="space-y-6">
        {/* Input Toggle for Lat/Long vs Address */}
        <div className="flex items-center space-x-4">
          <label className="text-gray-600">
            <input
              type="radio"
              value="latlong"
              checked={!useAddress}
              onChange={() => setUseAddress(false)}
              className="mr-2"
            />
            Lat/Long
          </label>
          <label className="text-gray-600">
            <input
              type="radio"
              value="address"
              checked={useAddress}
              onChange={() => setUseAddress(true)}
              className="mr-2"
            />
            Address
          </label>
        </div>

        {/* Conditionally Render Inputs */}
        {useAddress ? (
          <div>
            <label className="block text-gray-600">Address:</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter address"
              className="w-full border-2 border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ) : (
          <div className="flex space-x-4">
            <div className="w-1/2">
              <label className="block text-gray-600">Latitude:</label>
              <input
                type="number"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                step="0.0001"
                className="w-full border-2 border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="w-1/2">
              <label className="block text-gray-600">Longitude:</label>
              <input
                type="number"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                step="0.0001"
                className="w-full border-2 border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {/* Radius and Category Inputs */}
        <div className="flex items-center space-x-4">
          <div>
            <label className="block text-gray-600">Radius (meters):</label>
            <input
              type="number"
              value={radius}
              onChange={(e) => setRadius(e.target.value)}
              className="w-full border-2 border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-600">Business Category:</label>
            <input
              type="text"
              value={businessCategory}
              onChange={(e) => setBusinessCategory(e.target.value)}
              placeholder="e.g., restaurant"
              className="w-full border-2 border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col md:flex-row gap-3 md:space-x-4 w-full">
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition duration-300 w-full md:w-auto"
          >
            Update Map & Fetch POIs
          </button>
          <button
            type="button"
            onClick={exportCSV}
            className="bg-green-600 text-white py-2 px-6 rounded-md hover:bg-green-700 transition duration-300 w-full md:w-auto"
          >
            Export CSV
          </button>
        </div>
      </form >
      {/* Flex container for Sidebar and Map */}
      < div className="mt-6 flex flex-col md:flex-row" >
        {/* Mobile Sidebar: horizontal bar */}
        <div className="block md:hidden w-full bg-blue-600 text-white p-2 flex flex-row justify-between items-center text-sm overflow-x-auto">
          <span className="whitespace-nowrap">📌 POIs: {poiData.length}</span>
          <span className="whitespace-nowrap">📂 Category: {businessCategory}</span>
          <span className="whitespace-nowrap">📍 Radius: {radius}m</span>
        </div>

        {/* Desktop Sidebar: vertical bar on the left */}
        < div className="hidden md:flex flex-col w-64 bg-blue-600 text-white p-4 rounded-l-lg" >
          <ul className="mt-4">
            <li>Total POIs: {poiData.length}</li>
            <li>Current Category: {businessCategory}</li>
            <li>Radius: {radius}m</li>
          </ul>
        </div >

        {/* Map Container */}
        < div className="flex-1" >
          <div
            ref={mapContainerRef}
            style={{ height: '500px', width: '100%' }}
            className="rounded-lg border"
          ></div>
        </div >
      </div >
      <div className="mt-6">
        <AnalyticsDashboard poiData={poiData} />
      </div>
    </div >
  );
};

export default MapComponent;
