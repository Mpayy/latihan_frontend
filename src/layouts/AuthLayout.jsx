import { Outlet } from 'react-router-dom'

export default function AuthLayout() {
  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-logo text-primary">SysMedia</div>
        <Outlet />
      </div>
    </div>
  )
}
