import React from "react";

const Documentation = () => {
  const endpoints = [
    {
      method: "POST",
      endpoint: "/geocode",
      description: "Get geolocation data for a specific address.",
      request: `
POST /geocode HTTP/1.1
Host: api.simplegeoapi.com
Content-Type: application/json
Authorization: Bearer <your-token>

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
      method: "GET",
      endpoint: "/geocode/history",
      description: "Retrieve a list of previously geocoded addresses for your account.",
      request: `
GET /geocode/history HTTP/1.1
Host: api.simplegeoapi.com
Authorization: Bearer <your-token>
      `,
      response: `
HTTP/1.1 200 OK
Content-Type: application/json

[
  {
    "address": "1600 Amphitheatre Parkway, Mountain View, CA",
    "latitude": 37.423021,
    "longitude": -122.083739,
    "timestamp": "2025-01-06T12:34:56Z"
  },
  {
    "address": "1 Infinite Loop, Cupertino, CA",
    "latitude": 37.33182,
    "longitude": -122.03118,
    "timestamp": "2025-01-05T15:22:45Z"
  }
]
      `,
    },
    {
        method: "POST",
        endpoint: "/reverse-geocode",
        description: "Get the address for specific latitude and longitude coordinates.",
        request: `
  POST /reverse-geocode HTTP/1.1
  Host: api.simplegeoapi.com
  Content-Type: application/json
  Authorization: Bearer <your-token>
  
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
  ];

  return (
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
            With our endpoints, you can retrieve latitude and longitude for any address and access
            your geocoding history.
          </p>
        </section>

        <section>
          <h2 className="text-3xl font-semibold mb-4">Endpoints</h2>
          <div className="space-y-8">
            {endpoints.map((endpoint, index) => (
              <div
                key={index}
                className="bg-white shadow rounded-lg p-6 border-l-4"
                style={{
                  borderColor: endpoint.method === "POST" ? "#4ade80" : "#3b82f6",
                }}
              >
                <h3 className="text-2xl font-bold mb-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium mr-3 ${
                      endpoint.method === "POST"
                        ? "bg-green-100 text-green-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {endpoint.method}
                  </span>
                  {endpoint.endpoint}
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
  );
};

export default Documentation;
