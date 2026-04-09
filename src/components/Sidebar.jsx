import { NavLink } from "react-router-dom";
import { MdHome, MdSearch, MdAddBox, MdPerson } from "react-icons/md";

export default function Sidebar() {
  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <span className="text-primary">Sys</span>Media
      </div>
      <NavLink
        to="/home"
        className={({ isActive }) =>
          `nav-link-item ${isActive ? "active" : ""}`
        }
      >
        <MdHome className="icon" />
        <span className="sidebar-text">Beranda</span>
      </NavLink>
      {/* Nanti ini bisa modal atau halaman search */}
      <NavLink
        to="/search"
        className={({ isActive }) =>
          `nav-link-item ${isActive ? "active" : ""}`
        }
      >
        <MdSearch className="icon" />
        <span className="sidebar-text">Cari</span>
      </NavLink>
      <NavLink
        to="/create"
        className={({ isActive }) =>
          `nav-link-item ${isActive ? "active" : ""}`
        }
      >
        <MdAddBox className="icon" />
        <span className="sidebar-text">Buat</span>
      </NavLink>
      <NavLink
        to="/profile"
        className={({ isActive }) =>
          `nav-link-item ${isActive ? "active" : ""}`
        }
      >
        <MdPerson className="icon" />
        <span className="sidebar-text">Profil</span>
      </NavLink>
    </div>
  );
}
