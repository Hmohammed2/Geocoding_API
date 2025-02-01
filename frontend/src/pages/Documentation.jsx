import React from "react";
import { Helmet } from "react-helmet-async";

const Documentation = () => {
  const endpoints = [
    {
      method: "POST",
      endpoint: "/geocode",
      description: "Get geolocation data for a specific address.",
      request: `
POST /geocode HTTP/1.1
Host: simplegeoapi.com
Content-Type: application/json
Headers: x-api-key <Your API Key>

{
  "address": "1600 Amphitheatre Parkway, Mountain View, CA"
}
      `,
      response: `
HTTP/1.1 200 OK
Content-Type: application/json

{
  "message": "Address found in external API",
  "address": "1600 Amphitheatre Parkway, Mountain View, CA 94043, USA",
  "latitude": 37.423021,
  "longitude": -122.083739
}
      `,
    },
    {
      method: "POST",
      endpoint: "/reverse-geocode",
      description: "Get the address for specific latitude and longitude coordinates.",
      request: `
  POST /reverse-geocode HTTP/1.1
  Host: simplegeoapi.com
  Content-Type: application/json
  Headers: x-api-key <Your API Key>
  
  {
    "lat": 37.423021,
    "lng": -122.083739
  }
        `,
      response: `
  HTTP/1.1 200 OK
  Content-Type: application/json
  
  {
  "message": "Coordinates fetched from external API",
    "address": "1600 Amphitheatre Parkway, Mountain View, CA 94043, USA"
  }
        `,
    },
    {
      method: "POST",
      endpoint: "/batch-geocode-json",
      description: "Get geolocation data for multiple addresses.",
      proOnly: true, // Mark this endpoint as Pro
      request: `
    POST /batch-geocode-json HTTP/1.1
    Host: simplegeoapi.com
    Headers: x-api-key <Your API Key>
    {"addresses": "1600 Amphitheatre Parkway, Mountain View, CA", "1 Infinite Loop, Cupertino, CA"}

          `,
      response: `
    HTTP/1.1 200 OK
    Content-Type: application/json

    {
        "message": "Batch geocoding completed successfully.",
      "results": [
      {
        "address": "1600 Amphitheatre Parkway, Mountain View, CA",
        "latitude": 37.423021,
        "longitude": -122.083739,
        "status": "cached"
      },
      {
        "address": "1 Infinite Loop, Cupertino, CA",
        "latitude": 37.33182,
        "longitude": -122.03118,
        "status": "cached"
      }
    ],
    "errors": []
        }
          `,
    },
  ];

  return (
    <>
      <Helmet>
        <title>SimpleGeoAPI Documentation</title>
        <meta
          name="description"
          content="Explore the SimpleGeoAPI documentation. Learn how to integrate geolocation into your applications with detailed API endpoints for geocoding and more."
        />
        <meta
          name="keywords"
          content="SimpleGeoAPI, geolocation API, geocoding, address to latitude, address to longitude, API documentation"
        />
        <meta property="og:title" content="SimpleGeoAPI Documentation" />
        <meta
          property="og:description"
          content="Explore the SimpleGeoAPI documentation. Learn how to integrate geolocation into your applications with detailed API endpoints for geocoding and more."
        />
        <meta
          property="og:image"
          content="https://simplegeoapi.com/assets/og-image.jpg" // Replace with your image URL
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://simplegeoapi.com/documentation" />
      </Helmet>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-6 px-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold">SimpleGeoAPI Documentation</h1>
            <p className="mt-2 text-lg">
              Explore the endpoints and start integrating geolocation into your applications.
            </p>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-12">
          <section className="mb-12">
            <h2 className="text-3xl font-semibold mb-4">API Overview</h2>
            <p className="text-lg">
              The SimpleGeoAPI provides fast and reliable geocoding services for your applications.
              With our endpoints, you can retrieve latitude and longitude for any address.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-semibold mb-4">Endpoints</h2>
            <div className="space-y-8">
              {endpoints.map((endpoint, index) => (
                <div
                  key={index}
                  className={`bg-white shadow rounded-lg p-6 border-l-4 relative ${endpoint.proOnly ? "border-yellow-500" : "border-green-500"
                    }`}
                >
                  <h3 className="text-2xl font-bold mb-2 flex items-center">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium mr-3 ${endpoint.method === "POST"
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                        }`}
                    >
                      {endpoint.method}
                    </span>
                    {endpoint.endpoint}
                    {endpoint.proOnly && (
                      <span className="ml-3 px-2 py-1 text-xs font-semibold bg-yellow-400 text-yellow-900 rounded-full">
                        Pro Edition
                      </span>
                    )}
                  </h3>
                  <p className="text-gray-700 mb-4">{endpoint.description}</p>
                  <div>
                    <h4 className="font-semibold text-lg mb-2">Request</h4>
                    <pre className="bg-gray-800 text-gray-200 rounded-md p-4 text-sm overflow-auto">
                      {endpoint.request}
                    </pre>
                  </div>
                  <div className="mt-4">
                    <h4 className="font-semibold text-lg mb-2">Response</h4>
                    <pre className="bg-gray-800 text-gray-200 rounded-md p-4 text-sm overflow-auto">
                      {endpoint.response}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </>
  );
};

export default Documentation;
