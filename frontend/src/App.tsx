
import { useCallback, useEffect, useState } from 'react'
import './App.css'

const API = 'http://localhost:5000'

type CDNResult = {
  request?: { requestId?: string }
  response?: {
    cacheStatus?: 'HIT' | 'MISS'
    latency?: number
    servedFrom?: 'EDGE' | 'ORIGIN'
    edgeServerId?: string
    contentId?: string
  }
  content?: {
    id?: string
    name?: string
    size?: number
    contentType?: string
  }
}

type CacheStats = {
  policy?: string
  capacity?: number
  currentSize?: number
  hits?: number
  misses?: number
  evictions?: number
  hitRatio?: number
}

const edgeNames = [
  { id: 'edge-delhi', city: 'Delhi', code: 'DL' },
  { id: 'edge-mumbai', city: 'Mumbai', code: 'MB' },
  { id: 'edge-bengaluru', city: 'Bengaluru', code: 'BLR' },
]

function App() {
  const [contentId, setContentId] = useState('video-101')
  const [location, setLocation] = useState('Delhi')
  const [result, setResult] = useState<CDNResult | null>(null)
  const [stats, setStats] = useState<Record<string, CacheStats>>({})
  const [loading, setLoading] = useState(false)
  const [statsLoading, setStatsLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchStats = useCallback(async () => {
    setStatsLoading(true)
    try {
      const response = await fetch(`${API}/api/cache/stats`)
      if (!response.ok) throw new Error('Could not load cache statistics')
      const data = await response.json()
      setStats(data.stats ?? data)
    } catch (err) {
      console.error(err)
    } finally {
      setStatsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const sendRequest = async () => {
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch(`${API}/api/cdn/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentId,
          clientLocation: location,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Request failed')
      }

      setResult(data)
      await fetchStats()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to connect to the CDN backend',
      )
    } finally {
      setLoading(false)
    }
  }

  const responseData = result?.response
  const isHit = responseData?.cacheStatus === 'HIT'

  const totalHits = Object.values(stats).reduce(
    (sum, item) => sum + (item.hits ?? 0),
    0,
  )
  const totalMisses = Object.values(stats).reduce(
    (sum, item) => sum + (item.misses ?? 0),
    0,
  )
  const totalEvictions = Object.values(stats).reduce(
    (sum, item) => sum + (item.evictions ?? 0),
    0,
  )
  const totalRequests = totalHits + totalMisses
  const hitRatio = totalRequests
    ? ((totalHits / totalRequests) * 100).toFixed(1)
    : '0.0'

  return (
    <main className="dashboard">
      <header className="topbar">
        <a className="brand" href="/">
          <span className="brand-icon">C</span>
          <span>CDN<span className="brand-light">Lab</span></span>
        </a>
        <div className="system-status">
          <span className="status-dot" />
          Simulator Dashboard
        </div>
      </header>

      <section className="welcome">
        <div>
          <p className="eyebrow">CONTENT DELIVERY NETWORK SIMULATOR</p>
          <h1>CDN Command Center</h1>
          <p className="subtitle">
            Monitor edge caching, simulate content requests and analyze
            delivery performance.
          </p>
        </div>
        <button className="refresh-button" onClick={fetchStats}>
          ↻ Refresh stats
        </button>
      </section>

      <section className="metrics">
        <article className="metric-card">
          <div className="metric-top">
            <span>Total Requests</span>
            <span className="metric-icon blue">↗</span>
          </div>
          <strong>{totalRequests}</strong>
          <small>Across all edge caches</small>
        </article>
        <article className="metric-card">
          <div className="metric-top">
            <span>Cache Hit Ratio</span>
            <span className="metric-icon green">%</span>
          </div>
          <strong>{hitRatio}%</strong>
          <small>Successful cache hits</small>
        </article>
        <article className="metric-card">
          <div className="metric-top">
            <span>Cache Hits</span>
            <span className="metric-icon green">✓</span>
          </div>
          <strong>{totalHits}</strong>
          <small>Requests served from cache</small>
        </article>
        <article className="metric-card">
          <div className="metric-top">
            <span>Cache Misses</span>
            <span className="metric-icon orange">↘</span>
          </div>
          <strong>{totalMisses}</strong>
          <small>Requests requiring origin fetch</small>
        </article>
      </section>

      <section className="main-grid">
        <article className="panel simulator">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">LIVE TESTING</p>
              <h2>Request Simulator</h2>
            </div>
            <span className="live-label">
              <span className="status-dot" /> Ready
            </span>
          </div>

          <label htmlFor="content">Content ID</label>
          <select
            id="content"
            value={contentId}
            onChange={(e) => setContentId(e.target.value)}
          >
            <option value="video-101">video-101 — Introduction to CDN</option>
            <option value="image-201">image-201 — Website Banner</option>
            <option value="file-301">file-301 — Project Documentation</option>
          </select>

          <label htmlFor="location">Client Location</label>
          <select
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          >
            <option value="Delhi">Delhi</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Bengaluru">Bengaluru</option>
          </select>

          <button
            className="send-button"
            onClick={sendRequest}
            disabled={loading}
          >
            {loading ? 'Processing request...' : '▶  Send CDN Request'}
          </button>

          <p className="hint">
            Send the same request twice to observe MISS followed by HIT.
          </p>

          {error && (
            <div className="error-box">
              <strong>Request failed</strong>
              <p>{error}</p>
              <small>Check that your backend is running on port 5000.</small>
            </div>
          )}

          {result && responseData && (
            <div className={`result-box ${isHit ? 'hit' : 'miss'}`}>
              <div className="result-heading">
                <span>REQUEST RESULT</span>
                <strong>{isHit ? 'CACHE HIT' : 'CACHE MISS'}</strong>
              </div>
              <div className="result-details">
                <div>
                  <small>Served from</small>
                  <strong>{responseData.servedFrom ?? 'Unknown'}</strong>
                </div>
                <div>
                  <small>Latency</small>
                  <strong>{responseData.latency ?? '—'} ms</strong>
                </div>
                <div>
                  <small>Edge server</small>
                  <strong>{responseData.edgeServerId ?? '—'}</strong>
                </div>
              </div>
              <p>
                {isHit
                  ? 'Content was served directly from the edge cache.'
                  : 'Content was fetched from the origin and added to the edge cache.'}
              </p>
            </div>
          )}

          {result && !responseData && (
            <div className="error-box">
              Request succeeded, but the response format was unexpected.
              Check the API response in the browser console.
            </div>
          )}
        </article>

        <article className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">NETWORK OVERVIEW</p>
              <h2>Edge Servers</h2>
            </div>
            <span className="server-count">3 NODES</span>
          </div>

          <div className="edge-list">
            {edgeNames.map((edge) => {
              const cache = stats[edge.id]
              return (
                <div className="edge-card" key={edge.id}>
                  <div className="edge-avatar">{edge.code}</div>
                  <div className="edge-info">
                    <strong>{edge.city} Edge</strong>
                    <small>{edge.id}</small>
                    <small>
                      {cache
                        ? `${cache.policy ?? 'Cache'} · ${cache.currentSize ?? 0}/${cache.capacity ?? 0} items`
                        : statsLoading
                          ? 'Loading statistics...'
                          : 'Statistics unavailable'}
                    </small>
                  </div>
                  <span className="node-status">
                    <span className="status-dot" /> Configured
                  </span>
                </div>
              )
            })}
          </div>

          <div className="cache-summary">
            <div>
              <span>Cache Evictions</span>
              <strong>{totalEvictions}</strong>
            </div>
            <div>
              <span>Cache Policies</span>
              <strong>LRU · LFU · FIFO</strong>
            </div>
          </div>
        </article>
      </section>

      <footer className="footer">
        <span>CDN Lab · Content Delivery Network Simulator</span>
        <span>Built with React, TypeScript &amp; Node.js</span>
      </footer>
    </main>
  )
}

export default App
