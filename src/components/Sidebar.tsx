import { NavLink, useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import {
  HiHome,
  HiArrowPath,
  HiClipboardDocumentList,
  HiUser,
  HiArrowRightOnRectangle,
} from "react-icons/hi2";

interface SidebarProps {
  onLogout: () => void;
  open?: boolean;
  onToggle?: () => void;
}

const links = [
  {
    path: "/",
    label: "Dashboard",
    icon: HiHome,
  },
  {
    path: "/in-out",
    label: "IN/OUT",
    icon: HiArrowPath,
  },
  {
    path: "/activity",
    label: "Activity Log",
    icon: HiClipboardDocumentList,
  },
  {
    path: "/profile",
    label: "View Profile",
    icon: HiUser,
  },
];

export default function Sidebar({
  onLogout,
  open = false,
  onToggle,
}: SidebarProps) {
  const location = useLocation();
  const navRef = useRef<HTMLUListElement | null>(null);
  const indicatorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!navRef.current || !indicatorRef.current) return;

    const items = navRef.current.querySelectorAll("li");

    const activeIndex = links.findIndex(
      (l) => location.pathname === l.path
    );

    const el = items[activeIndex] as HTMLElement;
    if (!el) return;

    const rect = el.getBoundingClientRect();

    gsap.to(indicatorRef.current, {
      y: el.offsetTop,
      height: rect.height,
      duration: 0.5,
      ease: "power3.out",
    });

    items.forEach((li, i) => {
      const link = li.querySelector(".nav-link") as HTMLElement;
      if (!link) return;

      const isActive = i === activeIndex;

      gsap.to(link, {
        scale: isActive ? 1 : 0.98,
        x: isActive ? 0 : 2,
        opacity: isActive ? 1 : 0.55,
        duration: 0.3,
        ease: "power2.out",
      });
    });
  }, [location.pathname]);

  return (
    <>
      {/* Toggle Button */}
      <button
        className="sidebar-toggle"
        onClick={onToggle}
        aria-label="Toggle sidebar"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="sidebar-overlay"
          onClick={onToggle}
        />
      )}

      <aside className={`sidebar ${open ? "open" : ""}`}>
        {/* Brand */}
        <div className="brand">
          <div className="brand-icon">S</div>

          <div>
            <div style={{ fontWeight: 700 }}>
              Sonkkens
            </div>

            <div
              style={{
                fontSize: "0.88rem",
                color: "#64748b",
              }}
            >
              Inventory
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="nav-wrapper">
          <div
            ref={indicatorRef}
            className="active-indicator"
          />

          <ul
            className="nav-list"
            ref={navRef}
          >
            {links.map((item) => {
              const Icon = item.icon;

              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    end
                    className={({ isActive }) =>
                      isActive
                        ? "nav-link active"
                        : "nav-link"
                    }
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout */}
        <button
          className="button secondary"
          style={{
            marginTop: "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
          }}
          onClick={onLogout}
        >
          <HiArrowRightOnRectangle size={20} />
          <span>Logout</span>
        </button>
      </aside>
    </>
  );
}