{

const { useState } = React;
const { Icon, OrgSwitcher } = window.SharedShell;
const D = window.ORG_DASH;

const MYADMIN_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: "dashboard", href: "index.html" },
  { key: "user", label: "User", icon: "group" },
  { key: "driver", label: "Driver", icon: "badge" },
  { key: "vehicle", label: "Vehicle", icon: "local_shipping", href: "../org-vehicle-list/index.html" },
  { key: "vendor", label: "Vendor", icon: "storefront" },
  { key: "checklist", label: "Checklist", icon: "fact_check" },
  { key: "history", label: "Check In History", icon: "history" },
];

function Rail() {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className={`mad-rail-wrap${expanded ? " expanded" : ""}`}>
      <nav className={`mad-rail${expanded ? " expanded" : ""}`} aria-label="MyAdmin navigation">
        <div className="mad-rail-profile">
          <div className="mad-rail-avatar-wrap">
            <div className="mad-rail-avatar"><Icon name="person" size={18} fill={1} color="#94A8B2" /></div>
            {!expanded && <span className="mad-rail-badge">ORG</span>}
          </div>
          {expanded && (
            <div className="mad-rail-profile-text">
              <span className="mad-rail-profile-role">MyAdmin</span>
              <span className="mad-rail-profile-name">Module</span>
            </div>
          )}
        </div>

        {MYADMIN_ITEMS.map((item) => {
          const body = (
            <>
              <Icon name={item.icon} size={20} fill={item.key === "dashboard" ? 1 : 0} />
              <span>{item.label}</span>
            </>
          );
          return item.href ? (
            <a key={item.key} href={item.href} className={`mad-rail-item${item.key === "dashboard" ? " active" : ""}`}>
              {body}
            </a>
          ) : (
            <button key={item.key} type="button" className="mad-rail-item">
              {body}
            </button>
          );
        })}

        <div className="mad-rail-divider" />
        <div className="mad-rail-footer">
          <a href="../org-dashboard/index.html" className="mad-rail-item mad-rail-signout">
            <Icon name="logout" size={20} />
            {expanded && <span>Back to Home</span>}
          </a>
        </div>
      </nav>
      <button type="button" className="mad-rail-toggle" onClick={() => setExpanded((value) => !value)} aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}>
        <Icon name="chevron_left" size={16} />
      </button>
    </div>
  );
}

function App() {
  return (
    <div className="mad-shell">
      <Rail />
      <main className="mad-main">
        <div className="mad-topbar">
          <OrgSwitcher orgs={D.orgs} initialId={D.org.id} />
          <div className="mad-topbar-spacer" />
          <div style={{ fontSize: 12, color: "var(--fg-tertiary)" }}>MyAdmin module</div>
          <button className="mad-iconbtn" type="button" aria-label="Notifications"><Icon name="notifications" size={18} /></button>
        </div>
        <div className="mad-content">
          <div className="mad-pagehead">
            <div>
              <h1 className="mad-title">MyAdmin Dashboard</h1>
              <div className="mad-subtitle">Module shell wired from the main Org Dashboard. Dashboard content is not prototyped yet.</div>
            </div>
          </div>

          <section className="mad-empty">
            <div className="mad-empty-ico"><Icon name="space_dashboard" size={28} /></div>
            <div className="mad-empty-title">MyAdmin dashboard coming next</div>
            <div className="mad-empty-sub">
              The MyAdmin module shell is now wired from the main Org Dashboard. Use the sidebar to open Vehicle, or continue designing the dashboard itself in a later pass.
            </div>
            <div className="mad-empty-actions">
              <a href="../org-vehicle-list/index.html" className="mad-btn-primary"><Icon name="local_shipping" size={16} color="#fff" /> Open Vehicle Module</a>
              <a href="../org-dashboard/index.html" className="mad-btn-secondary"><Icon name="arrow_back" size={16} /> Back to Org Dashboard</a>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

}
