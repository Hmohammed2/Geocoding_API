# SimpleGeoAPI

SimpleGeoAPI is a fast, reliable, and easy-to-use geocoding and reverse geocoding API. It provides precise location data, enabling developers to integrate geolocation functionality into their applications with minimal effort.

---

## Features

- **Geocoding**: Convert addresses into geographic coordinates (latitude and longitude).  
- **Reverse Geocoding**: Convert geographic coordinates into human-readable addresses.  
- **Caching**: Results are cached to optimize performance and minimize external API calls.  
- **Secure Access**: Only paying customers can access commercial features and higher request limits.

---

## Endpoints

### 1. **POST** `/geocode`
Converts an address into geographic coordinates.  

**Request**:  
```json
{
  "address": "1600 Amphitheatre Parkway, Mountain View, CA"
}
```
**Response**:
```json
{
  "message": "Address found",
  "address": "1600 Amphitheatre Pkwy, Mountain View, CA 94043, USA",
  "latitude": 37.4223096,
  "longitude": -122.0846244
}
```
### 2. **POST** /reverse-geocode
Converts geographic coordinates into a human-readable address. 

**Request**:
```json
{
  "lat": 37.4223096,
  "lng": -122.0846244
}
```
**Response**:
```json
{
  "message": "Coordinates fetched",
  "address": "1600 Amphitheatre Pkwy, Mountain View, CA 94043, USA"
}
```

Pricing and Licensing
SimpleGeoAPI operates under the Custom API License Version 1.0. Key highlights include:

Free Tier: Use the API for non-commercial purposes with limited features.
Commercial Use: Paid plans are required for revenue-generating applications or higher usage limits.
For more details, refer to the License section below.

License
Custom API License Version 1.0
By using the SimpleGeoAPI, you agree to the following:

Free Tier:

Access basic features with limited usage.
Only non-commercial applications are allowed.
Commercial Use:

Paid plans are required for commercial or revenue-generating applications.
Exceeding free tier limits or accessing advanced features requires a subscription.
Prohibitions:

No illegal or harmful use.
No sublicensing, resale, or modification of the API.
Termination:

Licensor reserves the right to terminate access for violations.
Disclaimer:

The API is provided "as is," with no guarantees of uninterrupted service or accuracy.
For a detailed view of the license, refer to the LICENSE file in this repository or contact us:

Email: harambee_developers@hotmail.com
Phone: +254 790 821 358
Contributing
Contributions are welcome! To contribute:

Fork the repository.
Create a feature branch.
Submit a pull request with a clear description of your changes.
Contact
For support or questions, reach out:

Email: harambee_developers@hotmail.com
Phone: +44 790 821 358
