import { Link, NavLink } from 'react-router';
import '../NavBar.css';

export default function NavBar() {
  return (
    <div style={{ background: '#174a68' }}>
      <nav
        className="navbar"
        aria-label="Navigation principale"
        style={{ color: '#fff', borderBottom: 'none' }}
      >
        <Link className="navbar__brand" to="/movies" style={{ color: '#fff' }}>
          TMDB DISCOVERY
        </Link>

        <ul className="navbar__links">
          <li>
            <NavLink
              className="navbar__link"
              to="/movies"
              style={({ isActive }) => ({
                color: '#fff',
                fontWeight: 700,
                padding: '7px 13px',
                border: isActive
                  ? '1px solid #b9e0e5'
                  : '1px solid transparent',
                borderRadius: 18,
                textDecoration: 'none',
              })}
            >
              Films populaires
            </NavLink>
          </li>
          <li>
            <NavLink
              className="navbar__link"
              to="/about"
              style={({ isActive }) => ({
                color: '#fff',
                fontWeight: 700,
                textDecoration: isActive ? 'underline' : 'none',
              })}
            >
              À propos
            </NavLink>
          </li>
        </ul>
      </nav>
    </div>
  );
}
