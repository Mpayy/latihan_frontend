import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Button } from "react-bootstrap";
import Swal from "sweetalert2";
import api from "../utils/api";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      const response = await api.post("/login", formData);
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.data));
      Swal.fire({
        icon: "success",
        title: "Success Login",
        text: response.data?.message || "Selamat Datang",
        timer: 2000,
        showConfirmButton: false,
      });
      navigate("/home");
    } catch (error) {
      if (error.response && error.response.status === 422) {
        setErrors(error.response.data?.errors);
      } else if (error.response.status === 401) {
        Swal.fire({
          icon: "error",
          title: "Login Gagal!",
          text: "Email atau password salah.",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    }
  };

  return (
    <div>
      <h4 className="mb-4 text-center fw-bold">Masuk</h4>
      <Form onSubmit={handleLogin}>
        <Form.Group className="mb-3">
          <Form.Label className="small fw-semibold">Email</Form.Label>
          <Form.Control
            isInvalid={!!errors?.email}
            name="email"
            type="email"
            placeholder="Masukan email"
            onChange={handleChange}
          />
          <Form.Control.Feedback type="invalid">
            {errors?.email}
          </Form.Control.Feedback>
        </Form.Group>
        <Form.Group className="mb-4">
          <Form.Label className="small fw-semibold">Password</Form.Label>
          <Form.Control
            isInvalid={!!errors?.password}
            name="password"
            type="password"
            placeholder="Masukkan password"
            onChange={handleChange}
          />
          <Form.Control.Feedback type="invalid">
            {errors?.password}
          </Form.Control.Feedback>
        </Form.Group>
        <Button variant="primary" type="submit" className="w-100 mb-3 py-2">
          Masuk
        </Button>
        <div className="text-center small">
          Belum punya akun?{" "}
          <Link
            to="/register"
            className="text-primary fw-bold text-decoration-none"
          >
            Daftar sekarang
          </Link>
        </div>
      </Form>
    </div>
  );
}
