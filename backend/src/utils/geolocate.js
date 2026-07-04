const FALLBACKS = [
  { country: "United States", city: "New York", lat: 40.7128, lon: -74.0060 },
  { country: "United Kingdom", city: "London", lat: 51.5074, lon: -0.1278 },
  { country: "Germany", city: "Berlin", lat: 52.5200, lon: 13.4050 },
  { country: "China", city: "Beijing", lat: 39.9042, lon: 116.4074 },
  { country: "Russia", city: "Moscow", lat: 55.7558, lon: 37.6173 },
  { country: "India", city: "Mumbai", lat: 19.0760, lon: 72.8777 },
  { country: "Brazil", city: "São Paulo", lat: -23.5505, lon: -46.6333 },
  { country: "Canada", city: "Toronto", lat: 43.6532, lon: -79.3832 },
  { country: "Japan", city: "Tokyo", lat: 35.6762, lon: 139.6503 },
  { country: "Ukraine", city: "Kyiv", lat: 50.4501, lon: 30.5234 },
  { country: "Iran", city: "Tehran", lat: 35.6892, lon: 51.3890 },
  { country: "Netherlands", city: "Amsterdam", lat: 52.3676, lon: 4.9041 }
];

const geolocate = async (ip) => {
  if (
    !ip ||
    ip === "127.0.0.1" || 
    ip === "::1" || 
    ip.startsWith("192.168.") || 
    ip.startsWith("10.") ||
    ip.startsWith("172.16.")
  ) {
    return { country: "Internal Network", city: "Local Subnet", lat: 37.7749, lon: -122.4194 };
  }

  let hashVal = 0;
  for (let i = 0; i < ip.length; i++) {
    hashVal = ip.charCodeAt(i) + ((hashVal << 5) - hashVal);
  }
  
  const idx = Math.abs(hashVal) % FALLBACKS.length;
  return FALLBACKS[idx];
};

module.exports = geolocate;
