import csv
import random
import os

EVENT_TYPES = [
    "normal", "brute_force", "sql_injection", "ddos", "port_scan",
    "xss", "credentials_stuffing", "anomaly", "privilege_escalation",
    "data_exfiltration", "unauthorized_access"
]

def generate_sample(e_type):
    sample = {
        "type": e_type,
        "protocol": "TCP",
        "srcPort": random.randint(1024, 65535),
        "destPort": 80,
        "bytes": random.randint(40, 2000),
        "duration": random.randint(1, 10),
        "requestCount": random.randint(1, 5),
        "sourceIP": f"192.168.1.{random.randint(2, 254)}",
        "severity": "Low",
        "timestamp": f"2026-07-03T{random.randint(9, 17):02d}:{random.randint(0, 59):02d}:00Z"
    }

    if e_type == "normal":
        sample["protocol"] = random.choice(["HTTP", "HTTPS", "DNS", "TCP"])
        if sample["protocol"] in ["HTTP", "HTTPS"]:
            sample["destPort"] = random.choice([80, 443])
        elif sample["protocol"] == "DNS":
            sample["destPort"] = 53
        sample["bytes"] = random.randint(100, 5000)
        sample["duration"] = random.randint(1, 30)
        sample["requestCount"] = random.randint(1, 10)

    elif e_type == "brute_force":
        sample["protocol"] = "SSH"
        sample["destPort"] = 22
        sample["bytes"] = random.randint(200, 1000)
        sample["duration"] = random.randint(10, 120)
        sample["requestCount"] = random.randint(30, 200)
        sample["severity"] = "High"
        sample["timestamp"] = f"2026-07-03T{random.choice([0, 1, 2, 3, 21, 22, 23]):02d}:{random.randint(0, 59):02d}:00Z"

    elif e_type == "sql_injection":
        sample["protocol"] = random.choice(["HTTP", "HTTPS"])
        sample["destPort"] = random.choice([80, 443])
        sample["bytes"] = random.randint(500, 3000)
        sample["requestCount"] = random.randint(1, 3)
        sample["severity"] = "High"
        sample["sourceIP"] = f"{random.randint(1, 254)}.{random.randint(1, 254)}.{random.randint(1, 254)}.{random.randint(1, 254)}"

    elif e_type == "ddos":
        sample["protocol"] = "UDP"
        sample["destPort"] = 80
        sample["bytes"] = random.randint(100000, 5000000)
        sample["duration"] = random.randint(60, 300)
        sample["requestCount"] = random.randint(1000, 10000)
        sample["severity"] = "Critical"
        sample["sourceIP"] = f"{random.randint(1, 254)}.{random.randint(1, 254)}.{random.randint(1, 254)}.{random.randint(1, 254)}"

    elif e_type == "port_scan":
        sample["protocol"] = "TCP"
        sample["destPort"] = random.randint(1, 1024)
        sample["bytes"] = random.randint(40, 100)
        sample["duration"] = random.randint(5, 45)
        sample["requestCount"] = random.randint(100, 500)
        sample["severity"] = "Medium"

    elif e_type == "xss":
        sample["protocol"] = "HTTP"
        sample["destPort"] = 80
        sample["bytes"] = random.randint(300, 1500)
        sample["requestCount"] = random.randint(2, 8)
        sample["severity"] = "Medium"

    elif e_type == "credentials_stuffing":
        sample["protocol"] = "HTTPS"
        sample["destPort"] = 443
        sample["bytes"] = random.randint(150, 600)
        sample["duration"] = random.randint(30, 90)
        sample["requestCount"] = random.randint(50, 150)
        sample["severity"] = "High"

    elif e_type == "anomaly":
        sample["protocol"] = "TCP"
        sample["destPort"] = random.choice([445, 139])
        sample["bytes"] = random.randint(2000, 8000)
        sample["severity"] = "Medium"

    elif e_type == "privilege_escalation":
        sample["protocol"] = "SSH"
        sample["destPort"] = 22
        sample["bytes"] = random.randint(800, 4000)
        sample["duration"] = random.randint(60, 600)
        sample["requestCount"] = random.randint(10, 40)
        sample["severity"] = "Critical"

    elif e_type == "data_exfiltration":
        sample["protocol"] = "DNS"
        sample["destPort"] = 53
        sample["bytes"] = random.randint(50000, 500000)
        sample["duration"] = random.randint(120, 1200)
        sample["requestCount"] = random.randint(200, 1000)
        sample["severity"] = "High"

    elif e_type == "unauthorized_access":
        sample["protocol"] = "FTP"
        sample["destPort"] = 21
        sample["bytes"] = random.randint(500, 2500)
        sample["severity"] = "Medium"

    return sample

def main():
    print("Generating SentinelX dataset...")
    n_samples = 15000
    
    samples = []
    for _ in range(int(n_samples * 0.4)):
        samples.append(generate_sample("normal"))
    
    attack_types = [e for e in EVENT_TYPES if e != "normal"]
    for _ in range(int(n_samples * 0.6)):
        samples.append(generate_sample(random.choice(attack_types)))

    os.makedirs("src/data", exist_ok=True)
    os.makedirs("src/model", exist_ok=True)
    csv_path = "src/data/dataset.csv"
    
    with open(csv_path, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=samples[0].keys())
        writer.writeheader()
        writer.writerows(samples)
        
    print(f"Dataset generated successfully with {len(samples)} samples at: {csv_path}")

if __name__ == "__main__":
    main()
