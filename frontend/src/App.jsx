import { useState, useEffect } from 'react'
import axios from 'axios'

function App() {
  const [devices, setDevices] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(true)
  const [macBlurred, setMacBlurred] = useState(true)

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

  // Toggle dark mode class on document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)
  const toggleDarkMode = () => setDarkMode(!darkMode)
  const toggleMacBlur = () => setMacBlurred(!macBlurred)

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${darkMode ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' : 'bg-gradient-to-br from-gray-100 via-white to-gray-100'}`}>
      
      {/* Overlay for mobile when sidebar is open */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-72 
        ${darkMode ? 'bg-slate-900/95 border-slate-700' : 'bg-white/95 border-gray-200'} 
        border-r backdrop-blur-md shadow-2xl
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className={`flex items-center justify-between p-6 border-b ${darkMode ? 'border-slate-700' : 'border-gray-200'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${darkMode ? 'bg-emerald-500/20' : 'bg-emerald-100'} flex items-center justify-center`}>
                <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              </div>
              <span className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>Settings</span>
            </div>
            <button 
              onClick={toggleSidebar}
              className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-slate-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 p-6">
            <div className={`rounded-2xl p-4 ${darkMode ? 'bg-slate-800/50' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${darkMode ? 'bg-amber-500/20' : 'bg-amber-100'} flex items-center justify-center`}>
                    {darkMode ? (
                      <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Theme</p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{darkMode ? 'Dark Mode' : 'Light Mode'}</p>
                  </div>
                </div>
                <button
                  onClick={toggleDarkMode}
                  className={`
                    relative w-14 h-8 rounded-full transition-colors duration-300
                    ${darkMode ? 'bg-emerald-500' : 'bg-gray-300'}
                  `}
                >
                  <span className={`
                    absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md
                    transform transition-transform duration-300
                    ${darkMode ? 'translate-x-6' : 'translate-x-0'}
                  `} />
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar Footer */}
          <div className={`p-6 border-t ${darkMode ? 'border-slate-700' : 'border-gray-200'}`}>
            <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Network Scout v0.1</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="min-h-screen">
        {/* Top Navigation Bar */}
        <nav className={`sticky top-0 z-30 ${darkMode ? 'bg-slate-900/80' : 'bg-white/80'} backdrop-blur-md border-b ${darkMode ? 'border-slate-700/50' : 'border-gray-200'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                {/* Hamburger Menu Button */}
                <button
                  onClick={toggleSidebar}
                  className={`p-2.5 rounded-xl transition-all duration-200 ${darkMode ? 'bg-slate-800 hover:bg-slate-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                
                {/* Logo */}
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${darkMode ? 'bg-gradient-to-br from-emerald-500 to-cyan-500' : 'bg-gradient-to-br from-emerald-400 to-cyan-400'} flex items-center justify-center shadow-lg shadow-emerald-500/25`}>
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                    </svg>
                  </div>
                  <div>
                    <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Network Scout</h1>
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Network Discovery Tool</p>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-full ${darkMode ? 'bg-emerald-500/10' : 'bg-emerald-50'} border ${darkMode ? 'border-emerald-500/20' : 'border-emerald-200'}`}>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className={`text-sm font-medium ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>System Active</span>
              </div>
            </div>
          </div>
        </nav>

        {/* Dashboard Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className={`rounded-2xl p-6 ${darkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-gray-200'} border backdrop-blur-sm`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Devices Found</p>
                  <p className={`text-3xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{devices.length}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl ${darkMode ? 'bg-blue-500/20' : 'bg-blue-100'} flex items-center justify-center`}>
                  <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className={`rounded-2xl p-6 ${darkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-gray-200'} border backdrop-blur-sm`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Network Range</p>
                  <p className={`text-lg font-bold mt-1 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>192.168.1.x</p>
                </div>
                <div className={`w-12 h-12 rounded-xl ${darkMode ? 'bg-emerald-500/20' : 'bg-emerald-100'} flex items-center justify-center`}>
                  <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className={`rounded-2xl p-6 ${darkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-gray-200'} border backdrop-blur-sm`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Scan Status</p>
                  <p className={`text-lg font-bold mt-1 ${loading ? (darkMode ? 'text-amber-400' : 'text-amber-600') : (darkMode ? 'text-emerald-400' : 'text-emerald-600')}`}>
                    {loading ? 'Scanning...' : 'Complete'}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-xl ${loading ? (darkMode ? 'bg-amber-500/20' : 'bg-amber-100') : (darkMode ? 'bg-emerald-500/20' : 'bg-emerald-100')} flex items-center justify-center`}>
                  {loading ? (
                    <svg className="w-6 h-6 text-amber-500 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Network Devices</h2>
              <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Discovered devices on your local network</p>
            </div>
            <button 
              onClick={scanNetwork}
              disabled={loading}
              className={`
                flex items-center gap-2 px-6 py-3 rounded-xl font-semibold
                transition-all duration-200 shadow-lg
                ${loading 
                  ? 'bg-gray-500 cursor-not-allowed opacity-50' 
                  : 'bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 shadow-emerald-500/25 hover:shadow-emerald-500/40'
                }
                text-white
              `}
            >
              {loading ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Scanning...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Refresh Scan</span>
                </>
              )}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className={`mb-6 p-4 rounded-xl ${darkMode ? 'bg-red-500/10 border-red-500/20' : 'bg-red-50 border-red-200'} border flex items-center gap-3`}>
              <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className={`text-sm ${darkMode ? 'text-red-400' : 'text-red-600'}`}>{error}</span>
            </div>
          )}

          {/* Data Table */}
          <div className={`rounded-2xl overflow-hidden ${darkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-gray-200'} border backdrop-blur-sm shadow-xl relative`}>
            {/* Loading overlay for refresh */}
            {loading && devices.length > 0 && (
              <div className="absolute inset-0 bg-black/20 backdrop-blur-sm z-10 flex items-center justify-center">
                <div className={`flex items-center gap-3 px-4 py-2 rounded-xl ${darkMode ? 'bg-slate-800' : 'bg-white'} shadow-lg`}>
                  <svg className={`w-5 h-5 animate-spin ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Refreshing...</span>
                </div>
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`${darkMode ? 'bg-slate-900/50' : 'bg-gray-50'}`}>
                    <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      IP Address
                    </th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <div className="flex items-center gap-2">
                        <span>MAC Address</span>
                        <button
                          onClick={toggleMacBlur}
                          className={`p-1 rounded-md transition-colors ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-200'}`}
                          title={macBlurred ? 'Show MAC addresses' : 'Hide MAC addresses'}
                        >
                          {macBlurred ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Vendor
                    </th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${darkMode ? 'divide-slate-700/50' : 'divide-gray-200'}`}>
                  {devices.map((device, index) => (
                    <tr 
                      key={device.mac} 
                      className={`${darkMode ? 'hover:bg-slate-700/30' : 'hover:bg-gray-50'} transition-colors duration-150`}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg ${darkMode ? 'bg-blue-500/20' : 'bg-blue-100'} flex items-center justify-center`}>
                            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                            </svg>
                          </div>
                          <span className={`font-mono font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{device.ip}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <code className={`px-2 py-1 rounded-md text-sm font-mono ${darkMode ? 'bg-slate-700/50 text-gray-300' : 'bg-gray-100 text-gray-700'} ${macBlurred ? 'blur-sm select-none' : ''} transition-all duration-200`}>
                          {device.mac.toUpperCase()}
                        </code>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{device.vendor}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${darkMode ? 'bg-emerald-500/10' : 'bg-emerald-50'}`}>
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </span>
                          <span className={`text-xs font-medium ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>Online</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Empty State */}
            {devices.length === 0 && !loading && !error && (
              <div className="p-16 text-center">
                <div className={`w-16 h-16 mx-auto rounded-2xl ${darkMode ? 'bg-slate-700/50' : 'bg-gray-100'} flex items-center justify-center mb-4`}>
                  <svg className={`w-8 h-8 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                  </svg>
                </div>
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>No devices found</h3>
                <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Check your network connection or try scanning again.</p>
              </div>
            )}

            {/* Loading State */}
            {loading && devices.length === 0 && (
              <div className="p-16 text-center">
                <svg className={`w-12 h-12 mx-auto mb-4 animate-spin ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Scanning network...</h3>
                <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Discovering devices on your network</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default App