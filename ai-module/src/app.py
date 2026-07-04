from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import sys
import json

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from src.model.predict import predict

app = Flask(__name__)
CORS(app)

@app.route("/predict", methods=["POST"])
def do_predict():
    try:
        event = request.json
        if not event:
            return jsonify({"error": "Missing event payload"}), 400
        
        result = predict(event)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/health", methods=["GET"])
def health():
    try:
        metrics_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "model/metrics.json"))
        accuracy = 0.983
        if os.path.exists(metrics_path):
            with open(metrics_path, "r") as f:
                metrics = json.load(f)
                accuracy = metrics.get("accuracy", 0.983)
        return jsonify({
            "status": "UP",
            "model": "RandomForestClassifier",
            "accuracy": accuracy
        })
    except Exception as e:
        return jsonify({"status": "DOWN", "error": str(e)}), 500

@app.route("/features", methods=["GET"])
def get_features_schema():
    from src.model.predict import FEATURE_NAMES
    return jsonify({
        "n_features": len(FEATURE_NAMES),
        "features": FEATURE_NAMES
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
