# 🌍 Travelator - AR Location History App

Discover the fascinating history of landmarks around you through augmented reality. Point your camera at historical sites and monuments to reveal their stories.

![Travelator](https://img.shields.io/badge/Status-Complete-brightgreen) ![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white) ![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white) ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

## ✨ Features

- **🗺️ Location-Based Discovery**: Automatically detects your location and finds nearby points of interest
- **📱 AR Camera View**: Uses your device camera to create an augmented reality experience
- **📍 Real-Time Positioning**: Device orientation tracking positions historical markers accurately in 3D space
- **📚 Rich Historical Content**: Detailed information and history for each landmark
- **🧭 Interactive Compass**: Shows your current heading and direction to landmarks
- **🎨 Sleek Modern UI**: Beautiful, responsive design that works on all devices
- **📊 Distance Calculation**: Shows accurate distances to nearby points of interest
- **🔄 Dynamic Updates**: Updates POI positions as you move

## 🚀 Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- HTTPS connection (required for camera and location access)
- Device with GPS and camera capabilities (mobile devices work best)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/travelator.git
cd travelator
```

2. Serve the app using any web server. For example, using Python:
```bash
# Python 3
python -m http.server 8000

# Or using Node.js http-server
npx http-server
```

3. Open your browser and navigate to:
```
http://localhost:8000
```

**Note**: For full functionality (camera and geolocation), you'll need to serve over HTTPS. You can use:
- [ngrok](https://ngrok.com/) to create an HTTPS tunnel
- Deploy to GitHub Pages, Netlify, or Vercel
- Use a local HTTPS server

## 📱 Usage

### Desktop Testing
While Travelator is designed for mobile devices, you can test it on desktop:
1. Open in Chrome/Firefox
2. Grant location and camera permissions
3. The app will simulate device orientation for testing

### Mobile Devices (Recommended)
1. Visit the app URL on your mobile device
2. Grant location permissions when prompted
3. Tap "Start Exploring"
4. Grant camera permissions
5. Point your camera around to see AR markers for nearby landmarks
6. Tap on markers or the bottom sheet to learn more about locations

## 🏗️ Architecture

### File Structure
```
travelator/
├── index.html          # Main HTML structure
├── styles.css          # Modern, responsive styling
├── app.js              # Core application logic
└── README.md           # Documentation
```

### Core Components

#### 1. **Geolocation Service** (app.js:51-105)
- Uses browser's Geolocation API
- Tracks user position in real-time
- Calculates distances to POIs using Haversine formula

#### 2. **Camera & AR System** (app.js:379-441)
- Accesses device camera via MediaDevices API
- Creates AR canvas overlay
- Positions markers based on bearing and distance

#### 3. **Device Orientation** (app.js:443-464)
- Tracks device compass heading (alpha)
- Monitors device tilt (beta, gamma)
- Updates AR markers in real-time

#### 4. **POI Database** (app.js:57-146)
Contains historical landmarks including:
- Eiffel Tower
- Statue of Liberty
- Colosseum
- Big Ben
- Taj Mahal
- Great Wall of China
- Sydney Opera House
- Christ the Redeemer
- Pyramids of Giza
- Machu Picchu
- Dynamic local POIs based on user location

## 🔧 Technical Details

### APIs Used
- **Geolocation API**: Real-time location tracking
- **MediaDevices API**: Camera access for AR view
- **DeviceOrientation API**: Compass and orientation data
- **Canvas API**: AR overlay rendering

### Calculations

#### Distance Calculation (Haversine Formula)
```javascript
const R = 6371; // Earth's radius in km
const dLat = toRad(lat2 - lat1);
const dLon = toRad(lon2 - lon1);
const a = sin(dLat/2) * sin(dLat/2) +
          cos(toRad(lat1)) * cos(toRad(lat2)) *
          sin(dLon/2) * sin(dLon/2);
const c = 2 * atan2(sqrt(a), sqrt(1-a));
const distance = R * c;
```

#### Bearing Calculation
```javascript
const dLon = toRad(lon2 - lon1);
const y = sin(dLon) * cos(toRad(lat2));
const x = cos(toRad(lat1)) * sin(toRad(lat2)) -
          sin(toRad(lat1)) * cos(toRad(lat2)) * cos(dLon);
const bearing = atan2(y, x);
```

## 🎨 Design Features

- **Dark Mode Theme**: Easy on the eyes with gradient backgrounds
- **Glass Morphism**: Modern frosted glass effects on UI elements
- **Smooth Animations**: Fluid transitions and micro-interactions
- **Responsive Layout**: Adapts to all screen sizes
- **Accessibility**: High contrast, clear typography

## 🔐 Permissions Required

- **Location**: To find nearby points of interest
- **Camera**: For AR view and landmark detection
- **Device Orientation** (iOS 13+): For accurate AR positioning

## 🌐 Browser Compatibility

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 90+ | ✅ Full |
| Firefox | 88+ | ✅ Full |
| Safari | 14+ | ✅ Full* |
| Edge | 90+ | ✅ Full |

*Safari requires user interaction to grant DeviceOrientation permissions

## 🚧 Extending the App

### Adding New POIs

Add new locations to the `poiDatabase` array in `app.js`:

```javascript
{
    id: 11,
    name: "Your Landmark",
    type: "Monument",
    lat: 40.7128,
    lon: -74.0060,
    description: "Short description",
    history: "Detailed historical information...",
    image: "https://example.com/image.jpg"
}
```

### Integrating External APIs

Replace the static POI database with API calls:

```javascript
async findNearbyPOIs() {
    const response = await fetch(
        `https://api.example.com/pois?lat=${this.userLocation.lat}&lon=${this.userLocation.lon}`
    );
    const data = await response.json();
    this.nearbyPOIs = data.pois;
}
```

### Recommended APIs
- **Wikipedia API**: Historical information
- **OpenStreetMap/Overpass API**: POI data
- **Google Places API**: Detailed location info
- **Foursquare API**: Venue information

## 📈 Future Enhancements

- [ ] 3D models of landmarks using Three.js
- [ ] Audio guides for historical sites
- [ ] User-generated content and reviews
- [ ] Offline mode with cached data
- [ ] Social sharing features
- [ ] Multi-language support
- [ ] Integration with tourism APIs
- [ ] AR navigation to landmarks
- [ ] Photo capture with AR overlays

## 🐛 Troubleshooting

### Camera Not Working
- Ensure you're using HTTPS
- Check browser permissions
- Try a different browser
- Ensure camera is not in use by another app

### Location Not Detected
- Enable location services in device settings
- Grant location permission to browser
- Check if GPS is enabled
- Try refreshing the page

### AR Markers Not Appearing
- Check if POIs are within range (5000km default)
- Ensure device orientation is working
- Try moving/rotating your device
- Check browser console for errors

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 👨‍💻 Author

Built with ❤️ for history and technology enthusiasts

## 🙏 Acknowledgments

- Unsplash for placeholder images
- Historical information from various sources
- Inspired by AR tourism and educational apps

---

**Happy Exploring! 🗺️✨**
