// Common data shared across the application

/**
 * Helper function to calculate ETA in minutes from time strings (e.g., "7:25 AM").
 * @param {string} currentTime - The start time.
 * @param {string} finalTime - The end time.
 * @returns {number} - The difference in minutes.
 */
const calculateETA = (currentTime, finalTime) => {
  const parseTime = (timeStr) => {
    const [time, period] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (period === 'PM' && hours !== 12) {
      hours += 12;
    }
    if (period === 'AM' && hours === 12) {
      hours = 0;
    }
    return hours * 60 + minutes;
  };
  const current = parseTime(currentTime);
  const final = parseTime(finalTime);
  return Math.max(0, final - current);
};

/**
 * Generates bus data from a structured route definition.
 * For each stop in a route, it creates a bus object representing the bus at that stop.
 * @param {Array} routes - An array of route definitions.
 * @returns {Array} - A flat array of bus objects.
 */
const generateBusData = (routes) => {
  const allBuses = [];
  routes.forEach(route => {
    const finalStop = route.stops[route.stops.length - 1];
    route.stops.forEach((stop, index) => {
      const nextStopInfo = route.stops[index + 1] || finalStop;
      const etaMinutes = calculateETA(stop.time, finalStop.time);

      allBuses.push({
        id: `${route.number}-${index + 1}`,
        number: route.number,
        route: route.number,
        currentStop: stop.pickup,
        nextStop: nextStopInfo.pickup,
        eta: `${etaMinutes} minutes`,
        etaMinutes: etaMinutes,
        status: 'ontime',
        delay: 0,
        lastUpdate: new Date().toLocaleString(),
        driver: `Driver for ${route.number}`,
        capacity: 40,
        occupancy: Math.floor(Math.random() * 35) + 5, // Random occupancy
      });
    });
  });
  return allBuses;
};

const busRoutesData = [
  { number: "VV-1", stops: [ { pickup: "Kankipadu", time: "7:25 AM" }, { pickup: "Gosala", time: "7:30 AM" }, { pickup: "Edupugallu", time: "7:32 AM" }, { pickup: "Penamaluru", time: "7:40 AM" }, { pickup: "Poranki", time: "7:45 AM" }, { pickup: "VIT -AP Campus", time: "8:45 AM" } ] },
  { number: "VV-2", stops: [ { pickup: "Poranki Center", time: "7:40 AM" }, { pickup: "Thumu Center", time: "7:43 AM" }, { pickup: "Tadigadapa", time: "7:45 AM" }, { pickup: "KCP Colony", time: "7:48 AM" }, { pickup: "VR Siddhartha", time: "7:50 AM" }, { pickup: "Bharath Pertol Pump", time: "7:52 AM" }, { pickup: "Kamayvathopu Centre", time: "7:55 AM" }, { pickup: "Time Hospital", time: "8:00 AM" }, { pickup: "VIT -AP Campus", time: "8:45 AM" } ] },
  { number: "VV-3", stops: [ { pickup: "Kamayatopu Center", time: "7:40 AM" }, { pickup: "Pappula Mill Center", time: "7:42 AM" }, { pickup: "Ashok Nagar", time: "7:45 AM" }, { pickup: "Time Hospital", time: "7:47 AM" }, { pickup: "Auto nagar Gate", time: "7:48 AM" }, { pickup: "Screw Bridge", time: "7:58 AM" }, { pickup: "VIT -AP Campus", time: "8:45 AM" } ] },
  { number: "VV-10", stops: [ { pickup: "Nunna Center", time: "7:30 AM" }, { pickup: "Sub Station", time: "7:40 AM" }, { pickup: "Kandika Pertol Pump", time: "7:45 AM" }, { pickup: "Payakapuram", time: "7:50 AM" }, { pickup: "Prakash Nagar", time: "7:52 AM" }, { pickup: "Pipula Road", time: "7:55 AM" }, { pickup: "Singh Nagar Sai Baba Temple", time: "7:58 AM" }, { pickup: "Dabakotlu Center", time: "8:00 AM" }, { pickup: "VIT -AP Campus", time: "8:45 AM" } ] },
  { number: "VV-11", stops: [ { pickup: "Budameru Vantena", time: "7:30 AM" }, { pickup: "Ayodhya Nagar", time: "7:32 AM" }, { pickup: "Lotus Land Mark", time: "7:35 AM" }, { pickup: "Prabhas College(Fruit Market)", time: "7:40 AM" }, { pickup: "MS Raja Rao Bridge", time: "7:45 AM" }, { pickup: "Sobhan Babu Circle", time: "7:50 AM" }, { pickup: "Challapalli Bunglaw", time: "7:55 AM" }, { pickup: "Bandar Lakulu", time: "7:58 AM" }, { pickup: "Varadhi", time: "8:00 AM" }, { pickup: "VIT -AP Campus", time: "8:45 AM" } ] },
  { number: "VV-12", stops: [ { pickup: "Meesal Raja Rao Bridge", time: "7:45 AM" }, { pickup: "Sarada College", time: "7:47 AM" }, { pickup: "Food Junction", time: "7:50 AM" }, { pickup: "Madhura Nagar Signal", time: "7:55 AM" }, { pickup: "Padavala Revu", time: "8:00 AM" }, { pickup: "VIT -AP Campus", time: "8:45 AM" } ] },
  { number: "VV-13", stops: [ { pickup: "ESI Hospital", time: "7:30 AM" }, { pickup: "Gunadala Bridge", time: "7:32 AM" }, { pickup: "Gunadala Center", time: "7:33 AM" }, { pickup: "Padavala Revu", time: "7:35 AM" }, { pickup: "Machavaram", time: "7:37 AM" }, { pickup: "SRR College", time: "7:40 AM" }, { pickup: "BSNL", time: "7:50 AM" }, { pickup: "Sitarampuram Signal", time: "7:52 AM" }, { pickup: "Vijaya Talkies", time: "7:53 AM" }, { pickup: "Apsara Theater", time: "7:55 AM" }, { pickup: "Challapalli Bunglow", time: "7:58 AM" }, { pickup: "Bandar Lakulu", time: "8:00 AM" }, { pickup: "Varadhi", time: "8:05 AM" }, { pickup: "VIT -AP Campus", time: "8:45 AM" } ] },
  { number: "VV-14", stops: [ { pickup: "Kondapalli (vtps colony)", time: "7:00 AM" }, { pickup: "Ibrahimpatnam", time: "7:30 AM" }, { pickup: "Kazipet", time: "7:40 AM" }, { pickup: "Guntupalli", time: "7:42 AM" }, { pickup: "VIT-AP Campus", time: "8:45 AM" } ] },
  { number: "VV-15", stops: [ { pickup: "Guntupalli", time: "7:40 AM" }, { pickup: "Rayanapadu X Road", time: "7:42 AM" }, { pickup: "Gollapudi One Center", time: "7:45 AM" }, { pickup: "Y Junction", time: "7:48 AM" }, { pickup: "Andhra Hospitals", time: "7:50 AM" }, { pickup: "Swathi Center", time: "7:53 AM" }, { pickup: "Kanakadurgamma Flyover", time: "7:55 AM" }, { pickup: "Trisakthi geetam", time: "8:00 AM" }, { pickup: "Fire Station -Bus Stop", time: "8:05 AM" }, { pickup: "Varadhi", time: "8:08 AM" }, { pickup: "VIT-AP Campus", time: "8:45 AM" } ] },
  { number: "VV-16", stops: [ { pickup: "Bhavanipuram Sivalayam", time: "7:15 AM" }, { pickup: "Trends", time: "7:18 AM" }, { pickup: "Bhavanipuram Church", time: "7:20 AM" }, { pickup: "Sitara", time: "7:23 AM" }, { pickup: "Kabela", time: "7:25 AM" }, { pickup: "Milk Project", time: "7:27 AM" }, { pickup: "Sai Ram Theater", time: "7:30 AM" }, { pickup: "Chittinagar", time: "7:32 AM" }, { pickup: "Vagu Center", time: "7:35 AM" }, { pickup: "KBN College", time: "7:37 AM" }, { pickup: "Panja Center", time: "7:40 AM" }, { pickup: "KR Market", time: "7:43 AM" }, { pickup: "Govt. Hospital - Near Railway", time: "7:45 AM" }, { pickup: "VIT-AP Campus", time: "8:45 AM" } ] },
  { number: "VV-17", stops: [ { pickup: "Andhra Hospitals", time: "7:50 AM" }, { pickup: "Swathi Center", time: "7:53 AM" }, { pickup: "Kanakadurga Flyover", time: "7:55 AM" }, { pickup: "Krishnalanka Katta", time: "8:00 AM" }, { pickup: "Fire Station -Bus Stop", time: "8:05 AM" }, { pickup: "Varadhi", time: "8:08 AM" }, { pickup: "VIT-AP Campus", time: "8:45 AM" } ] },
  { number: "VV-18", stops: [ { pickup: "Auto Nagar Association Hall", time: "7:30 AM" }, { pickup: "Gurunank colony", time: "7:32 AM" }, { pickup: "Ramesh hospital", time: "7:35 AM" }, { pickup: "ITI College", time: "7:37 AM" }, { pickup: "Amma Kalyana Mandapam", time: "7:40 AM" }, { pickup: "Jammi Chettu Centre", time: "7:45 AM" }, { pickup: "Sridartha Arts & Sciences", time: "7:50 AM" }, { pickup: "Commisioner office", time: "7:55 AM" }, { pickup: "Raghavaiah Park", time: "8:00 AM" }, { pickup: "Varadhi", time: "8:10 AM" }, { pickup: "VIT-AP", time: "8:45 AM" } ] },
  { number: "VV-19", stops: [ { pickup: "Gurunank colony", time: "7:30 AM" }, { pickup: "Ramesh hospital", time: "7:35 AM" }, { pickup: "ITI College", time: "7:37 AM" }, { pickup: "Amma Kalyana Mandapam", time: "7:40 AM" }, { pickup: "Jammi Chettu Centre", time: "7:45 AM" }, { pickup: "Sridartha Arts & Sciences", time: "7:50 AM" }, { pickup: "Commisioner office", time: "7:55 AM" }, { pickup: "Raghavaiah Park", time: "8:00 AM" }, { pickup: "Varadhi", time: "8:10 AM" }, { pickup: "VIT-AP", time: "8:45 AM" } ] },
  { number: "VV-20", stops: [ { pickup: "Varadhi", time: "7:50 AM" }, { pickup: "Manipal", time: "7:52 AM" }, { pickup: "Ushodaya Mart", time: "7:55 AM" }, { pickup: "Praturu Road", time: "7:57 AM" }, { pickup: "Kunchinapalli Road", time: "8:00 AM" }, { pickup: "Kunchinapalli Sai Baba Temple", time: "8:01 AM" }, { pickup: "D-Mrat", time: "8:03 AM" }, { pickup: "Tadepalli Petrol Pump", time: "8:06 AM" }, { pickup: "Undavalli Centre", time: "8:15 AM" }, { pickup: "Penunmaka", time: "8:30 AM" }, { pickup: "VIT-AP Campus", time: "8:45 AM" } ] },
  { number: "VV-21", stops: [ { pickup: "Varadhi", time: "7:50 AM" }, { pickup: "Kunchinapalli", time: "7:55 AM" }, { pickup: "Tadepalli Petrol Bunk", time: "7:56 AM" }, { pickup: "Undavalli", time: "8:05 AM" }, { pickup: "Penunmaka", time: "8:10 AM" }, { pickup: "VIT-AP Campus", time: "8:45 AM" } ] },
  { number: "VV-22", stops: [ { pickup: "Tadepalli", time: "8:15 AM" }, { pickup: "Undavalli", time: "8:20 AM" }, { pickup: "Penunmaka", time: "8:30 AM" }, { pickup: "Mandadam", time: "8:40 AM" }, { pickup: "VIT-AP Campus", time: "8:45 AM" } ] },
];

const busData = generateBusData(busRoutesData);
// Expose for other dashboards
window.busData = busData;
window.busRoutesData = busRoutesData;

const stops = {
    'Main Gate': ['VIT-101', 'VIT-202', 'VIT-303'],
    'Library': ['VIT-303', 'VIT-404'],
    'Hostel Block A': ['VIT-101', 'VIT-202'],
    'Academic Block': ['VIT-303', 'VIT-404'],
    'Katpadi Junction': ['VIT-101', 'VIT-202'],
    'Gandhi Nagar': ['VIT-101'],
    'Arcot Road': ['VIT-202', 'VIT-303'],
    'Hosur': ['VIT-404'],
    'Electronics City': ['VIT-404']
};

const routes = [
    {
        id: 1,
        name: 'Vellore - Chennai Central',
        stops: ['Campus Main Gate', 'Library', 'Hostel Block A', 'Katpadi Junction', 'Gandhi Nagar', 'Arcot Road', 'Vandalur', 'Tambaram', 'Guindy', 'Chennai Central'],
        totalStops: 10,
        duration: '2h 30min',
        activeBuses: 5,
        dailyTrips: 16
    },
    {
        id: 2,
        name: 'Bangalore - Campus',
        stops: ['Bangalore Central', 'Electronics City', 'Hosur', 'Dharmapuri', 'Salem', 'Campus Main Gate'],
        totalStops: 6,
        duration: '3h 15min',
        activeBuses: 3,
        dailyTrips: 8
    },
    {
        id: 3,
        name: 'Katpadi - Campus',
        stops: ['Katpadi Junction', 'Arcot Road', 'Main Gate', 'Library', 'Academic Block'],
        totalStops: 5,
        duration: '45min',
        activeBuses: 4,
        dailyTrips: 24
    }
];

const drivers = [
    {
        id: 1,
        name: 'Rajesh Kumar',
        license: 'TN-07-2019-1234567',
        phone: '+91 9876543210',
        assignedBus: 'VIT-101',
        status: 'On Duty',
        experience: '8 years'
    },
    {
        id: 2,
        name: 'Suresh Babu',
        license: 'TN-07-2018-7654321',
        phone: '+91 9876543211',
        assignedBus: 'VIT-202',
        status: 'On Duty',
        experience: '12 years'
    },
    {
        id: 3,
        name: 'Murugan S',
        license: 'TN-07-2020-9876543',
        phone: '+91 9876543212',
        assignedBus: 'VIT-303',
        status: 'Off Duty',
        experience: '5 years'
    },
    {
        id: 4,
        name: 'Kumar R',
        license: 'KA-03-2017-5432109',
        phone: '+91 9876543213',
        assignedBus: 'VIT-404',
        status: 'On Duty',
        experience: '15 years'
    }
];

const notifications = [
    {
        id: 1,
        type: 'delay',
        busNumber: 'VIT-101',
        message: 'VIT-101 is running 5 minutes late due to traffic.',
        timestamp: '2 minutes ago',
        icon: '🚌'
    },
    {
        id: 2,
        type: 'arrival',
        busNumber: 'VIT-202',
        message: 'VIT-202 will arrive at Main Gate in 5 minutes.',
        timestamp: '7 minutes ago',
        icon: '⏰'
    },
    {
        id: 3,
        type: 'emergency',
        busNumber: 'VIT-205',
        message: 'VIT-205 reported breakdown at Arcot Road.',
        timestamp: '3 minutes ago',
        icon: '🚨'
    }
];
// Expose notifications for dashboards expecting window.notificationData
window.notificationData = notifications;

// Utility functions
const utils = {
    formatTime: (date) => {
        return date.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    },

    formatDate: (date) => {
        return date.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },

    getStatusClass: (status) => {
        switch(status.toLowerCase()) {
            case 'ontime': return 'status-ontime';
            case 'delayed': return 'status-delayed';
            case 'cancelled': return 'status-cancelled';
            default: return 'status-ontime';
        }
    },

    getStatusText: (status, delay = 0) => {
        switch(status.toLowerCase()) {
            case 'ontime': return 'On Time';
            case 'delayed': return `${delay} min late`;
            case 'cancelled': return 'Cancelled';
            default: return 'Unknown';
        }
    },

    searchBuses: (query, type = 'number') => {
        query = query.toLowerCase().trim();
        if (!query) return busData;

        if (type === 'number') {
            return busData.filter(bus =>
                bus.number.toLowerCase().includes(query)
            );
        } else {
            // Search by stop name
            const busesAtStop = stops[Object.keys(stops).find(stop =>
                stop.toLowerCase().includes(query)
            )] || [];
            return busData.filter(bus =>
                busesAtStop.includes(bus.number)
            );
        }
    },

    getBusByNumber: (busNumber) => {
        return busData.find(bus => bus.number === busNumber);
    },

    getDriverByBus: (busNumber) => {
        return drivers.find(driver => driver.assignedBus === busNumber);
    },

    addBus: (newBus) => {
        if (!newBus || !newBus.number) {
            console.error("Invalid bus data provided.");
            return false;
        }
        if (busData.some(bus => bus.number === newBus.number)) {
            console.error(`Bus with number ${newBus.number} already exists.`);
            return false;
        }
        busData.push(newBus);
        return true;
    },

    deleteBus: (busNumber) => {
        const index = busData.findIndex(bus => bus.number === busNumber);
        if (index > -1) {
            busData.splice(index, 1);
        }
        return index > -1;
    },

    showNotification: (message, type = 'info') => {
        // Simple notification system
        const notification = document.createElement('div');
        notification.className = `notification-toast ${type}`;
        notification.textContent = message;

        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#667eea',
            color: 'white',
            padding: '15px 20px',
            borderRadius: '8px',
            zIndex: '9999',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease'
        });

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    },

    validateForm: (formData) => {
        const errors = [];
        for (const [key, value] of Object.entries(formData)) {
            if (!value || value.toString().trim() === '') {
                errors.push(`${key} is required`);
            }
        }
        return errors;
    }
};

// Global application state
let currentUser = null;
let currentPage = 'login';
