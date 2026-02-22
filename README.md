# traffic-incident


## 🚦 Google Maps Traffic Pursuit Simulator

A real-time, browser-based traffic simulation using the Google Maps JavaScript API (Beta). This project recreates a specific traffic infringement scenario involving a "reckless" vehicle running an amber light and a police interceptor initiating a pursuit with human-like reaction timing.

### 🚀 Features
- Dynamic Traffic Light: A 3-stage state machine (Green, Amber, Red) with custom durations.

- Intelligent Path Following: Cars calculate vectors and rotation to follow specific geographic waypoints.

- Conditional AI Logic: * White Car: Programmed to "Run Amber" and ignore stop triggers during transition phases.

- Police Interceptor: Uses a proximity-based "tripwire" trigger with a 200ms reaction delay.

- Advanced Markers: Uses AdvancedMarkerElement for high-performance rendering of Emoji-based vehicles.

###  🛠️ Technical Stack
Frontend: HTML5, CSS3, Vanilla JavaScript (ES6+ Classes).

API: Google Maps JavaScript API (Beta).

Libraries: marker and maps libraries.

## 📖 Step-by-Step Implementation1. 

### The Environment Setup

We define the global scope for the map instance and the arrays to hold our simulation objects. We also include a loadGMaps helper function that returns a Promise to ensure the API is fully loaded before we try to spawn cars.

### 2. Class: TrafficLight

This class handles the visual representation and the state logic of the robot.Logic: It uses a recursive setTimeout loop to cycle through ['GREEN', 'AMBER', 'RED'].Visuals: It updates the CSS class of the marker's content to change the light color.

### 3. Class: Car

The heart of the simulation. Each car instance contains:Movement Engine: A move() method that runs 60 times per second via requestAnimationFrame.Vector Math: Uses $dLat$ and $dLng$ calculations to move toward waypoints.Trigger Logic: The Cop car specifically monitors the distance to the White car using the Pythagorean theorem:$$dist = \sqrt{(lat_2 - lat_1)^2 + (lng_2 - lng_1)^2}$$

### 4. The "Reaction" Trigger

Unlike standard AI, the officer is "asleep" until the white car enters its detection radius. Once triggered, we use a setTimeout of 200ms to simulate the time it takes for a human officer to see the crime, put the car in gear, and accelerate.


## 🔧 Installation & Setup

1. Clone the Repository:

```shell
git clone https://github.com/khomotsozwanedev/traffic-incident.git
```

2. Add your API Key:
Open script.js and replace the apiKey variable with your Google Cloud Console key:

```javascript
const apiKey = "YOUR_ACTUAL_API_KEY";
```

3. Run the Project:
Since this uses ES Modules/API calls, open the index.html via a local server (like VS Code "Live Server").


### 🎮 Controls

- Automatic: The simulation starts on page load.

- Restart Button: Click the "Restart Simulation" button to reset all markers to their original positions and reset the traffic light cycle.


## 🤖 Built with Gemini AI
This project was developed through an extensive collaborative process with Gemini AI. The model provided assistance in:

- Architecting the State-Driven Trigger System for the police pursuit.

- Implementing geographic vector math for waypoint movement.

- Debugging Google Maps API AdvancedMarkerElement integrations.

- Refining simulation timing to create a realistic "reaction delay" for the AI officer.


Gemini said
To ensure your project is properly documented and legally sound, here are the updated sections for your README.md. I have included the specific attribution for the Gemini AI model and integrated the GNU GPL v3 license details as requested.

🤖 Built with Gemini AI
This project was developed through an extensive collaborative process with Gemini AI. The model provided assistance in:

Architecting the State-Driven Trigger System for the police pursuit.

Implementing geographic vector math for waypoint movement.

Debugging Google Maps API AdvancedMarkerElement integrations.

Refining simulation timing to create a realistic "reaction delay" for the AI officer.

## ⚖️ License
This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

Why GPL v3?
By using the GNU GPL v3, this project guarantees:

- Freedom: Users are free to run, study, share, and change the software.

- Copyleft: Any modified versions you distribute must also be licensed under the GPL v3, ensuring the code remains open-source for the community forever.

- Patent Protection: It includes an express grant of patent rights from contributors.


## 🤝 Contributing
Contributions make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are greatly appreciated.

How to contribute:
1. Fork the Project.
2. Create your Feature Branch (git checkout -b feature/AmazingFeature).
3. Commit your Changes (git commit -m 'Add some AmazingFeature').
4. Push to the Branch (git push origin feature/AmazingFeature).
5. Open a Pull Request.

### Areas for Contribution:
- Audio: Integration of a siren .mp3 that triggers when the Cop Car starts moving.

- UI/UX: Adding a dashboard to show the current speed of both vehicles in km/h.

- Environment: Adding more "static" traffic or parked cars to the map for more realism.

