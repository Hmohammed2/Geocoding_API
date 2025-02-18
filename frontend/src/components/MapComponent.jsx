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

  // Function to fetch POIs from the backend.
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
        // Save POI results for later export
        setPoiData(response.data.results);

        // Clear any existing markers
        poiMarkersRef.current.forEach(marker => marker.setMap(null));
        poiMarkersRef.current = [];

        // Loop through each POI and add a marker to the map.
        response.data.results.forEach(poi => {
          if (poi.geometry && poi.geometry.location) {
            const { lat, lng } = poi.geometry.location;
            const marker = new window.google.maps.Marker({
              position: { lat, lng },
              map: mapInstanceRef.current,
              title: poi.name,
            });
            const infoWindow = new window.google.maps.InfoWindow({
              content: `
                  <div style="max-width:200px;">
                    <strong>${poi.name}</strong><br/>
                    ${poi.vicinity ? poi.vicinity : ''}<br/>
                    ${poi.rating ? 'Rating: ' + poi.rating : ''}
                  </div>
                `,
            });
            marker.addListener('click', () => {
              infoWindow.open(mapInstanceRef.current, marker);
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

  /**
   * Updates the map's center, circle, and re-fetches POIs. If the user has selected the
   * address option, the function geocodes the address to obtain lat/lng coordinates.
   *
   * @param {Event} e - The form submit event.
   */
  const updateMap = (e) => {
    e.preventDefault();
    const newRadius = parseFloat(radius);
    if (useAddress) {
      // Validate that an address has been entered
      if (!address) {
        showAlert('Please enter an address.', 'error');
        return;
      }
      // Geocode the address to get lat/lng coordinates
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
    // If you want to include other nested fields, add them here
  });

  // Function to export POI data as a CSV file.
  const exportCSV = () => {
    if (poiData.length === 0) {
      showAlert('No POI data available to export.', 'error');
      return;
    }

    // Flatten the data first:
    const flattenedData = poiData.map(flattenPOI);
    // Convert JSON data to CSV format.
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
    <>
      <h2 className="text-2xl font-bold mb-4">POI Analysis Map</h2>
      {/* Render alert component */}
      {alert && <Alert />}
      <form onSubmit={updateMap} className="mb-4 space-y-2">
        {/* Toggle for input type */}
        <div className="mb-2">
          <label className="mr-4">
            <input
              type="radio"
              value="latlong"
              checked={!useAddress}
              onChange={() => setUseAddress(false)}
              className="mr-1"
            />
            Lat/Long
          </label>
          <label className="mr-4">
            <input
              type="radio"
              value="address"
              checked={useAddress}
              onChange={() => setUseAddress(true)}
              className="mr-1"
            />
            Address
          </label>
        </div>
        {/* Render appropriate inputs based on selection */}
        {useAddress ? (
          <div className="mb-2">
            <label className="mr-2">Address:</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter address"
              className="border p-1 mr-4"
            />
          </div>
        ) : (
          <div className="mb-2">
            <label className="mr-2">Latitude:</label>
            <input
              type="number"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              step="0.0001"
              className="border p-1 mr-4"
            />
            <label className="mr-2">Longitude:</label>
            <input
              type="number"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              step="0.0001"
              className="border p-1 mr-4"
            />
          </div>
        )}
        <div className="mb-2">
          <label className="mr-2">Radius (meters):</label>
          <input
            type="number"
            value={radius}
            onChange={(e) => setRadius(e.target.value)}
            className="border p-1 mr-4"
          />
          <label className="mr-2">Business Category:</label>
          <input
            type="text"
            value={businessCategory}
            onChange={(e) => setBusinessCategory(e.target.value)}
            placeholder="e.g., restaurant"
            className="border p-1 mr-4"
          />
        </div>
        <div>
          <button
            type="submit"
            className="bg-blue-600 text-white p-2 rounded mr-4 shadow-md hover:bg-blue-700"
          >
            Update Map & Fetch POIs
          </button>
          <button
            type="button"
            onClick={exportCSV}
            className="bg-green-600 text-white p-2 rounded shadow-md hover:bg-green-700"
          >
            Export CSV
          </button>
        </div>
      </form>
      <div className="flex-1">
        <div ref={mapContainerRef} style={{ height: '500px', width: '100%' }} />
      </div>
      <div className="flex-1 p-4">
        {/* Render the analytics dashboard with the POI data */}
        <AnalyticsDashboard poiData={poiData} />
      </div>
    </>
  );
};

export default MapComponent;
