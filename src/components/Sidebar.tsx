import { NavLink, useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";

interface SidebarProps {
  onLogout: () => void;
  open?: boolean;
  onToggle?: () => void;
}

const links = [
  { path: "/", label: "Dashboard" },
  { path: "/in-out", label: "IN/OUT" },
  { path: "/activity", label: "Activity Log" },
  { path: "/profile", label: "View Profile" },
];

export default function Sidebar({
  onLogout,
  open = false,
  onToggle,
}: SidebarProps) {
  const location = useLocation();
  const navRef = useRef<HTMLUListElement | null>(null);
  const indicatorRef = useRef<HTMLDivElement | null>(null);

  /* ---------------- MOVE ACTIVE INDICATOR + DEPTH EFFECT ---------------- */
  useEffect(() => {
    if (!navRef.current || !indicatorRef.current) return;

    const items = navRef.current.querySelectorAll("li");

    const activeIndex = links.findIndex((l) =>
      location.pathname === l.path
    );

    const el = items[activeIndex] as HTMLElement;
    if (!el) return;

    const rect = el.getBoundingClientRect();

    // Move indicator (active pill)
    gsap.to(indicatorRef.current, {
      y: el.offsetTop,
      height: rect.height,
      duration: 0.5,
      ease: "power3.out",
    });

    // Depth effect for items
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
      {/* toggle button */}
      <button
        className="sidebar-toggle"
        onClick={onToggle}
        aria-label="Toggle sidebar"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* overlay */}
      {open && <div className="sidebar-overlay" onClick={onToggle} />}

      <aside className={`sidebar ${open ? "open" : ""}`}>
        {/* brand */}
        <div className="brand">
          <div className="brand-icon">S</div>
          <div>
            <div style={{ fontWeight: 700 }}>Sonkkens</div>
            <div style={{ fontSize: "0.88rem", color: "#64748b" }}>
              Inventory
            </div>
          </div>
        </div>

        {/* NAV */}
        <nav className="nav-wrapper">
          <div ref={indicatorRef} className="active-indicator" />

          <ul className="nav-list" ref={navRef}>
            {links.map((item) => (
              <li key={item.path}>
                <NavLink
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                  to={item.path}
                  end
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* logout */}
        <button
          className="button secondary"
          style={{ marginTop: "auto" }}
          onClick={onLogout}
        >
          Logout
        </button>
      </aside>
    </>
  );
}