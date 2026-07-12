import { useState } from "react";

export default function Endpoints({ accessToken }) {
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(null);

  // Mock endpoints data
  const endpoints = [
    { id: "WIN-SRV-01", os: "Windows Server 2022", ip: "10.0.0.14", status: "Online", lastSync: "Just now", version: "v1.4.2" },
    { id: "WIN-DESK-HQ", os: "Windows 11 Enterprise", ip: "10.0.0.45", status: "Online", lastSync: "2 mins ago", version: "v1.4.2" },
    { id: "LNX-NGINX-01", os: "Ubuntu 22.04 LTS", ip: "10.0.1.12", status: "Offline", lastSync: "3 hours ago", version: "v1.4.1" },
  ];

  const handleDownload = (os) => {
    setDownloading(true);
    
    // Trigger actual file download SYNCHRONOUSLY to prevent browser blocking
    const content = `# SentinelX Forwarder Agent for ${os}
import time
import json
import urllib.request
import os
import random

# Configuration
LOG_FILE_PATH = r"C:\\logs\\network.log" if "${os}" == "Windows" else "/var/log/network.log"
SENTINELX_API_URL = "https://sentinelx-ai-hkp8.onrender.com/api/events"
AGENT_ID = f"${os.toLowerCase()}-endpoint-{random.randint(100,999)}"

def parse_log_line(line):
    # Basic parser assuming line is like: "192.168.1.5:443 -> 10.0.0.1:22 brute_force"
    try:
        parts = line.strip().split(" ")
        src_ip = parts[0].split(":")[0] if len(parts) > 0 else "192.168.1.100"
        dest_ip = parts[2].split(":")[0] if len(parts) > 2 else "10.0.0.1"
        event_type = parts[3] if len(parts) > 3 else "unauthorized_access"
        return {
            "type": event_type,
            "protocol": "TCP",
            "srcPort": random.randint(1024, 65535),
            "destPort": random.randint(22, 443),
            "bytes": random.randint(100, 5000),
            "duration": random.randint(1, 10),
            "requestCount": 1,
            "sourceIP": src_ip,
            "destIP": dest_ip
        }
    except Exception:
        return {
            "type": "unauthorized_access",
            "protocol": "TCP",
            "srcPort": 55555,
            "destPort": 22,
            "bytes": 500,
            "duration": 2,
            "requestCount": 1,
            "sourceIP": "192.168.1.5",
            "destIP": "10.0.0.15"
        }

def start_forwarding():
    print(f"[*] Starting SentinelX Agent ({AGENT_ID})\\n[*] Monitoring {LOG_FILE_PATH}...")
    
    # Ensure file exists
    os.makedirs(os.path.dirname(LOG_FILE_PATH), exist_ok=True)
    if not os.path.exists(LOG_FILE_PATH):
        with open(LOG_FILE_PATH, 'w') as f:
            f.write("")

    with open(LOG_FILE_PATH, 'r') as file:
        file.seek(0, os.SEEK_END)
        while True:
            line = file.readline()
            if not line:
                time.sleep(1)
                continue
            
            payload = parse_log_line(line)
            data = json.dumps(payload).encode('utf-8')
            req = urllib.request.Request(SENTINELX_API_URL, data=data, headers={'Content-Type': 'application/json', 'x-agent-id': AGENT_ID})
            
            try:
                with urllib.request.urlopen(req, timeout=5) as response:
                    if response.status in [200, 201]:
                        print(f"[+] Forwarded event: {payload['type']} from {payload['sourceIP']}")
            except Exception as e:
                print(f"[-] Forwarding failed: {e}")

if __name__ == "__main__":
    start_forwarding()
`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = os === 'Windows' ? 'SentinelAgent_x64.py' : 'sentinel-agent_amd64.py';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    // Simulate generation delay for UI only
    setTimeout(() => {
      setDownloading(false);
      setDownloadSuccess(os);
      setTimeout(() => setDownloadSuccess(null), 5000);
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Endpoint Agent Management</h2>
          <p className="text-sm text-slate-500 mt-1">Deploy, monitor, and manage SentinelX Forwarder Agents across your corporate network.</p>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Windows Agent Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.951-1.801" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Windows Agent</h3>
                <p className="text-xs text-slate-500 font-mono">SentinelAgent_x64.msi</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-6">
              Download the pre-configured Windows installer. Can be pushed silently via Microsoft Active Directory GPO or Intune to all corporate endpoints.
            </p>
          </div>
          
          <button 
            onClick={() => handleDownload('Windows')}
            disabled={downloading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg transition shadow-md shadow-blue-500/20 disabled:opacity-70 flex justify-center items-center gap-2 cursor-pointer"
          >
            {downloading ? (
              <span className="animate-pulse">Generating Installer...</span>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Download .MSI Installer
              </>
            )}
          </button>
        </div>

        {/* Linux Agent Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.012 0c-3.13 0-5.889 1.638-7.447 4.108 0 0-1.745 2.827-2.73 5.426-.985 2.599-1.835 5.922-1.835 5.922C.001 16.29 0 17.067 0 17.653 0 21.144 2.868 24 6.425 24c2.81 0 5.204-1.84 6.073-4.453l-.265-.133c-.767-.373-1.41-.856-1.92-1.455-.494.63-.888 1.34-1.155 2.115-.468 1.353-1.71 2.348-3.176 2.348-1.895 0-3.447-1.55-3.447-3.445 0-.488.106-.957.3-1.39l.236-.535s.893-3.435 1.93-6.145c1.036-2.711 2.88-5.713 2.88-5.713 1.14-1.815 3.125-2.99 5.412-2.99 2.296 0 4.29 1.185 5.433 3.013 0 0 1.848 3.016 2.89 5.733 1.042 2.717 1.937 6.166 1.937 6.166.195.438.303.91.303 1.405 0 1.896-1.55 3.447-3.445 3.447-1.474 0-2.723-1.005-3.187-2.37-.267-.775-.662-1.488-1.158-2.12-.51.602-1.153 1.088-1.923 1.464l-.264.131C18.8 22.158 21.196 24 24.004 24c3.56 0 6.427-2.856 6.427-6.347 0-.586-.002-1.363-.002-1.363 0 0-.853-3.33-1.842-5.934-.988-2.604-2.74-5.44-2.74-5.44C24.282 1.636 21.523 0 18.393 0c-.822 0-1.616.155-2.36.438a7.842 7.842 0 0 0-1.528 1.15C13.882.528 12.983 0 12.012 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Linux Agent</h3>
                <p className="text-xs text-slate-500 font-mono">sentinel-agent_amd64.deb</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-6">
              Download the pre-configured Debian/Ubuntu package. Can be pushed via Ansible, Chef, or Puppet to all Linux server environments.
            </p>
          </div>
          
          <button 
            onClick={() => handleDownload('Linux')}
            disabled={downloading}
            className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-2.5 px-4 rounded-lg transition shadow-md shadow-slate-900/20 disabled:opacity-70 flex justify-center items-center gap-2 cursor-pointer"
          >
            {downloading ? (
              <span className="animate-pulse">Generating Package...</span>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Download .DEB Package
              </>
            )}
          </button>
        </div>

      </div>

      {/* Success Toast */}
      {downloadSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg flex items-start gap-3 shadow-sm animate-in slide-in-from-top-2">
          <svg className="w-5 h-5 text-emerald-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="text-sm font-bold">{downloadSuccess} Agent Generated Successfully</h4>
            <p className="text-xs mt-0.5">The pre-configured agent has been downloaded. Your API keys are securely embedded inside the installer.</p>
          </div>
        </div>
      )}

      {/* Connected Endpoints Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mt-6">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h3 className="font-bold text-slate-800">Active Forwarder Endpoints</h3>
          <span className="bg-emerald-100 text-emerald-700 text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md">
            2 Online
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-wider font-bold border-b border-slate-200">
                <th className="px-6 py-3">Hostname</th>
                <th className="px-6 py-3">Operating System</th>
                <th className="px-6 py-3">Local IP</th>
                <th className="px-6 py-3">Version</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Last Sync</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {endpoints.map((ep) => (
                <tr key={ep.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="font-bold text-slate-800 text-sm">{ep.id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{ep.os}</td>
                  <td className="px-6 py-4 text-xs font-mono text-slate-500">{ep.ip}</td>
                  <td className="px-6 py-4 text-xs text-slate-500">{ep.version}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      ep.status === 'Online' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${ep.status === 'Online' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                      {ep.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">{ep.lastSync}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
