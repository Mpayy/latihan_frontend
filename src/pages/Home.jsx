import { useState, useEffect } from "react";
import {
  MdFavoriteBorder,
  MdFavorite,
  MdChatBubbleOutline,
  MdMoreHoriz,
  MdImage,
  MdAttachFile,
  MdClose,
  MdEdit,
  MdDelete,
  MdSend,
} from "react-icons/md";
import { Spinner, Form, Button, Dropdown, Modal } from "react-bootstrap";
import api from "../utils/api";
import Swal from "sweetalert2";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);
  const [caption, setCaption] = useState("");

  // Current User for protection
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  // File states for "Create Post"
  const [image, setImage] = useState(null);
  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // States for "Edit Post" Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editPostData, setEditPostData] = useState(null);
  const [editCaption, setEditCaption] = useState("");
  const [editImage, setEditImage] = useState(null);
  const [editFile, setEditFile] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(null);

  // States for "Comments" Modal
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentBody, setCommentBody] = useState("");
  const [commentImage, setCommentImage] = useState(null);
  const [commentFile, setCommentFile] = useState(null);
  const [commentImagePreview, setCommentImagePreview] = useState(null);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [editingComment, setEditingComment] = useState(null); // Mode Edit untuk komentar

  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

  // Placeholder avatar jika profile_photo null
  const defaultAvatar = (seed) =>
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;

  const fetchPost = async () => {
    try {
      const res = await api.get("/posts");
      const postData = res.data.data.data || [];
      setPosts(postData);
    } catch (error) {
      console.error("Fetch Error:", error);
      Swal.fire(
        "Error",
        "Gagal memuat postingan. Pastikan Anda sudah login.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  // --- CREATE POST HANDLERS ---
  const handleImageChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      if (selected.size > MAX_FILE_SIZE) {
        Swal.fire("Data terlalu besar", "Maksimal ukuran gambar adalah 2MB", "error");
        e.target.value = "";
        return;
      }
      setImage(selected);
      setImagePreview(URL.createObjectURL(selected));
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      if (selected.size > MAX_FILE_SIZE) {
        Swal.fire("Data terlalu besar", "Maksimal ukuran file adalah 2MB", "error");
        e.target.value = "";
        return;
      }
      setFile(selected);
    }
  };

  const clearAttachments = () => {
    setImage(null);
    setFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!caption.trim() && !image && !file) return;

    setBtnLoading(true);
    const formData = new FormData();
    formData.append("caption", caption);
    if (image) formData.append("image", image);
    if (file) formData.append("file", file);

    try {
      await api.post("/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Postingan berhasil dikirim",
        timer: 1500,
        showConfirmButton: false,
      });
      setCaption("");
      clearAttachments();
      fetchPost();
    } catch (error) {
      Swal.fire("Error", "Gagal mengirim postingan.", "error");
    } finally {
      setBtnLoading(false);
    }
  };

  // --- DELETE & UPDATE HANDLERS ---
  const handleDeletePost = async (postId) => {
    const result = await Swal.fire({
      title: "Hapus Postingan?",
      text: "Data yang dihapus tidak dapat dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/posts/${postId}`);
        Swal.fire("Terhapus!", "Postingan berhasil dihapus.", "success");
        fetchPost();
      } catch (error) {
        Swal.fire("Error", "Gagal menghapus postingan.", "error");
      }
    }
  };

  const openEditModal = (post) => {
    setEditPostData(post);
    setEditCaption(post.caption || "");
    setEditImagePreview(post.image_url || null);
    
    // Reset state file/image baru agar tidak terbawa dari sesi edit sebelumnya
    setEditImage(null);
    setEditFile(null);
    
    setShowEditModal(true);
  };

  const handleEditImageChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      if (selected.size > MAX_FILE_SIZE) {
        Swal.fire("Data terlalu besar", "Maksimal ukuran gambar adalah 2MB", "error");
        e.target.value = "";
        return;
      }
      setEditImage(selected);
      setEditImagePreview(URL.createObjectURL(selected));
    }
  };

  const handleUpdatePost = async (e) => {
    e.preventDefault();
    setBtnLoading(true);

    const formData = new FormData();
    formData.append("caption", editCaption);
    
    // Hanya kirim file/image jika ada perubahan (user memilih file baru)
    if (editImage) formData.append("image", editImage);
    if (editFile) formData.append("file", editFile);
    
    formData.append("_method", "PUT"); // Spoofing PUT untuk Laravel FormData

    try {
      const res = await api.post(`/posts/${editPostData.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: res.data.message || "Postingan berhasil diperbarui",
        timer: 1500,
        showConfirmButton: false,
      });
      
      setShowEditModal(false);
      fetchPost();
    } catch (error) {
      console.error("Update Error details:", error.response?.data);
      const data = error.response?.data;
      let errorMsg = data?.message || "Gagal memperbarui postingan.";
      
      // Jika ada detail error validasi dari Laravel (dalam bentuk object/array)
      if (data?.data && typeof data.data === 'object') {
        const errors = Object.values(data.data).flat(); // Menggabungkan semua pesan error
        errorMsg = errors.join("\n"); // Gabungkan dengan baris baru agar rapi di Swal
      }
      
      Swal.fire({
        icon: "error",
        title: "Validasi Gagal",
        text: errorMsg,
      });
    } finally {
      setBtnLoading(false);
    }
  };

  // --- COMMENTS HANDLERS ---
  const fetchComments = async (postId) => {
    setCommentLoading(true);
    try {
      const res = await api.get(`/posts/${postId}/comments`);
      setComments(res.data.data.data || []);
    } catch (error) {
      console.error("Fetch Comments Error:", error);
    } finally {
      setCommentLoading(false);
    }
  };

  const openCommentModal = (post) => {
    setSelectedPost(post);
    setComments([]);
    setCommentBody("");
    setEditingComment(null); 
    clearCommentAttachments();
    setShowCommentModal(true);
    fetchComments(post.id);
  };

  const clearCommentAttachments = () => {
    setCommentImage(null);
    setCommentFile(null);
    if (commentImagePreview) URL.revokeObjectURL(commentImagePreview);
    setCommentImagePreview(null);
  };

  const handleCommentImageChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      if (selected.size > MAX_FILE_SIZE) {
        Swal.fire("Terlalu Besar", "Maksimal 2MB", "error");
        return;
      }
      setCommentImage(selected);
      setCommentImagePreview(URL.createObjectURL(selected));
    }
  };

  const handleCreateComment = async (e) => {
    e.preventDefault();
    if (!commentBody.trim() && !commentImage && !commentFile) return;

    setIsSubmittingComment(true);
    const formData = new FormData();
    formData.append("body", commentBody);
    if (commentImage) formData.append("image", commentImage);
    if (commentFile) formData.append("file", commentFile);

    try {
      if (editingComment) {
        // Mode Edit
        formData.append("_method", "PUT");
        await api.post(`/comments/${editingComment.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setEditingComment(null);
      } else {
        // Mode Create
        await api.post(`/posts/${selectedPost.id}/comments`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      
      setCommentBody("");
      clearCommentAttachments();
      fetchComments(selectedPost.id);
      fetchPost();
    } catch (error) {
      Swal.fire("Error", "Gagal menyimpan komentar.", "error");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const openEditComment = (comment) => {
    setEditingComment(comment);
    setCommentBody(comment.body || "");
    setCommentImagePreview(comment.image_url || null);
    setCommentImage(null);
    setCommentFile(null);
    // Focus ke input field
    document.getElementById("commentBodyInput").focus();
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await api.delete(`/comments/${commentId}`);
      fetchComments(selectedPost.id);
      fetchPost(); 
    } catch (error) {
       console.error("Delete Comment Error:", error);
    }
  };

  // --- UTILS ---
  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("id-ID", options);
  };

  const handleLike = async (postId) => {
    try {
      await api.post(`/posts/${postId}/likes`);
      fetchPost();
    } catch (error) {
      console.error("Like Error:", error);
    }
  };

  useEffect(() => {
    fetchPost();
  }, []);

  return (
    <>
      {/* --- FORM BUAT POST --- */}
      <div className="create-post-card shadow-sm border-0">
        <Form onSubmit={handleCreatePost}>
          <div className="d-flex align-items-start gap-3">
            <img
              src={defaultAvatar(currentUser.name || "me")}
              alt="my-avatar"
              className="post-avatar mt-1"
            />
            <div className="flex-grow-1">
              <Form.Control
                as="textarea"
                rows={1}
                className="bg-light border-0 px-3 py-2"
                style={{ borderRadius: "20px", resize: "none" }}
                placeholder="Apa yang Anda pikirkan?"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                disabled={btnLoading}
              />

              {/* Preview lampiran di Create Post */}
              {(imagePreview || file) && (
                <div className="mt-3 position-relative bg-light p-2 rounded border border-dashed text-center">
                  <Button
                    variant="dark"
                    size="sm"
                    className="position-absolute top-0 end-0 m-1 rounded-circle p-1"
                    style={{ zIndex: 5, width: "24px", height: "24px" }}
                    onClick={clearAttachments}
                  >
                    <MdClose size={16} />
                  </Button>
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="preview"
                      className="rounded"
                      style={{ maxHeight: "200px", maxWidth: "100%" }}
                    />
                  )}
                  {file && (
                    <div className="d-flex align-items-center justify-content-center gap-2 p-3 bg-white rounded border mx-auto" style={{ maxWidth: '300px' }}>
                      <MdAttachFile className="text-success" size={28} />
                      <div className="text-start">
                        <div className="small fw-bold text-truncate" style={{ maxWidth: '200px' }}>{file.name}</div>
                        <div className="text-muted" style={{ fontSize: '10px' }}>Lampiran siap diunggah</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
                <div className="d-flex gap-1">
                  <input
                    type="file"
                    id="imageInput"
                    accept="image/*"
                    hidden
                    onChange={handleImageChange}
                  />
                  <Button
                    variant="light"
                    className="rounded-circle p-2 text-primary border-0"
                    onClick={() => document.getElementById("imageInput").click()}
                  >
                    <MdImage size={22} />
                  </Button>

                  <input
                    type="file"
                    id="fileInput"
                    hidden
                    onChange={handleFileChange}
                  />
                  <Button
                    variant="light"
                    className="rounded-circle p-2 text-success border-0"
                    onClick={() => document.getElementById("fileInput").click()}
                  >
                    <MdAttachFile size={22} />
                  </Button>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="rounded-pill px-4 fw-bold"
                  disabled={btnLoading || (!caption.trim() && !image && !file)}
                >
                  {btnLoading ? <Spinner size="sm" /> : "Post"}
                </Button>
              </div>
            </div>
          </div>
        </Form>
      </div>

      {/* --- LIST POSTINGAN --- */}
      <div className="posts-list mt-4">
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2 text-muted">Memuat postingan...</p>
          </div>
        ) : posts.length > 0 ? (
          posts.map((post) => (
            <div key={post.id} className="post-card mb-3 shadow-sm border-light">
              <div className="post-header border-0 d-flex justify-content-between align-items-center">
                <div className="post-user d-flex align-items-center gap-2">
                  <img
                    src={
                      post.user?.profile_photo ||
                      defaultAvatar(post.user?.username || post.id)
                    }
                    alt={post.user?.name}
                    className="post-avatar"
                  />
                  <div className="d-flex flex-column">
                    <span className="fw-bold">{post.user?.name || "Anonim"}</span>
                    <span className="text-muted small">@{post.user?.username}</span>
                  </div>
                </div>

                {/* Dropdown Menu (Hanya muncul jika pemilik/admin) */}
                {(post.user_id === currentUser.id || currentUser.is_admin) && (
                  <Dropdown align="end">
                    <Dropdown.Toggle as="button" className="post-action-btn border-0 bg-transparent p-0">
                      <MdMoreHoriz size={24} />
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="shadow border-0 rounded-3">
                      {post.user_id === currentUser.id && (
                        <Dropdown.Item className="small py-2 d-flex align-items-center gap-2" onClick={() => openEditModal(post)}>
                          <MdEdit className="text-primary" size={18} /> Ubah
                        </Dropdown.Item>
                      )}
                      <Dropdown.Item className="small py-2 d-flex align-items-center gap-2 text-danger" onClick={() => handleDeletePost(post.id)}>
                        <MdDelete size={18} /> Hapus
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                )}
              </div>

              <div className="post-content px-3 py-2">{post.caption}</div>

              {post.image_url && (
                <div className="post-media mb-2 text-center bg-gray-50 border-y py-1">
                  <img src={post.image_url} alt="post-img" className="img-fluid" style={{ maxHeight: "400px" }} />
                </div>
              )}

              {/* Tampilkan Link File jika ada */}
              {post.file_url && (
                <div className="px-3 pb-3">
                  <a
                    href={post.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="d-flex align-items-center gap-2 p-2 bg-light rounded text-decoration-none text-dark border"
                  >
                    <MdAttachFile className="text-primary" size={20} />
                    <span className="small fw-semibold">Lihat Lampiran (File)</span>
                  </a>
                </div>
              )}

              <div className="post-actions px-3 mt-2 border-0 d-flex gap-3">
                <button
                  className="post-action-btn border-0 bg-transparent p-0"
                  style={{ color: post.is_liked ? "#ef4444" : "inherit" }}
                  onClick={() => handleLike(post.id)}
                >
                  {post.is_liked ? <MdFavorite size={24} /> : <MdFavoriteBorder size={24} />}
                </button>
                <button className="post-action-btn border-0 bg-transparent p-0" onClick={() => openCommentModal(post)}>
                  <MdChatBubbleOutline size={22} />
                  <span className="ms-1 small">{post.comments_count || 0}</span>
                </button>
              </div>

              <div className="post-likes px-3 mt-1 small fw-bold">{post.likes_count || 0} Suka</div>
              <div className="post-time px-3 text-muted mt-2 mb-3" style={{ fontSize: "11px" }}>{formatDate(post.created_at)}</div>
            </div>
          ))
        ) : (
          <div className="text-center py-5 text-muted bg-white rounded shadow-sm border">
            <h5>Belum ada postingan</h5>
            <p>Jadilah yang pertama untuk berbagi cerita!</p>
          </div>
        )}
      </div>

      {/* --- MODAL EDIT POST --- */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered className="border-0">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold h5">Ubah Postingan</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-3">
          <Form onSubmit={handleUpdatePost}>
            <Form.Group className="mb-3">
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Edit caption..."
                value={editCaption}
                onChange={(e) => setEditCaption(e.target.value)}
                className="border-light bg-light rounded-3"
              />
            </Form.Group>

            {/* Preview Gambar/File Saat Edit */}
            {(editImagePreview || editFile || (editPostData && editPostData.file_url)) && (
              <div className="mb-3 position-relative p-2 bg-light rounded border border-dashed text-center">
                {editImagePreview && (
                  <img src={editImagePreview} alt="preview" className="rounded" style={{ maxHeight: "200px", maxWidth: "100%" }} />
                )}
                
                {/* Preview Info File di Modal (Tampil meskipun ada gambar) */}
                {(editFile || (editPostData && editPostData.file_url)) && (
                  <div className="d-flex align-items-center justify-content-center gap-2 p-2 bg-white rounded border shadow-sm mt-2">
                    <MdAttachFile className="text-success" size={24} />
                    <span className="small fw-bold text-truncate" style={{ maxWidth: '200px' }}>
                      {editFile ? editFile.name : (editPostData.file_url.split('/').pop() || "File terlampir")}
                    </span>
                  </div>
                )}

                <div className="mt-2 d-flex justify-content-center gap-2">
                   <Button variant="outline-primary" size="sm" onClick={() => document.getElementById("editImageInput").click()}>Ganti Gambar</Button>
                   <Button variant="outline-success" size="sm" onClick={() => document.getElementById("editFileInput").click()}>Ganti File</Button>
                </div>
              </div>
            )}

            <input type="file" id="editImageInput" hidden accept="image/*" onChange={handleEditImageChange} />
            <input type="file" id="editFileInput" hidden onChange={(e) => {
              const selected = e.target.files[0];
              if (selected) {
                if (selected.size > MAX_FILE_SIZE) {
                  Swal.fire("Data terlalu besar", "Maksimal ukuran file adalah 2MB", "error");
                  e.target.value = "";
                  return;
                }
                setEditFile(selected);
              }
            }} />

            <div className="d-flex justify-content-end gap-2 mt-4">
              <Button variant="light" className="rounded-pill px-4" onClick={() => setShowEditModal(false)}>Batal</Button>
              <Button variant="primary" type="submit" className="rounded-pill px-4" disabled={btnLoading}>
                {btnLoading ? <Spinner size="sm" /> : "Simpan Perubahan"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* --- MODAL KOMENTAR (BUBBLE CHAT STYLE) --- */}
      <Modal show={showCommentModal} onHide={() => setShowCommentModal(false)} centered size="md" className="comment-modal">
        <Modal.Header closeButton className="border-0 shadow-sm z-3">
          <Modal.Title className="fw-bold h6">Komentar</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0 bg-light" style={{ height: '450px', overflowY: 'auto', display: 'flex', flexDirection: 'column-reverse' }}>
          <div className="p-3">
            {commentLoading ? (
               <div className="text-center py-5"><Spinner animation="border" size="sm" variant="primary" /></div>
            ) : comments.length > 0 ? (
               comments.map(comment => (
                 <div key={comment.id} className="d-flex align-items-start gap-2 mb-3">
                    <img 
                      src={comment.user?.profile_photo || defaultAvatar(comment.user?.username)} 
                      className="rounded-circle" width="32" height="32" 
                      alt="avatar" 
                    />
                    <div className="flex-grow-1">
                       <div className="bg-white p-2 rounded-3 shadow-sm border inline-block" style={{ maxWidth: '85%', display: 'inline-block' }}>
                          <div className="d-flex justify-content-between align-items-center gap-3">
                            <span className="fw-bold small" style={{ fontSize: '12px' }}>{comment.user?.name}</span>
                            {(comment.user_id === currentUser.id || currentUser.is_admin) && (
                              <div className="d-flex gap-2">
                                <button className="btn btn-link p-0 text-primary" onClick={() => openEditComment(comment)} style={{ fontSize: '10px', textDecoration: 'none' }}>Ubah</button>
                                <button className="btn btn-link p-0 text-danger" onClick={() => handleDeleteComment(comment.id)} style={{ fontSize: '10px', textDecoration: 'none' }}>Hapus</button>
                              </div>
                            )}
                          </div>
                          <div className="small mt-1" style={{ wordBreak: 'break-word' }}>{comment.body}</div>
                          
                          {comment.image_url && (
                             <img src={comment.image_url} className="img-fluid rounded mt-2 border" style={{ maxHeight: '150px' }} alt="comment-media" />
                          )}
                          
                          {comment.file_url && (
                             <a href={comment.file_url} target="_blank" rel="noreferrer" className="d-flex align-items-center gap-2 mt-2 p-1 bg-light rounded text-dark text-decoration-none border small" style={{ fontSize: '11px' }}>
                                <MdAttachFile size={14} /> Lampiran
                             </a>
                          )}
                       </div>
                       <div className="text-muted mt-1" style={{ fontSize: '10px' }}>{formatDate(comment.created_at)}</div>
                    </div>
                 </div>
               ))
            ) : (
                <div className="text-center py-5 text-muted small">Belum ada komentar.</div>
            )}
          </div>
        </Modal.Body>
        
        {/* FOOTER: INPUT KOMENTAR */}
        <Modal.Footer className="border-top-0 p-2 bg-white flex-column align-items-stretch">
           {/* Indikator Mode Edit */}
           {editingComment && (
             <div className="d-flex justify-content-between align-items-center px-2 py-1 bg-primary bg-opacity-10 rounded mb-2">
                <span className="small fw-bold text-primary" style={{ fontSize: '11px' }}>Sedang mengedit komentar...</span>
                <MdClose className="text-danger cursor-pointer" onClick={() => { setEditingComment(null); setCommentBody(""); clearCommentAttachments(); }} />
             </div>
           )}

           {/* Preview lampiran di Komentar (DIKEMBANGKAN: Bisa Multi) */}
           {(commentImagePreview || commentFile) && (
             <div className="p-2 mb-2 bg-light rounded border border-dashed d-flex align-items-center gap-3 position-relative scroll-x">
                <Button variant="dark" size="sm" className="position-absolute top-0 end-0 m-1 rounded-circle p-0" style={{ width: '18px', height: '18px', zIndex: 10 }} onClick={clearCommentAttachments}>
                  <MdClose size={12} />
                </Button>
                
                {commentImagePreview && (
                  <div className="flex-shrink-0 text-center">
                    <img src={commentImagePreview} alt="preview" height="45" className="rounded border shadow-sm" />
                    <div className="text-muted" style={{ fontSize: '8px' }}>Gambar</div>
                  </div>
                )}

                {commentFile && (
                  <div className="d-flex align-items-center gap-2 bg-white p-1 rounded border shadow-sm flex-grow-1 overflow-hidden">
                    <MdAttachFile className="text-success" size={18} />
                    <span className="small text-truncate" style={{ fontSize: '10px', maxWidth: '120px' }}>{commentFile.name}</span>
                  </div>
                )}
             </div>
           )}

           <Form onSubmit={handleCreateComment} className="d-flex align-items-center gap-2">
              <div className="d-flex gap-1">
                 <input type="file" id="commentImageInput" hidden accept="image/*" onChange={handleCommentImageChange} />
                 <Button variant="light" size="sm" className="rounded-circle p-1 border-0" onClick={() => document.getElementById("commentImageInput").click()}>
                    <MdImage size={20} className="text-primary" />
                 </Button>

                 <input type="file" id="commentFileInput" hidden onChange={(e) => {
                    const selected = e.target.files[0];
                    if (selected && selected.size > MAX_FILE_SIZE) {
                       Swal.fire("Besar", "Maks 2MB", "error");
                       return;
                    }
                    setCommentFile(selected);
                 }} />
                 <Button variant="light" size="sm" className="rounded-circle p-1 border-0" onClick={() => document.getElementById("commentFileInput").click()}>
                    <MdAttachFile size={20} className="text-success" />
                 </Button>
              </div>

              <Form.Control 
                id="commentBodyInput"
                type="text"
                placeholder={editingComment ? "Edit komentar..." : "Tulis komentar..."}
                className="bg-light border-0 px-3 py-1 rounded-pill small"
                style={{ fontSize: '14px' }}
                value={commentBody}
                onChange={(e) => setCommentBody(e.target.value)}
                autoComplete="off"
              />

              <Button type="submit" variant="primary" size="sm" className="rounded-circle p-1" disabled={isSubmittingComment || (!commentBody.trim() && !commentImage && !commentFile)}>
                 {isSubmittingComment ? <Spinner size="sm" animation="border" /> : (editingComment ? <MdSend size={20} className="text-warning" /> : <MdSend size={20} />)}
              </Button>
           </Form>
        </Modal.Footer>
      </Modal>
    </>
  );
}
