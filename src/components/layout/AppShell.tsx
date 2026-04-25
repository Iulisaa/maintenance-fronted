import { useEffect, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import './AppShell.css';

type ThemeMode = 'light' | 'dark';

const navItems = [
  { to: '/my-tasks', label: 'My Tasks' },
  { to: '/equipments', label: 'Equipments' },
  { to: '/engineers', label: 'Engineers' },
];

function getInitialTheme(): ThemeMode {
  const savedTheme = localStorage.getItem('theme-mode');

  if (savedTheme === 'light' || savedTheme === 'dark') {
    return savedTheme;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function AppShell() {
  const [theme, setTheme] = useState<ThemeMode>(() => getInitialTheme());

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme-mode', theme);
  }, [theme]);

  const isDark = theme === 'dark';

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'));
  };

  return (
    <div className="app-shell-layout">
      <aside className="app-shell-sidebar">
        <div className="app-shell-sidebar__brand">
          <div className="app-shell-sidebar__logo">SWB</div>

          <div>

            <h1 className="app-shell-sidebar__title">MaintOps by Sweetbug Solutions</h1>
          </div>
        </div>

        <nav className="app-shell-sidebar__nav" aria-label="Primary navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive
                  ? 'app-shell-sidebar__link app-shell-sidebar__link--active'
                  : 'app-shell-sidebar__link'
              }
            >
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="app-shell-sidebar__footer">
          <div className="app-shell-sidebar__theme">
            <div>
              <p className="app-shell-sidebar__theme-label">Appearance</p>
              <p className="app-shell-sidebar__theme-value">
                {isDark ? 'Dark mode' : 'Light mode'}
              </p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={isDark}
              className={
                isDark
                  ? 'app-shell-sidebar__switch app-shell-sidebar__switch--active'
                  : 'app-shell-sidebar__switch'
              }
              onClick={toggleTheme}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <span className="app-shell-sidebar__switch-thumb" />
            </button>
          </div>
        </div>
      </aside>

      <main className="app-shell-main">
        <Outlet />
      </main>
    </div>
  );
}