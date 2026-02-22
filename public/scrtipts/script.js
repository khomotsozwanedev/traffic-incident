const apiKey = "AIzaSyCSiUGk6BX3ObT2817-GUcAYvyDP2XN6kQ";
const mapId = "DEMO_MAP_ID";

let cars = []; 
let lights = [];
let mapInstance;
let AdvancedMarkerInstance;
let animationStarted = false;

// --- CLASSES ---

class TrafficLight {
    constructor(map, AdvancedMarkerElement, position) {
        this.states = ["GREEN", "AMBER", "RED"];
        this.currentIndex = 0;
        this.state = this.states[this.currentIndex];
        
        this.element = document.createElement("div");
        this.element.className = "traffic-light green";
        
        this.marker = new AdvancedMarkerElement({
            map: map,
            position: position,
            content: this.element,
        });

        this.startCycling();
    }

    startCycling() {
        const cycle = () => {
            this.currentIndex = (this.currentIndex + 1) % this.states.length;
            this.state = this.states[this.currentIndex];
            this.element.className = `traffic-light ${this.state.toLowerCase()}`;
            
            let nextTimeout = 4000; 
            if (this.state === "GREEN") nextTimeout = 2500; 
            if (this.state === "AMBER") nextTimeout = 2000; 
            
            this.timeout = setTimeout(cycle, nextTimeout);
        };
        this.timeout = setTimeout(cycle, 2500);
    }

    destroy() {
        clearTimeout(this.timeout);
        this.marker.map = null;
    }
}

class Car {
    constructor(map, AdvancedMarkerElement, path, emoji, speed, options = {}) {
        this.path = path;
        this.targetIndex = 1;
        this.pos = { ...path[0] };
        this.speed = speed; 
        this.isCrashed = false;
        this.isWaiting = options.isWaiting || false;
        this.triggerTarget = options.triggerTarget || null;
        this.ignoreAmber = options.ignoreAmber || false; 
        this.isCop = options.isCop || false;
        this.hasTriggered = false; // Prevents multiple chase triggers

        const container = document.createElement("div");
        container.className = "car-container";

        this.statusLabel = document.createElement("div");
        this.statusLabel.className = "car-status";
        this.statusLabel.innerText = this.isCop ? "🚨 OBSERVING" : "🚗 DRIVING";
        container.appendChild(this.statusLabel);

        this.emojiDiv = document.createElement("div");
        this.emojiDiv.style.fontSize = "32px";
        this.emojiDiv.innerText = emoji;
        container.appendChild(this.emojiDiv);
        
        this.marker = new AdvancedMarkerElement({
            map: map,
            position: this.pos,
            content: container,
        });
    }

    move(allCars, allLights) {
        if (this.isCrashed) return;

        // 1. UPDATED OFFICER LOGIC: Dependent ONLY on White Car distance
        if (this.isCop && this.isWaiting) {
            const distToTarget = this.getDistance(this.pos, this.triggerTarget.pos);
            
            // Trigger when the white car is close (approx. in the intersection)
            if (distToTarget < 0.0003 && !this.hasTriggered) {
                this.hasTriggered = true;
                // 100ms Reaction Delay
                setTimeout(() => {
                    this.isWaiting = false;
                    this.statusLabel.innerText = "📢 PULL OVER!";
                    this.statusLabel.style.color = "#e74c3c";
                }, 100);
            }
            return; 
        }

        // 2. WHITE CAR STATUS
        if (!this.isCop) {
            const currentLight = allLights[0];
            if (currentLight.state === "AMBER") {
                this.statusLabel.innerText = "⚠️ RUNNING AMBER";
            } else if (currentLight.state === "RED") {
                this.statusLabel.innerText = "❌ INFRINGEMENT";
            }
        }

        // 3. STOP LOGIC
        const nearLight = allLights.some(light => {
            const dist = this.getDistance(this.pos, light.marker.position);
            const stopThreshold = 0.00015;
            if (this.ignoreAmber) {
                return dist < stopThreshold && light.state === "RED";
            } else {
                return dist < stopThreshold && (light.state === "RED" || light.state === "AMBER");
            }
        });
        
        if (nearLight) return;

        // 4. WAYPOINT MOVEMENT logic
        const target = this.path[this.targetIndex];
        const dLat = target.lat - this.pos.lat;
        const dLng = target.lng - this.pos.lng;
        const distToWaypoint = Math.sqrt(dLat * dLat + dLng * dLng);

        if (distToWaypoint < 0.00003) {
            if (this.targetIndex < this.path.length - 1) {
                this.targetIndex++;
            } else {
                this.isCrashed = true; 
                this.statusLabel.innerText = "🏁 STOPPED";
            }
        } else {
            this.pos.lat += (dLat / distToWaypoint) * this.speed;
            this.pos.lng += (dLng / distToWaypoint) * this.speed;
            this.marker.position = this.pos;
            
            const angle = Math.atan2(dLng, dLat) * (180 / Math.PI);
            this.emojiDiv.style.transform = `rotate(${angle + 90}deg)`;
        }
    }

    getDistance(p1, p2) {
        return Math.sqrt(Math.pow(p1.lat - p2.lat, 2) + Math.pow(p1.lng - p2.lng, 2));
    }

    destroy() { this.marker.map = null; }
}

// --- ENGINE ---

function animate() {
    cars.forEach(car => car.move(cars, lights));
    requestAnimationFrame(animate);
}

async function initSimulation() {
    try {
        if (!window.google) await loadGMaps();
        const { Map } = await google.maps.importLibrary("maps");
        const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
        AdvancedMarkerInstance = AdvancedMarkerElement;

        if (!mapInstance) {
            mapInstance = new Map(document.getElementById("map"), {
                center: { lat: -33.8678, lng: 18.5438 },
                zoom: 19,
                mapId: mapId,
            });
        }

        const whiteCarRoute = [
            { lat : -33.866702, lng: 18.545305 },
            { lat : -33.867308, lng: 18.544500 },
            { lat : -33.867810, lng: 18.543804 }, 
            { lat : -33.869242, lng: 18.541825 },
        ];

        const copCarRoute = [
            { lat : -33.867881, lng: 18.543853 }, 
            { lat : -33.867859, lng: 18.543707 },
            { lat : -33.869214, lng: 18.541845 },
        ];

        lights.push(new TrafficLight(mapInstance, AdvancedMarkerInstance, { lat: -33.867810, lng: 18.543804 }));

        const whiteCar = new Car(mapInstance, AdvancedMarkerInstance, whiteCarRoute, "🏎️", 0.000011, {
            ignoreAmber: true 
        });

        const copCar = new Car(mapInstance, AdvancedMarkerInstance, copCarRoute, "🚓", 0.000028, {
            isWaiting: true,
            isCop: true,
            triggerTarget: whiteCar
        });

        cars.push(whiteCar, copCar);
        if (!animationStarted) { animate(); animationStarted = true; }
    } catch (e) { console.error(e); }
}

function loadGMaps() {
    return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=beta&libraries=marker`;
        script.async = true;
        document.head.appendChild(script);
        script.onload = resolve;
    });
}

window.restartSimulation = function() {
    cars.forEach(car => car.destroy());
    lights.forEach(light => light.destroy());
    cars = []; 
    lights = [];
    initSimulation();
};

initSimulation();