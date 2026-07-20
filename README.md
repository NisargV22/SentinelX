<div align="center">

# 🛡️ SentinelX: Next-Generation SIEM & Cybersecurity Platform

[![React](https://img.shields.io/badge/React-18.0-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20.0-green?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-purple?style=for-the-badge)](LICENSE)

*An advanced Security Information and Event Management (SIEM) architecture converging Artificial Intelligence with Blockchain Immutability.*

</div>

<br/>

## 📖 Overview

**SentinelX** is a state-of-the-art enterprise cybersecurity platform built to detect, analyze, and permanently record network threats. 

Traditional SIEMs rely on centralized databases that can be compromised if an attacker gains root access, allowing them to delete logs and cover their tracks. SentinelX solves this critical vulnerability by **cryptographically anchoring** batched audit logs into a simulated blockchain ledger. Furthermore, a built-in **Machine Learning Telemetry Engine** analyzes incoming network payloads to grade them on a heuristic threat scale, delivering real-time actionable intelligence to SOC (Security Operations Center) analysts.

---

## 🚀 Key Architectural Innovations

### 🧠 1. AI-Driven Threat Analytics
- **Telemetry Engine:** Parses incoming HTTP/TCP requests and evaluates JSON payloads for known OWASP attack vectors (e.g., SQL Injection, Cross-Site Scripting, Directory Traversal, Command Injection).
- **Heuristic Threat Scoring:** Every ingested log is assigned a confidence score:
  - 🔴 `> 70%`: **Malicious** (Critical/High Severity Alert)
  - 🟠 `35% - 70%`: **Suspicious** (Medium/Low Severity Alert)
  - 🟢 `< 35%`: **Benign / Safe**
- **Automated Triage:** Threats automatically trigger active alerts populating the SOC dashboard for immediate triage and remediation workflow.

### ⛓️ 2. Blockchain Immutability Ledger
- **Cryptographic Anchoring:** System audit logs are periodically batched, serialized, and hashed using SHA-256. These immutable hash signatures are pushed into an append-only blockchain ledger.
- **Tamper Detection Protocol:** If a malicious actor compromises the underlying database and modifies historical logs to cover their tracks, SentinelX will instantly detect the cryptographic mismatch.
- **Auto-Alerting:** The system triggers a massive `Critical` Alert—**"Security Alteration Detected"**—upon identifying database tampering.

### 🎨 3. Enterprise UI/UX & Dashboard
- **Glassmorphism Aesthetics:** A stunning, highly responsive UI powered by Tailwind CSS featuring glassmorphism overlays, dynamic gradients, and fluid micro-animations.
- **Live Event Console:** Real-time structured log viewing with dynamic categorization (Malicious, Suspicious, Web Services, Network).

---

## 🔒 Security Enhancements & Best Practices

- **Role-Based Access Control (RBAC):** Strict isolation between `Admin`, `SOC Analyst`, and `Employee` user roles.
- **Advanced Session Protection:** Employs `sessionStorage` (instead of `localStorage`) to bind JWT tokens securely to a single browser tab, heavily mitigating Cross-Site Scripting (XSS) payload exfiltration.
- **Inactivity Timeouts:** Auto-logout monitor terminates active sessions after 30 minutes of idle time to prevent physical session hijacking.
- **Recursive NoSQL Sanitization:** Custom backend middleware recursively strips `$` and `.` operators from deeply nested JSON payloads to block complex NoSQL Injection attacks.
- **True Client IP Tracking:** Configured `trust proxy` policies to accurately extract `X-Forwarded-For` IPs behind Vercel/Render load balancers.

---

## 🧩 Core Modules

| Module | Route | Description |
|--------|-------|-------------|
| **Log Console** | `/` | The central nervous system for SOC analysts showing live SIEM event streams and KPI metrics. |
| **Threat Intel** | `/threats` | A dedicated portal dissecting identified attacks, mapping to OWASP, and providing remediation. |
| **Analytics & UBA** | `/analytics`, `/uba` | Visual charting representing threat vectors over time and User Behavior Analytics (UBA). |
| **Ledger Auditing** | `/blockchain` | Interface to view cryptographically sealed blocks, timestamps, and re-verify ledger integrity. |
| **SOAR Actions** | `/soar` | Security Orchestration, Automation, and Response actions for automated threat mitigation. |
| **Playbooks** | `/playbook-guides` | Step-by-step incident response manuals for junior analysts (e.g., Ransomware, DDoS). |
| **Detection Rules** | `/rules` | Configuration interface to dynamically tune AI engine sensitivities and OWASP parameters. |

---

## 🛠️ Technology Stack

**Frontend Architecture:**
- React.js (Vite Toolchain)
- Tailwind CSS
- React Router DOM
- *Deployed on Vercel*

**Backend Architecture:**
- Node.js & Express.js
- MongoDB & Mongoose ODM
- Helmet.js (HTTP Security Headers)
- CORS Middleware Configuration
- *Deployed on Render*

---

## 💻 Local Development Setup

Follow these steps to deploy SentinelX in your local environment.

### 1. Clone the Repository
```bash
git clone https://github.com/NisargV22/SentinelX.git
cd SentinelX
```

### 2. Backend Initialization
```bash
cd backend
npm install
```
*Create a `.env` file in the `/backend` directory containing your `MONGO_URI` and `JWT_SECRET`.*
```bash
npm run dev
```

### 3. Frontend Initialization
```bash
cd ../frontend/ai-blockchain-frontend
npm install
npm run dev
```
*Navigate to `http://localhost:5173` to access the portal.*

---

<div align="center">
  <b>Built for the Future of Enterprise Cyber Defense.</b><br/>
  &copy; 2026 SentinelX Systems
</div>
