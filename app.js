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

        // Historical POI database (expandable with real API)
        this.poiDatabase = [
            {
                id: 1,
                name: "Eiffel Tower",
                type: "Monument",
                lat: 48.8584,
                lon: 2.2945,
                description: "Iconic iron lattice tower on the Champ de Mars",
                history: "Built in 1889 for the World's Fair, the Eiffel Tower was designed by Gustave Eiffel. Initially criticized by Paris's leading artists and intellectuals, it has become a global cultural icon of France and one of the most recognizable structures in the world. Standing at 330 meters tall, it was the world's tallest man-made structure until 1930.",
                image: "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=800&q=80"
            },
            {
                id: 2,
                name: "Statue of Liberty",
                type: "Monument",
                lat: 40.6892,
                lon: -74.0445,
                description: "Colossal neoclassical sculpture on Liberty Island",
                history: "A gift from France to the United States, the Statue of Liberty was dedicated on October 28, 1886. Designed by French sculptor Frédéric Auguste Bartholdi, the statue's metal framework was built by Gustave Eiffel. Lady Liberty has welcomed millions of immigrants arriving by sea and has become a universal symbol of freedom and democracy.",
                image: "https://images.unsplash.com/photo-1569098644584-210bcd375b59?w=800&q=80"
            },
            {
                id: 3,
                name: "Colosseum",
                type: "Historical Site",
                lat: 41.8902,
                lon: 12.4922,
                description: "Ancient amphitheater in the center of Rome",
                history: "Built between 70-80 AD under the Flavian emperors, the Colosseum is the largest ancient amphitheater ever built. It could hold between 50,000 and 80,000 spectators and was used for gladiatorial contests, public spectacles, and dramas. Despite earthquakes and stone-robbers, it remains an iconic symbol of Imperial Rome and was listed as a UNESCO World Heritage Site in 1980.",
                image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80"
            },
            {
                id: 4,
                name: "Big Ben",
                type: "Monument",
                lat: 51.5007,
                lon: -0.1246,
                description: "Clock tower at the Palace of Westminster",
                history: "Completed in 1859, the Elizabeth Tower (commonly called Big Ben after its Great Bell) is one of London's most famous landmarks. The clock mechanism was designed by Edmund Beckett Denison and clockmaker Edward John Dent. The tower stands 316 feet tall and has become an enduring symbol of the United Kingdom and parliamentary democracy.",
                image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80"
            },
            {
                id: 5,
                name: "Taj Mahal",
                type: "Monument",
                lat: 27.1751,
                lon: 78.0421,
                description: "Ivory-white marble mausoleum in Agra",
                history: "Built between 1631 and 1648 by Mughal Emperor Shah Jahan in memory of his wife Mumtaz Mahal, the Taj Mahal is considered the finest example of Mughal architecture. It combines elements from Islamic, Persian, Ottoman Turkish, and Indian architectural styles. The monument attracts millions of visitors annually and was designated a UNESCO World Heritage Site in 1983.",
                image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&q=80"
            },
            {
                id: 6,
                name: "Great Wall of China",
                type: "Historical Site",
                lat: 40.4319,
                lon: 116.5704,
                description: "Ancient fortification across northern China",
                history: "Built over centuries from the 7th century BC to the 17th century AD, the Great Wall stretches over 13,000 miles. Originally built to protect Chinese states from nomadic invasions, it represents one of the most impressive architectural feats in history. The most well-preserved sections were built during the Ming Dynasty (1368-1644).",
                image: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800&q=80"
            },
            {
                id: 7,
                name: "Sydney Opera House",
                type: "Cultural Site",
                lat: -33.8568,
                lon: 151.2153,
                description: "Multi-venue performing arts center",
                history: "Designed by Danish architect Jørn Utzon and opened in 1973, the Sydney Opera House is one of the 20th century's most distinctive buildings. Its unique shell-shaped roof structure was revolutionary in architectural design. The building hosts over 1,500 performances annually and was made a UNESCO World Heritage Site in 2007.",
                image: "https://images.unsplash.com/photo-1523059623039-a9ed027e7fad?w=800&q=80"
            },
            {
                id: 8,
                name: "Christ the Redeemer",
                type: "Monument",
                lat: -22.9519,
                lon: -43.2105,
                description: "Art Deco statue of Jesus Christ in Rio de Janeiro",
                history: "Completed in 1931, this 98-foot-tall statue sits atop the 2,300-foot Corcovado mountain. Designed by French sculptor Paul Landowski and built by Brazilian engineer Heitor da Silva Costa, it has become an icon of Rio de Janeiro and Brazil. The statue is made of reinforced concrete and soapstone and was named one of the New Seven Wonders of the World in 2007.",
                image: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&q=80"
            },
            {
                id: 9,
                name: "Pyramids of Giza",
                type: "Historical Site",
                lat: 29.9792,
                lon: 31.1342,
                description: "Ancient pyramid complex including the Great Pyramid",
                history: "Built during the Fourth Dynasty (c. 2580-2560 BC), the Great Pyramid was constructed for Pharaoh Khufu. It remained the tallest man-made structure for over 3,800 years. The complex includes the pyramids of Khafre and Menkaure, along with the Great Sphinx. These monuments showcase the incredible engineering capabilities of ancient Egyptian civilization.",
                image: "https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=800&q=80"
            },
            {
                id: 10,
                name: "Machu Picchu",
                type: "Historical Site",
                lat: -13.1631,
                lon: -72.5450,
                description: "15th-century Inca citadel in the Andes Mountains",
                history: "Built around 1450 at the height of the Inca Empire, Machu Picchu was abandoned just over 100 years later during the Spanish Conquest. The site remained unknown to the outside world until American historian Hiram Bingham brought it to international attention in 1911. Its sophisticated dry-stone construction and astronomical alignments demonstrate advanced Incan engineering and astronomical knowledge.",
                image: "https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800&q=80"
            },
            // Add some generic local POIs that will be repositioned based on user location
            {
                id: 100,
                name: "Historic City Center",
                type: "Historical District",
                lat: 0, // Will be set dynamically
                lon: 0,
                description: "The heart of the city with centuries of history",
                history: "This area has been the center of community life for generations, featuring architecture from various historical periods and hosting countless significant events that shaped the local culture.",
                image: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80"
            },
            {
                id: 101,
                name: "Old Town Square",
                type: "Public Space",
                lat: 0,
                lon: 0,
                description: "Historic gathering place",
                history: "For centuries, this square has served as a meeting point for the community, witnessing markets, celebrations, and important civic gatherings throughout its long history.",
                image: "https://images.unsplash.com/photo-1519566236145-e5ac0c1c6745?w=800&q=80"
            },
            {
                id: 102,
                name: "Heritage Museum",
                type: "Museum",
                lat: 0,
                lon: 0,
                description: "Cultural heritage exhibition center",
                history: "Established to preserve and showcase the rich cultural heritage of the region, this museum houses artifacts and exhibits that tell the story of local history and traditions.",
                image: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=800&q=80"
            }
        ];

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
            // Fetch real nearby places from Overpass API
            const realPlaces = await this.fetchNearbyPlaces();

            // Combine famous landmarks with real nearby places
            const allPOIs = [...this.poiDatabase.filter(poi => poi.id < 100), ...realPlaces];

            // Calculate distances and filter POIs within reasonable range
            this.nearbyPOIs = allPOIs.map(poi => {
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
        const radius = 5000; // 5km radius
        const lat = this.userLocation.lat;
        const lon = this.userLocation.lon;

        // Overpass API query for various POI types
        const query = `
            [out:json][timeout:25];
            (
                node["tourism"~"attraction|museum|monument|viewpoint|artwork"](around:${radius},${lat},${lon});
                node["historic"~"monument|memorial|castle|ruins|archaeological_site"](around:${radius},${lat},${lon});
                node["amenity"~"theatre|cinema|library|community_centre|place_of_worship"](around:${radius},${lat},${lon});
                way["tourism"~"attraction|museum|monument|viewpoint|artwork"](around:${radius},${lat},${lon});
                way["historic"~"monument|memorial|castle|ruins|archaeological_site"](around:${radius},${lat},${lon});
                way["amenity"~"theatre|cinema|library|community_centre|place_of_worship"](around:${radius},${lat},${lon});
            );
            out center 100;
        `;

        const url = 'https://overpass-api.de/api/interpreter';

        const response = await fetch(url, {
            method: 'POST',
            body: query,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch places');
        }

        const data = await response.json();

        // Convert Overpass data to our POI format
        return data.elements.map((element, index) => {
            const poiLat = element.lat || element.center?.lat;
            const poiLon = element.lon || element.center?.lon;

            if (!poiLat || !poiLon) return null;

            const tags = element.tags || {};
            const name = tags.name || tags['name:en'] || 'Unnamed Place';

            // Determine type
            let type = 'Point of Interest';
            if (tags.tourism) type = this.formatType(tags.tourism);
            else if (tags.historic) type = this.formatType(tags.historic);
            else if (tags.amenity) type = this.formatType(tags.amenity);

            return {
                id: 1000 + index,
                name: name,
                type: type,
                lat: poiLat,
                lon: poiLon,
                description: tags.description || `A ${type.toLowerCase()} in your area`,
                history: tags['description:history'] || tags.wikipedia ||
                        `${name} is a local ${type.toLowerCase()}. Visit to learn more about its history and significance.`,
                image: tags.image || tags['image:url'] || 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80',
                source: 'openstreetmap'
            };
        }).filter(poi => poi !== null);
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

        // Add tile layer (OpenStreetMap)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
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
