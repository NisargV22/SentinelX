import pandas as pd
import numpy as np
import os
import sys
import joblib
import json

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))
from src.model.features import extract_features, EVENT_TYPES

from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score, f1_score

def main():
    csv_path = "src/data/dataset.csv"
    if not os.path.exists(csv_path):
        print(f"Dataset not found at {csv_path}. Please run generate_dataset.py first.")
        sys.exit(1)

    print("Loading dataset...")
    df = pd.read_csv(csv_path)

    print("Extracting features...")
    X_list = []
    y_list = []

    for index, row in df.iterrows():
        event = row.to_dict()
        feat = extract_features(event)
        X_list.append(feat)
        
        label = 0 if event["type"] == "normal" else 1
        y_list.append(label)

    X = np.array(X_list, dtype=np.float32)
    y = np.array(y_list, dtype=np.int32)

    print(f"Features shape: {X.shape}, labels shape: {y.shape}")

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    print("Training RandomForestClassifier...")
    clf = RandomForestClassifier(
        n_estimators=200,
        max_depth=20,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1
    )
    clf.fit(X_train_scaled, y_train)

    y_pred = clf.predict(X_test_scaled)
    acc = accuracy_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred, average="weighted")
    print(f"Training Accuracy: {acc * 100:.2f}%")
    print(f"F1 Weighted Score: {f1:.4f}")

    os.makedirs("src/model", exist_ok=True)
    joblib.dump(clf, "src/model/classifier.pkl")
    joblib.dump(scaler, "src/model/scaler.pkl")

    metrics = {
        "accuracy": acc,
        "f1_score": f1,
        "classification_report": classification_report(y_test, y_pred, output_dict=True)
    }
    with open("src/model/metrics.json", "w") as f:
        json.dump(metrics, f, indent=2)

    print("Model files (classifier.pkl, scaler.pkl, metrics.json) exported successfully.")

if __name__ == "__main__":
    main()
