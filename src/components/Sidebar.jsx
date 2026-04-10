import { NavLink, useNavigate } from "react-router-dom";
import { MdHome, MdSearch, MdAddBox, MdPerson, MdLogout } from "react-icons/md";
import api from "../utils/api";
import Swal from "sweetalert2";

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    Swal.fire({
      title: "Logout",
      text: "Apakah Anda yakin ingin keluar?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#3b82f6",
      confirmButtonText: "Ya, Keluar!",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Panggil API Logout di backend
          await api.post("/logout");
        } catch (error) {
          console.error("Logout API Error:", error);
        } finally {
          // Tetap hapus local storage & redirect meskipun API gagal
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/");
        }
      }
    });
  };
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

      <div className="mt-auto pt-3 border-top w-100">
        <button
          onClick={handleLogout}
          className="nav-link-item w-100 border-0 bg-transparent text-danger"
          style={{ cursor: "pointer" }}
        >
          <MdLogout className="icon" />
          <span className="sidebar-text fw-bold">Logout</span>
        </button>
      </div>
    </div>
  );
}
