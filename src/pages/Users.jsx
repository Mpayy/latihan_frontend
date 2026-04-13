import { useState, useEffect, useCallback } from "react";
import { Table, Button, Badge, Pagination, Card } from "react-bootstrap";
import { MdEdit, MdDelete, MdAdd } from "react-icons/md";
import api from "../utils/api";
import Swal from "sweetalert2";
import { defaultAvatar } from "../utils/helpers";
import EditUserModal from "../components/EditUserModal";
import CreateUserModal from "../components/CreateUserModal";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchUsers = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const response = await api.get(`/users?page=${page}`);
      setUsers(response.data.data.data);
      setPagination(response.data.data);
      setCurrentPage(page);
    } catch (error) {
      console.error("Fetch Users Error:", error);
      Swal.fire("Error", "Gagal mengambil data user", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDelete = (user) => {
    Swal.fire({
      title: "Hapus User?",
      text: `Apakah Anda yakin ingin menghapus ${user.name}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Ya, Hapus!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/users/${user.id}`);
          Swal.fire("Berhasil", "User berhasil dihapus", "success");
          fetchUsers(currentPage);
        } catch (error) {
          console.error("Delete User Error:", error);
          Swal.fire("Error", error.response?.data?.message || "Gagal menghapus user", "error");
        }
      }
    });
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleCreate = () => {
    setShowCreateModal(true);
  };

  const handlePageChange = (page) => {
    fetchUsers(page);
  };

  return (
    <div className="users-page">
      <Card className="glass-card mb-4">
        <Card.Body className="glass-card-body">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h4 className="fw-bold m-0">Data User</h4>
              <Badge bg="primary" className="mt-1">Total: {pagination.total || 0}</Badge>
            </div>
            <Button variant="primary" className="btn-gradient d-flex align-items-center gap-2" onClick={handleCreate}>
              <MdAdd size={20} />
              <span>Tambah User</span>
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="align-middle">
                <thead>
                  <tr>
                    <th>Avatar</th>
                    <th>Nama</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Bergabung</th>
                    <th className="text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <img
                          src={user.profile_url || defaultAvatar(user.username)}
                          alt={user.name}
                          className="rounded-circle"
                          style={{ width: "40px", height: "40px", objectFit: "cover" }}
                        />
                      </td>
                      <td className="fw-semibold">{user.name}</td>
                      <td>@{user.username}</td>
                      <td>{user.email}</td>
                      <td>
                        {user.is_admin ? (
                          <Badge bg="danger">Admin</Badge>
                        ) : (
                          <Badge bg="info">User</Badge>
                        )}
                      </td>
                      <td className="small text-muted">
                        {new Date(user.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td>
                        <div className="d-flex gap-2 justify-content-center">
                          <Button 
                            variant="outline-primary" 
                            size="sm"
                            onClick={() => handleEdit(user)}
                          >
                            <MdEdit size={18} />
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => handleDelete(user)}
                          >
                            <MdDelete size={18} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {!loading && pagination.last_page > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <Pagination>
                <Pagination.Prev 
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                />
                {[...Array(pagination.last_page)].map((_, i) => (
                  <Pagination.Item
                    key={i + 1}
                    active={i + 1 === currentPage}
                    onClick={() => handlePageChange(i + 1)}
                  >
                    {i + 1}
                  </Pagination.Item>
                ))}
                <Pagination.Next 
                  disabled={currentPage === pagination.last_page}
                  onClick={() => handlePageChange(currentPage + 1)}
                />
              </Pagination>
            </div>
          )}
        </Card.Body>
      </Card>

      {selectedUser && (
        <EditUserModal
          show={showEditModal}
          onHide={() => setShowEditModal(false)}
          user={selectedUser}
          onSuccess={() => {
            setShowEditModal(false);
            fetchUsers(currentPage);
          }}
        />
      )}

      <CreateUserModal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        onSuccess={() => {
          setShowCreateModal(false);
          fetchUsers(1); // Kembali ke halaman 1 setelah tambah user baru
        }}
      />
    </div>
  );
}
