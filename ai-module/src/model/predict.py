import os
import sys
import joblib
import numpy as np

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))
from src.model.features import extract_features, N_FEATURES

FEATURE_NAMES = [
    "event_type_normal", "event_type_brute_force", "event_type_sql_injection", "event_type_ddos", "event_type_port_scan",
    "event_type_xss", "event_type_credentials_stuffing", "event_type_anomaly", "event_type_privilege_escalation",
    "event_type_data_exfiltration", "event_type_unauthorized_access",
    "protocol_tcp", "protocol_udp", "protocol_icmp", "protocol_http", "protocol_https", "protocol_ssh", "protocol_ftp", "protocol_dns", "protocol_smtp",
    "src_port_normalized", "dest_port_normalized",
    "log_bytes", "log_duration", "log_request_count",
    "hour_sin", "hour_cos", "day_sin", "day_cos", "after_hours", "weekend",
    "is_internal_ip", "severity_weight", "has_payload", "request_rate"
]

_clf = None
_scaler = None

def load_models():
    global _clf, _scaler
    if _clf is None or _scaler is None:
        model_dir = os.path.dirname(__file__)
        clf_path = os.path.join(model_dir, "classifier.pkl")
        scaler_path = os.path.join(model_dir, "scaler.pkl")
        
        if os.path.exists(clf_path) and os.path.exists(scaler_path):
            _clf = joblib.load(clf_path)
            _scaler = joblib.load(scaler_path)
        else:
            raise FileNotFoundError("Model files (classifier.pkl / scaler.pkl) not found. Please train models first.")

def predict(event):
    load_models()
    
    feat = extract_features(event)
    feat_reshaped = feat.reshape(1, -1)
    feat_scaled = _scaler.transform(feat_reshaped)
    
    probs = _clf.predict_proba(feat_scaled)[0]
    
    score = float(probs[1])
    label = "malicious" if score >= 0.7 else "benign"
    
    anomaly_score = float(1.0 - score)
    is_anomaly = bool(score > 0.65)
    
    importances = _clf.feature_importances_
    contributions = np.abs(feat_scaled[0] * importances)
    top_indices = np.argsort(contributions)[::-1][:5]
    
    feature_importances = []
    for idx in top_indices:
        feature_importances.append({
            "feature": FEATURE_NAMES[idx],
            "importance": float(importances[idx]),
            "value": float(feat[idx])
        })

    return {
        "score": score,
        "label": label,
        "confidence": float(max(probs)),
        "class_probabilities": {
            "benign": float(probs[0]),
            "malicious": float(probs[1])
        },
        "anomaly_score": anomaly_score,
        "is_anomaly": is_anomaly,
        "feature_importances": feature_importances
    }
