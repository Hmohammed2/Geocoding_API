import React, { useRef, useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "./contexts/AuthContext";

// Function to convert an array of objects to CSV format
const convertToCSV = (data) => {
    const headers = ["Price", "Type", "Bedrooms", "Latitude", "Longitude", "Portal"];
    const rows = data.map(property => [
        property.price,
        property.type,
        property.bedrooms,
        property.lat,
        property.lng,
        property.portal,
    ]);

    // Add headers to the CSV data
    const csvData = [headers, ...rows];

    // Convert array to CSV string
    return csvData.map(row => row.join(",")).join("\n");
};

// Function to trigger download of CSV file
const downloadCSV = (data) => {
    const csvContent = convertToCSV(data);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const currentDate = new Date().toLocaleDateString().replace(/\//g, "-");
    const fileName = `property_data_${currentDate}.csv`;

    if (navigator.msSaveBlob) { // IE 10+
        navigator.msSaveBlob(blob, fileName);
    } else {
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        link.click();
    }
};

const PropertyMap = ({ postcode, bedrooms, radius, priceRange }) => {
    const mapContainerRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersRef = useRef([]);
    const [properties, setProperties] = useState([]);
    const { user } = useAuth()

    // Load Google Maps API
    const loadGoogleMaps = () => {
        const googleApiKey = import.meta.env.VITE_GOOGLE_API_KEY;

        if (!window.google) {
            const script = document.createElement("script");
            script.src = `https://maps.googleapis.com/maps/api/js?key=${googleApiKey}`;
            script.async = true;
            script.defer = true;
            script.onload = initMap;
            document.body.appendChild(script);
        } else {
            initMap();
        }
    };

    // Initialize the map
    const initMap = () => {
        mapInstanceRef.current = new window.google.maps.Map(mapContainerRef.current, {
            center: { lat: 51.5074, lng: -0.1278 }, // Default location
            zoom: 14,
        });
    };

    // Place markers on the map
    const placeMarkers = (propertyList) => {
        if (!mapInstanceRef.current) return;

        markersRef.current.forEach(marker => marker.setMap(null)); // Remove old markers
        markersRef.current = [];

        propertyList.forEach(property => {
            const marker = new window.google.maps.Marker({
                position: { lat: parseFloat(property.lat), lng: parseFloat(property.lng) },
                map: mapInstanceRef.current,
                title: `£${property.price.toLocaleString()}`,
            });

            const infoWindow = new window.google.maps.InfoWindow({
                content: `
          <div class="text-sm">
            <h4 class="font-semibold">£${property.price.toLocaleString()}</h4>
            <p>Type: ${property.type}</p>
            <p>Bedrooms: ${property.bedrooms}</p>
            <p><a href="https://${property.portal}" target="_blank" class="text-blue-500">View on ${property.portal}</a></p>
          </div>
        `,
            });

            marker.addListener("click", () => {
                infoWindow.open(mapInstanceRef.current, marker);
            });

            markersRef.current.push(marker);
        });

        // Center the map on the first property (if available)
        if (propertyList.length > 0) {
            const firstProperty = propertyList[0];
            mapInstanceRef.current.setCenter({
                lat: parseFloat(firstProperty.lat),
                lng: parseFloat(firstProperty.lng),
            });
        }

        // Adjust map bounds to fit all markers
        const bounds = new window.google.maps.LatLngBounds();
        propertyList.forEach(property => {
            bounds.extend(new window.google.maps.LatLng(property.lat, property.lng));
        });
        mapInstanceRef.current.fitBounds(bounds);
    };

    const fetchPropertyData = async () => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/api/data/property-data/${postcode}/${bedrooms}/${radius}/${priceRange[0]}/${priceRange[1]}`,
                {
                    headers: {
                        'x-api-key': user.apiKey
                    }
                }
            );

            if (response.data.status === "success") {
                setProperties(response.data.data.raw_data);
                placeMarkers(response.data.data.raw_data);
            }
        } catch (error) {
            console.error("Error fetching property data:", error);
        }
    };

    useEffect(() => {
        loadGoogleMaps();
    }, []); // This effect runs once to load the Google Maps API

    return (
        <div className="space-y-4">
            <div className="flex space-x-4">
                <button
                    onClick={fetchPropertyData}
                    className="px-6 py-3 mt-4 text-lg font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                >
                    Update Property Data
                </button>
                <button
                    onClick={() => downloadCSV(properties)}
                    className="px-6 py-3 mt-4 text-lg font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                >
                    Export CSV
                </button>
            </div>
            <div
                ref={mapContainerRef}
                className="w-full h-96 rounded-lg shadow-md"
            ></div>
        </div>
    );
};

export default PropertyMap;
