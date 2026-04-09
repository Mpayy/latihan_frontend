import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Profile from "./pages/Profile";

function App() {
  // Mock auth state - nanti bisa diganti dengan Context/Redux
  const isAuthenticated = true;

  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route element={isAuthenticated ? <MainLayout /> : <Navigate to="/" />}>
        <Route path="/home" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/user/:username" element={<Profile />} />
        <Route
          path="/search"
          element={<div className="p-4 fw-bold">Halaman Pencarian (WIP)</div>}
        />
        <Route
          path="/create"
          element={<div className="p-4 fw-bold">Halaman Buat Post (WIP)</div>}
        />
      </Route>
    </Routes>


  );
}

export default App;
