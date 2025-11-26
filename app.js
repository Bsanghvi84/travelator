// Travelator - AR Location History App

class Travelator {
    constructor() {
        this.userLocation = null;
        this.heading = 0;
        this.deviceOrientation = { alpha: 0, beta: 0, gamma: 0 };
        this.cameraStream = null;
        this.nearbyPOIs = [];
        this.poisVisible = true;
        this.map = null;
        this.mapMarkers = [];
        this.userMarker = null;
        this.currentView = 'welcome'; // 'welcome', 'ar', 'map'
        this.selectedPOI = null;

        // UI Elements
        this.elements = {
            welcomeScreen: document.getElementById('welcome-screen'),
            arScreen: document.getElementById('ar-screen'),
            mapScreen: document.getElementById('map-screen'),
            startArBtn: document.getElementById('start-ar-btn'),
            startMapBtn: document.getElementById('start-map-btn'),
            closeArBtn: document.getElementById('close-ar-btn'),
            togglePoisBtn: document.getElementById('toggle-pois-btn'),
            toggleArBtn: document.getElementById('toggle-ar-btn'),
            toggleMapBtn: document.getElementById('toggle-map-btn'),
            cameraFeed: document.getElementById('camera-feed'),
            arCanvas: document.getElementById('ar-canvas'),
            arOverlays: document.getElementById('ar-overlays'),
            compass: document.getElementById('compass-needle'),
            compassHeading: document.getElementById('compass-heading'),
            locationDisplay: document.getElementById('location-display'),
            poiSheet: document.getElementById('poi-sheet'),
            poiList: document.getElementById('poi-list'),
            poiCount: document.getElementById('poi-count'),
            detailModal: document.getElementById('detail-modal'),
            detailContent: document.getElementById('detail-content'),
            closeModalBtn: document.getElementById('close-modal-btn'),
            navigateBtn: document.getElementById('navigate-btn'),
            loadingOverlay: document.getElementById('loading-overlay'),
            loadingText: document.getElementById('loading-text'),
            errorToast: document.getElementById('error-toast'),
            mapContainer: document.getElementById('map-container'),
            searchInput: document.getElementById('search-input'),
            searchResults: document.getElementById('search-results'),
            recenterBtn: document.getElementById('recenter-btn')
        };

        // No hardcoded POIs - we fetch real places from Google Places API
        this.poiDatabase = [];

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.requestLocationPermission();
    }

    setupEventListeners() {
        // Start buttons
        this.elements.startArBtn.addEventListener('click', () => this.startARExperience());
        this.elements.startMapBtn.addEventListener('click', () => this.startMapExperience());

        // Close AR button
        this.elements.closeArBtn.addEventListener('click', () => this.closeARExperience());

        // Toggle POIs
        this.elements.togglePoisBtn.addEventListener('click', () => this.togglePOIs());

        // View toggle buttons
        this.elements.toggleArBtn.addEventListener('click', () => this.switchToAR());
        this.elements.toggleMapBtn.addEventListener('click', () => this.switchToMap());

        // Recenter map button
        this.elements.recenterBtn.addEventListener('click', () => this.recenterMap());

        // Search input
        this.elements.searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        this.elements.searchInput.addEventListener('focus', () => {
            if (this.elements.searchInput.value) {
                this.handleSearch(this.elements.searchInput.value);
            }
        });

        // Click outside search results to close
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.map-search')) {
                this.elements.searchResults.classList.remove('active');
            }
        });

        // Bottom sheet interaction
        this.elements.poiSheet.addEventListener('click', (e) => {
            if (e.target.classList.contains('sheet-handle')) {
                this.elements.poiSheet.classList.toggle('expanded');
            }
        });

        // Close modal
        this.elements.closeModalBtn.addEventListener('click', () => this.closeModal());
        this.elements.detailModal.addEventListener('click', (e) => {
            if (e.target === this.elements.detailModal) {
                this.closeModal();
            }
        });

        // Navigate button
        this.elements.navigateBtn.addEventListener('click', () => this.navigateToPOI());
    }

    async requestLocationPermission() {
        if (!navigator.geolocation) {
            this.showError('Geolocation is not supported by your browser');
            return;
        }

        this.showLoading('Getting your location...');

        navigator.geolocation.getCurrentPosition(
            (position) => {
                this.userLocation = {
                    lat: position.coords.latitude,
                    lon: position.coords.longitude
                };
                this.updateLocationDisplay();
                this.findNearbyPOIs();
                this.hideLoading();
            },
            (error) => {
                this.hideLoading();
                let errorMsg = 'Unable to get your location';
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMsg = 'Location permission denied. Please enable location services.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMsg = 'Location information unavailable';
                        break;
                    case error.TIMEOUT:
                        errorMsg = 'Location request timed out';
                        break;
                }
                this.showError(errorMsg);
                // Use a default location for demo purposes
                this.userLocation = { lat: 40.7128, lon: -74.0060 }; // New York
                this.updateLocationDisplay();
                this.findNearbyPOIs();
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );

        // Watch position for updates
        navigator.geolocation.watchPosition(
            (position) => {
                this.userLocation = {
                    lat: position.coords.latitude,
                    lon: position.coords.longitude
                };
                this.updateLocationDisplay();
                this.updatePOIPositions();
            },
            null,
            { enableHighAccuracy: true, maximumAge: 30000 }
        );
    }

    updateLocationDisplay() {
        if (this.userLocation) {
            this.elements.locationDisplay.textContent =
                `📍 ${this.userLocation.lat.toFixed(4)}, ${this.userLocation.lon.toFixed(4)}`;
        }
    }

    async findNearbyPOIs() {
        if (!this.userLocation) return;

        // Show loading
        this.showLoading('Finding nearby places...');

        try {
            // Fetch real nearby places from Google Places API
            const realPlaces = await this.fetchNearbyPlaces();

            // Use only real places from Google Places API
            this.nearbyPOIs = realPlaces.map(poi => {
                const distance = this.calculateDistance(
                    this.userLocation.lat,
                    this.userLocation.lon,
                    poi.lat,
                    poi.lon
                );

                return {
                    ...poi,
                    distance: distance,
                    bearing: this.calculateBearing(
                        this.userLocation.lat,
                        this.userLocation.lon,
                        poi.lat,
                        poi.lon
                    )
                };
            })
            .filter(poi => poi.distance < 100) // Within 100km for real places
            .sort((a, b) => a.distance - b.distance)
            .slice(0, 50); // Limit to 50 places

            this.updatePOIList();

            // Update map markers if map is initialized
            if (this.map) {
                this.updateMapMarkers();
            }
        } catch (error) {
            console.error('Error fetching nearby places:', error);
            this.showError('Could not load nearby places. Using default locations.');

            // Fallback to famous landmarks only
            this.nearbyPOIs = this.poiDatabase.filter(poi => poi.id < 100).map(poi => {
                const distance = this.calculateDistance(
                    this.userLocation.lat,
                    this.userLocation.lon,
                    poi.lat,
                    poi.lon
                );

                return {
                    ...poi,
                    distance: distance,
                    bearing: this.calculateBearing(
                        this.userLocation.lat,
                        this.userLocation.lon,
                        poi.lat,
                        poi.lon
                    )
                };
            }).sort((a, b) => a.distance - b.distance);

            this.updatePOIList();
        } finally {
            this.hideLoading();
        }
    }

    async fetchNearbyPlaces() {
        return new Promise((resolve, reject) => {
            // Create a temporary div for PlacesService
            const tempDiv = document.createElement('div');
            const service = new google.maps.places.PlacesService(tempDiv);

            const request = {
                location: new google.maps.LatLng(this.userLocation.lat, this.userLocation.lon),
                radius: 5000, // 5km radius
                type: ['tourist_attraction', 'museum', 'church', 'synagogue', 'mosque', 'hindu_temple',
                       'park', 'art_gallery', 'library', 'landmark', 'point_of_interest']
            };

            service.nearbySearch(request, (results, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    // Convert Google Places data to our POI format
                    const pois = results.map((place, index) => {
                        const photos = place.photos && place.photos.length > 0
                            ? place.photos[0].getUrl({ maxWidth: 800 })
                            : 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80';

                        const types = place.types || [];
                        let type = 'Point of Interest';
                        if (types.includes('tourist_attraction')) type = 'Tourist Attraction';
                        else if (types.includes('museum')) type = 'Museum';
                        else if (types.includes('church') || types.includes('place_of_worship')) type = 'Place of Worship';
                        else if (types.includes('park')) type = 'Park';
                        else if (types.includes('art_gallery')) type = 'Art Gallery';
                        else if (types.includes('library')) type = 'Library';
                        else if (types.includes('landmark')) type = 'Landmark';

                        return {
                            id: 1000 + index,
                            name: place.name,
                            type: type,
                            lat: place.geometry.location.lat(),
                            lon: place.geometry.location.lng(),
                            description: place.vicinity || place.formatted_address || `A ${type.toLowerCase()} in your area`,
                            history: `${place.name} is a notable ${type.toLowerCase()} in the area. ${place.rating ? `Rated ${place.rating}/5 by visitors.` : ''} Visit to explore and learn more.`,
                            image: photos,
                            rating: place.rating || null,
                            userRatingsTotal: place.user_ratings_total || null,
                            source: 'google_places'
                        };
                    });

                    resolve(pois);
                } else {
                    reject(new Error(`Places API error: ${status}`));
                }
            });
        });
    }

    formatType(type) {
        return type.split('_').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    calculateDistance(lat1, lon1, lat2, lon2) {
        // Haversine formula
        const R = 6371; // Earth's radius in km
        const dLat = this.toRad(lat2 - lat1);
        const dLon = this.toRad(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    calculateBearing(lat1, lon1, lat2, lon2) {
        const dLon = this.toRad(lon2 - lon1);
        const y = Math.sin(dLon) * Math.cos(this.toRad(lat2));
        const x = Math.cos(this.toRad(lat1)) * Math.sin(this.toRad(lat2)) -
                  Math.sin(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * Math.cos(dLon);
        let bearing = Math.atan2(y, x);
        bearing = this.toDeg(bearing);
        return (bearing + 360) % 360;
    }

    toRad(deg) {
        return deg * (Math.PI / 180);
    }

    toDeg(rad) {
        return rad * (180 / Math.PI);
    }

    formatDistance(km) {
        if (km < 1) {
            return `${Math.round(km * 1000)}m`;
        } else if (km < 10) {
            return `${km.toFixed(1)}km`;
        } else {
            return `${Math.round(km)}km`;
        }
    }

    updatePOIList() {
        this.elements.poiList.innerHTML = '';
        this.elements.poiCount.textContent = this.nearbyPOIs.length;

        this.nearbyPOIs.forEach(poi => {
            const item = document.createElement('div');
            item.className = 'poi-item';
            item.innerHTML = `
                <div class="poi-item-header">
                    <div>
                        <h4>${poi.name}</h4>
                        <div class="poi-item-type">${poi.type}</div>
                    </div>
                    <div class="poi-item-distance">${this.formatDistance(poi.distance)}</div>
                </div>
                <div class="poi-item-description">${poi.description}</div>
            `;
            item.addEventListener('click', () => this.showPOIDetail(poi));
            this.elements.poiList.appendChild(item);
        });
    }

    async startARExperience() {
        this.showLoading('Starting camera...');

        try {
            // Request camera permission
            this.cameraStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment',
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                }
            });

            this.elements.cameraFeed.srcObject = this.cameraStream;

            // Switch to AR screen
            this.elements.welcomeScreen.classList.remove('active');
            this.elements.arScreen.classList.add('active');
            this.currentView = 'ar';

            // Setup AR canvas
            this.setupARCanvas();

            // Request device orientation permission (iOS 13+)
            if (typeof DeviceOrientationEvent !== 'undefined' &&
                typeof DeviceOrientationEvent.requestPermission === 'function') {
                const permission = await DeviceOrientationEvent.requestPermission();
                if (permission === 'granted') {
                    this.startOrientationTracking();
                }
            } else {
                this.startOrientationTracking();
            }

            this.renderAROverlays();
            this.hideLoading();
        } catch (error) {
            this.hideLoading();
            console.error('Camera error:', error);
            this.showError('Unable to access camera. Please grant camera permissions.');
        }
    }

    setupARCanvas() {
        const canvas = this.elements.arCanvas;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    startOrientationTracking() {
        window.addEventListener('deviceorientation', (event) => {
            this.deviceOrientation = {
                alpha: event.alpha || 0,  // Compass direction
                beta: event.beta || 0,    // Front-to-back tilt
                gamma: event.gamma || 0   // Left-to-right tilt
            };

            this.heading = event.alpha || 0;
            this.updateCompass();
            this.updateAROverlays();
        });

        // Fallback: simulate orientation changes for desktop testing
        if (!window.DeviceOrientationEvent) {
            setInterval(() => {
                this.heading = (this.heading + 1) % 360;
                this.updateCompass();
                this.updateAROverlays();
            }, 100);
        }
    }

    updateCompass() {
        this.elements.compass.style.transform = `translate(-50%, -100%) rotate(${-this.heading}deg)`;
        this.elements.compassHeading.textContent = `${Math.round(this.heading)}°`;
    }

    renderAROverlays() {
        this.elements.arOverlays.innerHTML = '';

        if (!this.poisVisible) return;

        const viewWidth = window.innerWidth;
        const viewHeight = window.innerHeight;
        const fov = 60; // Field of view in degrees

        this.nearbyPOIs.forEach(poi => {
            // Calculate angle difference between heading and POI bearing
            let angleDiff = poi.bearing - this.heading;

            // Normalize angle to -180 to 180
            if (angleDiff > 180) angleDiff -= 360;
            if (angleDiff < -180) angleDiff += 360;

            // Only show POIs within field of view
            if (Math.abs(angleDiff) > fov / 2) return;

            // Calculate position on screen
            const x = (angleDiff / fov) * viewWidth + viewWidth / 2;

            // Adjust Y based on distance (closer = lower on screen)
            const distanceFactor = Math.max(0, Math.min(1, poi.distance / 100));
            const y = viewHeight * 0.5 + (distanceFactor * viewHeight * 0.2);

            const marker = document.createElement('div');
            marker.className = 'ar-marker';
            marker.style.left = `${x}px`;
            marker.style.top = `${y}px`;
            marker.innerHTML = `
                <div class="marker-pin"></div>
                <div class="marker-label">
                    ${poi.name}
                    <span class="marker-distance">${this.formatDistance(poi.distance)}</span>
                </div>
            `;
            marker.addEventListener('click', () => this.showPOIDetail(poi));
            this.elements.arOverlays.appendChild(marker);
        });
    }

    updateAROverlays() {
        this.renderAROverlays();
    }

    updatePOIPositions() {
        // Recalculate bearings and distances when user moves
        this.nearbyPOIs.forEach(poi => {
            poi.bearing = this.calculateBearing(
                this.userLocation.lat,
                this.userLocation.lon,
                poi.lat,
                poi.lon
            );
            poi.distance = this.calculateDistance(
                this.userLocation.lat,
                this.userLocation.lon,
                poi.lat,
                poi.lon
            );
        });
        this.updatePOIList();
        this.updateAROverlays();
    }

    togglePOIs() {
        this.poisVisible = !this.poisVisible;
        this.elements.togglePoisBtn.innerHTML = this.poisVisible
            ? '<span>👁️</span> Toggle POIs'
            : '<span>🚫</span> Toggle POIs';
        this.renderAROverlays();
    }

    showPOIDetail(poi) {
        this.selectedPOI = poi; // Save for navigation

        document.getElementById('detail-image').src = poi.image;
        document.getElementById('detail-name').textContent = poi.name;
        document.getElementById('detail-distance').textContent = `📍 ${this.formatDistance(poi.distance)} away`;
        document.getElementById('detail-type').textContent = `🏛️ ${poi.type}`;
        document.getElementById('detail-description').textContent = poi.description;
        document.getElementById('detail-history').textContent = poi.history;

        this.elements.detailModal.classList.add('active');
    }

    closeModal() {
        this.elements.detailModal.classList.remove('active');
    }

    closeARExperience() {
        // Stop camera stream
        if (this.cameraStream) {
            this.cameraStream.getTracks().forEach(track => track.stop());
            this.cameraStream = null;
        }

        // Switch back to welcome screen
        this.elements.arScreen.classList.remove('active');
        this.elements.welcomeScreen.classList.add('active');
    }

    showLoading(text = 'Loading...') {
        this.elements.loadingText.textContent = text;
        this.elements.loadingOverlay.classList.add('active');
    }

    hideLoading() {
        this.elements.loadingOverlay.classList.remove('active');
    }

    showError(message) {
        this.elements.errorToast.textContent = message;
        this.elements.errorToast.classList.add('active');
        setTimeout(() => {
            this.elements.errorToast.classList.remove('active');
        }, 5000);
    }

    // Map functionality
    startMapExperience() {
        this.showLoading('Loading map...');

        // Switch to map screen
        this.elements.welcomeScreen.classList.remove('active');
        this.elements.mapScreen.classList.add('active');
        this.currentView = 'map';

        // Initialize map if not already initialized
        if (!this.map) {
            this.initMap();
        }

        this.hideLoading();
    }

    initMap() {
        // Default to New York if location not available yet
        const defaultLat = this.userLocation ? this.userLocation.lat : 40.7128;
        const defaultLon = this.userLocation ? this.userLocation.lon : -74.0060;

        // Initialize Leaflet map
        this.map = L.map('map-container', {
            zoomControl: true
        }).setView([defaultLat, defaultLon], 13);

        // Add tile layer (Google Maps)
        L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
            attribution: '© Google Maps',
            maxZoom: 20
        }).addTo(this.map);

        // Add user location marker
        if (this.userLocation) {
            const userIcon = L.divIcon({
                className: 'user-location-marker',
                html: '<div style="background: #6366f1; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 10px rgba(0,0,0,0.3);"></div>',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            });

            this.userMarker = L.marker([this.userLocation.lat, this.userLocation.lon], {
                icon: userIcon
            }).addTo(this.map);

            this.userMarker.bindPopup('<strong>📍 You are here</strong>').openPopup();
        }

        // Add POI markers
        this.updateMapMarkers();

        // Fix map rendering issue
        setTimeout(() => {
            this.map.invalidateSize();
        }, 100);
    }

    updateMapMarkers() {
        if (!this.map) return;

        // Clear existing markers
        this.mapMarkers.forEach(marker => this.map.removeLayer(marker));
        this.mapMarkers = [];

        // Add markers for each POI
        this.nearbyPOIs.forEach(poi => {
            const markerIcon = L.divIcon({
                className: 'custom-marker',
                html: `<div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); width: 30px; height: 30px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4); border: 2px solid white;">
                    <span style="transform: rotate(45deg); font-size: 16px;">📍</span>
                </div>`,
                iconSize: [30, 30],
                iconAnchor: [15, 30],
                popupAnchor: [0, -30]
            });

            const marker = L.marker([poi.lat, poi.lon], {
                icon: markerIcon
            }).addTo(this.map);

            // Create popup content
            const popupContent = `
                <div class="map-popup">
                    <div class="map-popup-title">${poi.name}</div>
                    <div class="map-popup-meta">
                        <span>📍 ${this.formatDistance(poi.distance)}</span>
                        <span>🏛️ ${poi.type}</span>
                    </div>
                    <div class="map-popup-description">${poi.description}</div>
                    <div class="map-popup-actions">
                        <button class="btn-popup-primary" onclick="app.showPOIDetailFromMap(${poi.id})">
                            📖 Learn More
                        </button>
                        <button class="btn-popup-secondary" onclick="app.navigateToPOIById(${poi.id})">
                            🧭 Navigate
                        </button>
                    </div>
                </div>
            `;

            marker.bindPopup(popupContent, {
                maxWidth: 300,
                className: 'custom-popup'
            });

            this.mapMarkers.push(marker);
        });
    }

    showPOIDetailFromMap(poiId) {
        const poi = this.nearbyPOIs.find(p => p.id === poiId);
        if (poi) {
            this.showPOIDetail(poi);
        }
    }

    navigateToPOIById(poiId) {
        const poi = this.nearbyPOIs.find(p => p.id === poiId);
        if (poi) {
            this.selectedPOI = poi;
            this.navigateToPOI();
        }
    }

    switchToAR() {
        if (this.currentView === 'ar') return;

        this.elements.mapScreen.classList.remove('active');
        this.startARExperience();
    }

    switchToMap() {
        if (this.currentView === 'map') return;

        // Stop camera if active
        if (this.cameraStream) {
            this.cameraStream.getTracks().forEach(track => track.stop());
            this.cameraStream = null;
        }

        this.elements.arScreen.classList.remove('active');
        this.elements.mapScreen.classList.add('active');
        this.currentView = 'map';

        // Initialize map if needed
        if (!this.map) {
            this.initMap();
        } else {
            this.map.invalidateSize();
            this.recenterMap();
        }
    }

    recenterMap() {
        if (!this.map || !this.userLocation) return;

        this.map.setView([this.userLocation.lat, this.userLocation.lon], 13);

        // Update user marker position
        if (this.userMarker) {
            this.userMarker.setLatLng([this.userLocation.lat, this.userLocation.lon]);
        }
    }

    handleSearch(query) {
        if (!query || query.trim().length < 2) {
            this.elements.searchResults.classList.remove('active');
            return;
        }

        const searchTerm = query.toLowerCase();
        const results = this.nearbyPOIs.filter(poi =>
            poi.name.toLowerCase().includes(searchTerm) ||
            poi.type.toLowerCase().includes(searchTerm) ||
            poi.description.toLowerCase().includes(searchTerm)
        ).slice(0, 5); // Limit to 5 results

        if (results.length === 0) {
            this.elements.searchResults.innerHTML = '<div class="search-result-item">No places found</div>';
            this.elements.searchResults.classList.add('active');
            return;
        }

        this.elements.searchResults.innerHTML = results.map(poi => `
            <div class="search-result-item" data-poi-id="${poi.id}">
                <div class="search-result-name">${poi.name}</div>
                <div class="search-result-meta">
                    <span>📍 ${this.formatDistance(poi.distance)}</span>
                    <span>🏛️ ${poi.type}</span>
                </div>
            </div>
        `).join('');

        // Add click handlers
        this.elements.searchResults.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', () => {
                const poiId = parseInt(item.dataset.poiId);
                const poi = this.nearbyPOIs.find(p => p.id === poiId);
                if (poi) {
                    // Zoom to POI on map
                    if (this.map) {
                        this.map.setView([poi.lat, poi.lon], 15);
                        // Find and open the marker popup
                        this.mapMarkers.forEach(marker => {
                            if (marker.getLatLng().lat === poi.lat && marker.getLatLng().lng === poi.lon) {
                                marker.openPopup();
                            }
                        });
                    }
                    this.elements.searchResults.classList.remove('active');
                    this.elements.searchInput.value = '';
                }
            });
        });

        this.elements.searchResults.classList.add('active');
    }

    navigateToPOI() {
        const poi = this.selectedPOI;
        if (!poi || !this.userLocation) {
            this.showError('Unable to get directions');
            return;
        }

        // Open Google Maps with directions
        const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${this.userLocation.lat},${this.userLocation.lon}&destination=${poi.lat},${poi.lon}&travelmode=walking`;

        window.open(googleMapsUrl, '_blank');
    }
}

// Initialize app when DOM is loaded
let app; // Global reference for popup callbacks
document.addEventListener('DOMContentLoaded', () => {
    app = new Travelator();
});
