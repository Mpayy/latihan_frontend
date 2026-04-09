import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'

export default function MainLayout() {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <div className="feed-container">
          <Outlet />
        </div>
        {/* Right Panel for suggestions (only visible on large screens) */}
        <div className="right-panel">
          <div className="glass-card">
            <div className="glass-card-header">
              <h6 className="m-0 fw-bold">Saran untuk Anda</h6>
            </div>
            <div className="glass-card-body pt-3">
              <p className="text-muted small">Fitur saran teman akan muncul di sini</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
