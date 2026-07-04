import numpy as np

EVENT_TYPES = [
    "normal", "brute_force", "sql_injection", "ddos", "port_scan",
    "xss", "credentials_stuffing", "anomaly", "privilege_escalation",
    "data_exfiltration", "unauthorized_access"
]

PROTOCOLS = [
    "TCP", "UDP", "ICMP", "HTTP", "HTTPS", "SSH", "FTP", "DNS", "SMTP"
]

N_FEATURES = 35

def extract_features(event):
    """
    Converts event dictionary into a 35-dimensional float32 feature vector.
    """
    features = []

    # One-hot encode Event Type (11 features)
    e_type = event.get("type", "normal").lower()
    for et in EVENT_TYPES:
        features.append(1.0 if e_type == et else 0.0)

    # One-hot encode Protocol (9 features)
    proto = event.get("protocol", "TCP").upper()
    for p in PROTOCOLS:
        features.append(1.0 if proto == p else 0.0)

    # Port normalization (2 features: src_port, dest_port)
    src_port = float(event.get("srcPort", 0))
    dest_port = float(event.get("destPort", 0))
    features.append(src_port / 65535.0)
    features.append(dest_port / 65535.0)

    # Log scaling for skewed features (3 features: bytes, duration, request_count)
    bytes_sent = float(event.get("bytes", 0))
    duration = float(event.get("duration", 0))
    req_count = float(event.get("requestCount", 1))
    features.append(np.log1p(bytes_sent))
    features.append(np.log1p(duration))
    features.append(np.log1p(req_count))

    # Time variables (6 features: hour sin/cos, day sin/cos, after-hours, weekend)
    hour = 12.0
    day = 2.0  # Wed
    
    timestamp = event.get("timestamp")
    if timestamp:
        try:
            from dateutil import parser
            dt = parser.parse(timestamp)
            hour = float(dt.hour)
            day = float(dt.weekday())
        except Exception:
            try:
                parts = timestamp.split(":")
                h = float(parts[0])
                if "PM" in timestamp and h < 12:
                    h += 12
                if "AM" in timestamp and h == 12:
                    h = 0
                hour = h
            except Exception:
                pass

    # Cyclic hour
    features.append(np.sin(2.0 * np.pi * hour / 24.0))
    features.append(np.cos(2.0 * np.pi * hour / 24.0))

    # Cyclic weekday
    features.append(np.sin(2.0 * np.pi * day / 7.0))
    features.append(np.cos(2.0 * np.pi * day / 7.0))

    # After-hours indicator (before 8am or after 6pm)
    features.append(1.0 if (hour < 8.0 or hour > 18.0) else 0.0)

    # Weekend indicator (Saturday=5, Sunday=6)
    features.append(1.0 if day >= 5.0 else 0.0)

    # Internal IP
    src_ip = event.get("sourceIP", "")
    is_internal = 1.0 if (src_ip.startswith("192.168.") or src_ip.startswith("10.") or src_ip.startswith("172.16.")) else 0.0
    features.append(is_internal)

    # Severity Weight
    severity = event.get("severity", "Low").lower()
    sev_weight = 1.0
    if severity == "medium":
        sev_weight = 2.0
    elif severity == "high":
        sev_weight = 3.0
    elif severity == "critical":
        sev_weight = 4.0
    features.append(sev_weight / 4.0)

    # Has payload
    features.append(1.0 if bytes_sent > 0 else 0.0)
    
    # Request rate
    features.append(req_count / (duration + 1.0))

    return np.array(features, dtype=np.float32)
