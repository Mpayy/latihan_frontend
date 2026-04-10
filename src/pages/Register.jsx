import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Button } from "react-bootstrap";
import Swal from "sweetalert2";
import api from "../utils/api";

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  const [errors, setErrors] = useState({});
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      await api.post("/register", formData);
      Swal.fire({
        icon: "success",
        title: "Registrasi Berhasil!",
        text: "Silakan login dengan akun Anda.",
        timer: 1500,
        showConfirmButton: false,
      });
      navigate("/login");
    } catch (error) {
      if (error.response && error.response.status === 422) {
        setErrors(error.response.data?.errors);
      } else if (error.response.status === 401) {
        Swal.fire({
          icon: "error",
          title: "Registrasi Gagal!",
          text: "Email sudah terdaftar.",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    }
  };

  return (
    <div>
      <h4 className="mb-4 text-center fw-bold">Daftar Akun</h4>
      <Form onSubmit={handleRegister}>
        <Form.Group className="mb-3">
          <Form.Label className="small fw-semibold">Nama Lengkap</Form.Label>
          <Form.Control
            type="text"
            placeholder="Masukan nama"
            name="name"
            onChange={handleChange}
            isInvalid={!!errors?.name}
          />
          <Form.Control.Feedback type="invalid">
            {errors?.name}
          </Form.Control.Feedback>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label className="small fw-semibold">Username</Form.Label>
          <Form.Control
            type="text"
            placeholder="Masukan username"
            name="username"
            onChange={handleChange}
            isInvalid={!!errors?.username}
          />
          <Form.Control.Feedback type="invalid">
            {errors?.username}
          </Form.Control.Feedback>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label className="small fw-semibold">Email</Form.Label>
          <Form.Control
            type="email"
            placeholder="Masukan email"
            name="email"
            onChange={handleChange}
            isInvalid={!!errors?.email}
          />
          <Form.Control.Feedback type="invalid">
            {errors?.email}
          </Form.Control.Feedback>
        </Form.Group>
        <Form.Group className="mb-4">
          <Form.Label className="small fw-semibold">Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Masukan password"
            name="password"
            onChange={handleChange}
            isInvalid={!!errors?.password}
          />
          <Form.Control.Feedback type="invalid">
            {errors?.password}
          </Form.Control.Feedback>
        </Form.Group>
        <Form.Group className="mb-4">
          <Form.Label className="small fw-semibold">
            Konfirmasi Password
          </Form.Label>
          <Form.Control
            type="password"
            placeholder="Konfirmasi password"
            name="password_confirmation"
            onChange={handleChange}
            isInvalid={!!errors?.password_confirmation}
          />
          <Form.Control.Feedback type="invalid">
            {errors?.password_confirmation}
          </Form.Control.Feedback>
        </Form.Group>
        <Button variant="primary" type="submit" className="w-100 mb-3 py-2">
          Daftar
        </Button>
        <div className="text-center small">
          Sudah punya akun?{" "}
          <Link
            to="/"
            className="text-primary fw-bold text-decoration-none"
          >
            Masuk di sini
          </Link>
        </div>
      </Form>
    </div>
  );
}
