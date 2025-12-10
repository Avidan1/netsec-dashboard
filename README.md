# 🛡️ Network Sentry - Network Analysis & Pentesting Suite

> **A full-stack network monitoring and security tool designed for real-time device discovery, vulnerability assessment, and active defense.**

![Project Status](https://img.shields.io/badge/Status-In%20Development-orange)
![Python](https://img.shields.io/badge/Backend-Python%20%7C%20Scapy%20%7C%20FastAPI-blue)
![React](https://img.shields.io/badge/Frontend-React%20%7C%20TailwindCSS-green)

## 📖 Overview
`![Dashboard Screenshot](./screenshot/dashboard.png)`

**Network Sentry** is a security research project aimed at demystifying low-level network protocols. It combines a high-performance Python backend (utilizing **Scapy** for raw packet manipulation) with a modern React frontend to visualize network traffic and connected devices.

Currently, in its MVP phase, the tool serves as a passive network scanner with vendor resolution. Future versions will include active penetration testing capabilities (MITM, De-auth) for educational purposes and network hardening.

## 🏗️ Architecture

The application follows a classic Client-Server architecture:



1.  **The Engine (Backend):** * Built with **Python** & **FastAPI**.
    * Uses **Scapy** for low-level ARP broadcasting and packet sniffing.
    * Maintains a real-time state of the network.
    * Performs OUI (Organizationally Unique Identifier) lookups to identify device vendors.

2.  **The Dashboard (Frontend):**
    * Built with **React (Vite)** & **TailwindCSS**.
    * Communicates with the backend via REST API.
    * Provides a clean, dark-mode UI for monitoring.

## ✨ Features

- [x] **Fast ARP Scanning:** Discover all devices on the local network (LAN) in seconds.
- [x] **Vendor Identification:** Automatic resolution of MAC addresses to Manufacturer names (Apple, Intel, Espressif, etc.).
- [x] **Modern Dashboard:** Dark-mode UI with real-time status indicators.
- [ ] **Traffic Sniffing:** (Coming Soon) Analyze HTTP/DNS headers.
- [ ] **MITM Capability:** (Coming Soon) ARP Spoofing for traffic interception (Ethical use only).
- [ ] **Wi-Fi Defense:** (Coming Soon) De-authentication detection and prevention.

## 🚀 Installation & Setup

### Prerequisites
* Python 3.8+
* Node.js & npm
* **Windows Users:** Must install [Npcap](https://npcap.com/) (with "WinPcap API-compatible Mode" checked).
* **Linux/Mac Users:** `sudo` privileges are required for packet manipulation.

### 1. Backend Setup (The Engine)

```bash
cd backend
python -m venv venv

# Activate Virtual Environment:
# Windows:
.\venv\Scripts\Activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the Server (Must be run as Administrator/Root)
python main.py
```

2. Frontend Setup (The Dashboard)
```bash
Open a new terminal:

Bash

cd frontend
npm install
npm run dev
``` 
The dashboard will be available at http://localhost:5173.

## ⚠️ Legal Disclaimer
For Educational Purposes Only. This tool is intended to be used only on networks you own or have explicit permission to audit. The author is not responsible for any misuse or damage caused by this program.

## 🗺️ Roadmap
* v0.2: Add "Attack" module (De-auth / ARP Spoofer).

* v0.3: WebSocket integration for real-time traffic graphs.

* v0.4: Mobile App wrapper (React Native) for remote control.
___
Created by Avidan1

