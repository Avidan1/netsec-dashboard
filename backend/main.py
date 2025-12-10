from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import scapy.all as scapy
import uvicorn
from mac_vendor_lookup import MacLookup

app = FastAPI()

# Initialize the MacLookup object
mac_lookup = MacLookup()

# --- CORS Configuration ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def update_vendor_database():
    """
    On server startup, this updates the MAC address vendor database.
    It downloads the latest list from the internet so we can identify new devices.
    """
    try:
        print("Updating MAC Vendor Database...")
        mac_lookup.update_vendors()
        print("MAC Vendor Database updated successfully.")
    except Exception as e:
        print(f"Failed to update MAC database: {e}")

def get_vendor(mac_address):
    """
    Helper function to resolve MAC address to Vendor name with Debugging.
    """
    try:
        vendor = mac_lookup.lookup(mac_address)
        return vendor
    except Exception as e:
        print(f"DEBUG: Failed lookup for MAC: {mac_address}. Error: {str(e)}")
        return "Unknown Device"

def scan_network(ip_range):
    """
    Performs ARP scan and resolves vendors.
    """
    # Create ARP request packet
    arp_request = scapy.ARP(pdst=ip_range)
    broadcast = scapy.Ether(dst="ff:ff:ff:ff:ff:ff")
    arp_request_broadcast = broadcast/arp_request
    
    # Send packets and wait for response
    answered_list = scapy.srp(arp_request_broadcast, timeout=1, verbose=False)[0]

    clients_list = []
    for element in answered_list:
        mac_addr = element[1].hwsrc
        ip_addr = element[1].psrc
        
        # Resolve the vendor using our new helper function
        vendor_name = get_vendor(mac_addr)
        
        client_dict = {
            "ip": ip_addr,
            "mac": mac_addr,
            "vendor": vendor_name 
        }
        clients_list.append(client_dict)
        
    return clients_list

@app.get("/api/scan")
def get_network_scan():
    # Adjust this IP range to match your local network (check ipconfig/ifconfig)
    target_ip = "192.168.1.1/24" 
    
    try:
        results = scan_network(target_ip)
        return {"status": "success", "devices": results, "count": len(results)}
    except Exception as e:
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)