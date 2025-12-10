import { useState, useEffect } from 'react'
import axios from 'axios'

function App() {
  const [devices, setDevices] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  /**
   * Triggers the scan API call to the Python backend.
   */
  const scanNetwork = async () => {
    setLoading(true)
    setError(null)
    try {
      // Ensure backend is running on port 8000
      const response = await axios.get('http://localhost:8000/api/scan')
      
      if (response.data.status === 'error') {
        throw new Error(response.data.message)
      }
      
      setDevices(response.data.devices)
    } catch (err) {
      console.error("Error scanning network:", err)
      setError("Failed to connect to backend. Is it running as root?")
    } finally {
      setLoading(false)
    }
  }

  // Initial scan on component mount
  useEffect(() => {
    scanNetwork()
  }, [])

  return (
    <div className="min-h-screen p-10 font-mono text-slate-200">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Section */}
        <div className="flex justify-between items-end mb-8 border-b border-green-800 pb-4">
          <h1 className="text-4xl font-bold text-green-400">
            Network Scout <span className="text-sm text-gray-500 font-normal">v0.1</span>
          </h1>
          <div className="text-xs text-gray-500">
            System Status: <span className="text-green-500">Active</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="mb-6 flex items-center gap-4">
          <button 
            onClick={scanNetwork}
            disabled={loading}
            className={`
              bg-green-600 hover:bg-green-700 text-black font-bold py-2 px-6 rounded 
              transition-all flex items-center gap-2
              ${loading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {loading ? (
              <>
                <span className="animate-spin">↻</span> Scanning...
              </>
            ) : (
              'Refresh Network'
            )}
          </button>
          
          {error && (
            <span className="text-red-400 text-sm bg-red-900/20 px-3 py-1 rounded border border-red-900">
              Error: {error}
            </span>
          )}
        </div>

        {/* Results Table */}
        <div className="bg-slate-800 rounded-lg shadow-xl overflow-hidden border border-slate-700">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-900 text-green-400 uppercase text-sm tracking-wider">
              <tr>
                <th className="p-4 border-b border-slate-700">IP Address</th>
                <th className="p-4 border-b border-slate-700">MAC Address</th>
                <th className="p-4 border-b border-slate-700">Vendor</th>
                <th className="p-4 border-b border-slate-700">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {devices.map((device) => (
                <tr key={device.mac} className="hover:bg-slate-700/50 transition-colors group">
                  <td className="p-4 font-bold text-white group-hover:text-green-300">
                    {device.ip}
                  </td>
                  <td className="p-4 text-gray-400 font-mono text-sm">
                    {device.mac.toUpperCase()}
                  </td>
                  <td className="p-4 text-gray-400 italic">
                    {device.vendor}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                      </span>
                      <span className="text-xs text-green-500 font-medium">Online</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Empty State */}
          {devices.length === 0 && !loading && !error && (
            <div className="p-12 text-center text-gray-500 flex flex-col items-center">
              <span className="text-4xl mb-2">📡</span>
              <p>No devices found yet.</p>
              <p className="text-sm mt-1">Check your connection or try scanning again.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App