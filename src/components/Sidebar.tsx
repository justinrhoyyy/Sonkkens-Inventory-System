import { NavLink } from 'react-router-dom';

interface SidebarProps {
  onLogout: () => void;
}

const links = [
  { path: '/', label: 'Dashboard' },
  { path: '/in-out', label: 'IN/OUT' },
  { path: '/activity', label: 'Activity Log' },
  { path: '/profile', label: 'View Profile' },
];

export default function Sidebar({ onLogout }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon">S</div>
        <div>
          <div style={{ fontWeight: 700 }}>Sonkkens</div>
          <div style={{ fontSize: '0.88rem', color: '#64748b' }}>Inventory</div>
        </div>
      </div>

      <nav>
        <ul className="nav-list">
          {links.map((item) => (
            <li key={item.path}>
              <NavLink className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')} to={item.path} end>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <button className="button secondary" style={{ marginTop: 'auto' }} onClick={onLogout}>
        Logout
      </button>
    </aside>
  );
}
