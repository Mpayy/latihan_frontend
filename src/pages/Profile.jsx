import { useParams, useNavigate } from "react-router-dom";
import { Button, Modal, Form, Spinner } from "react-bootstrap";
import { useState, useEffect, useCallback } from "react";
import api from "../utils/api";
import Swal from "sweetalert2";

// Import Komponen & Helpers
import PostCard from "../components/Post/PostCard";
import CommentModal from "../components/Post/CommentModal";
import EditPostModal from "../components/Post/EditPostModal";
import { defaultAvatar } from "../utils/helpers";

// Import Hooks
import { usePosts } from "../hooks/usePosts";
import { useComments } from "../hooks/useComments";

export default function Profile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [authUserInfo, setAuthUserInfo] = useState(
    JSON.parse(localStorage.getItem("user")),
  );
  const isMe =
    !username ||
    username === "me" ||
    (authUserInfo && username === authUserInfo.username);

  // --- HOOKS ---
  const { 
    posts, loading: loadingPosts, btnLoading, fetchPosts, deletePost, updatePost, likePost 
  } = usePosts();

  const { 
    comments, loading: commentLoading, submitting: isSubmittingComment,
    fetchComments, submitComment, deleteComment 
  } = useComments();

  // --- PROFILE SPECIFIC STATE ---
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followModal, setFollowModal] = useState({ show: false, type: "", title: "" });
  const [followList, setFollowList] = useState([]);
  const [followPage, setFollowPage] = useState(1);
  const [hasMoreFollow, setHasMoreFollow] = useState(false);
  const [loadingFollow, setLoadingFollow] = useState(false);

  // Edit Profile State
  const [showEditModal, setShowEditModal] = useState(false);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", username: "", bio: "", profile_picture: null });
  const [previewImage, setPreviewImage] = useState(null);

  // Post/Comment UI State
  const [showEditPostModal, setShowEditPostModal] = useState(false);
  const [editPostData, setEditPostData] = useState(null);
  const [editCaption, setEditCaption] = useState("");
  const [editImage, setEditImage] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(null);

  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [commentBody, setCommentBody] = useState("");
  const [commentImage, setCommentImage] = useState(null);
  const [commentFile, setCommentFile] = useState(null);
  const [commentImagePreview, setCommentImagePreview] = useState(null);
  const [editingComment, setEditingComment] = useState(null);

  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

  // --- PROFILE LOGIC ---
  const fetchProfile = useCallback(async () => {
    try {
      const url = username ? `/profile?username=${username}` : `/profile`;
      const res = await api.get(url);
      setUser(res.data.data);
      setIsFollowing(res.data.data.is_followed || false);
    } catch (error) {
      console.error("Error fetching profile:", error);
      Swal.fire("Error", "Gagal memuat profil.", "error");
    } finally {
      setLoading(false);
    }
  }, [username]);

  const loadPosts = useCallback(() => {
    const url = username ? `/profile/posts?username=${username}` : "/profile/posts";
    fetchPosts(url);
  }, [username, fetchPosts]);

  useEffect(() => {
    fetchProfile();
    loadPosts();
  }, [username, fetchProfile, loadPosts]);

  const handleToggleFollow = async () => {
    try {
      const res = await api.post(`/users/${user.id}/follows`);
      setIsFollowing(res.data.data.followed);
      fetchProfile();
    } catch (error) {
      Swal.fire("Error", "Gagal melakukan aksi follow", "error");
    }
  };

  // Follower List Logic
  const fetchFollowList = async (type, page) => {
    setLoadingFollow(true);
    try {
      const res = await api.get(`/users/${user.id}/${type}?page=${page}`);
      const newData = res.data.data.data;
      setFollowList((prev) => (page === 1 ? newData : [...prev, ...newData]));
      setHasMoreFollow(res.data.data.next_page_url !== null);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingFollow(false);
    }
  };

  const openFollowModal = (type) => {
    const title = type === "followers" ? "Pengikut" : "Diikuti";
    setFollowModal({ show: true, type, title });
    setFollowList([]);
    setFollowPage(1);
    fetchFollowList(type, 1);
  };

  // Edit Profile Logic
  const handleEditOpen = () => {
    setEditForm({ name: user.name, username: user.username, bio: user.bio || "", profile_picture: null });
    setPreviewImage(user.profile_url);
    setShowEditModal(true);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoadingUpdate(true);
    const formData = new FormData();
    formData.append("name", editForm.name);
    formData.append("username", editForm.username);
    formData.append("bio", editForm.bio);
    if (editForm.profile_picture) formData.append("profile_picture", editForm.profile_picture);
    formData.append("_method", "PUT");

    try {
      const res = await api.post("/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUser(res.data.data);
      setShowEditModal(false);
      localStorage.setItem("user", JSON.stringify(res.data.data));
      setAuthUserInfo(res.data.data);
      if (res.data.data.username !== user.username) {
        navigate(`/user/${res.data.data.username}`);
      }
      Swal.fire({ icon: "success", title: "Profil diperbarui", timer: 2000, showConfirmButton: false });
    } catch (error) {
      Swal.fire("Error", "Gagal memperbarui profil", "error");
    } finally {
      setLoadingUpdate(false);
    }
  };

  // --- POST & COMMENT HANDLERS ---
  const handleLike = (postId) => {
    likePost(postId);
  };

  const handleDeletePost = (postId) => {
    deletePost(postId).then(() => {
      loadPosts();
      fetchProfile();
    });
  };

  const openEditPostModal = (post) => {
    setEditPostData(post);
    setEditCaption(post.caption || "");
    setEditImagePreview(post.image_url || null);
    setEditImage(null);
    setShowEditPostModal(true);
  };

  const handleUpdatePost = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("caption", editCaption);
    if (editImage) formData.append("image", editImage);
    formData.append("_method", "PUT");
    updatePost(editPostData.id, formData, () => {
      setShowEditPostModal(false);
      loadPosts();
    });
  };

  const openCommentModal = (post) => {
    setSelectedPost(post);
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

  const handleCreateComment = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("body", commentBody);
    if (commentImage) formData.append("image", commentImage);
    if (commentFile) formData.append("file", commentFile);

    submitComment({
      postId: selectedPost.id,
      commentId: editingComment?.id,
      formData,
      onSuccess: () => {
        setCommentBody("");
        clearCommentAttachments();
        setEditingComment(null);
        loadPosts();
      }
    });
  };

  if (loading) return <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>;
  if (!user) return <div className="text-center py-5">User not found</div>;

  return (
    <div className="profile-page animate__animated animate__fadeIn">
      {/* HEADER PROFIL */}
      <div className="glass-card mb-5 p-4 border rounded shadow-sm bg-white">
        <div className="d-flex flex-column align-items-center text-center">
          <img
            src={user.profile_url || `https://ui-avatars.com/api/?name=${user.name}&background=random&size=128`}
            alt={user.name}
            className="rounded-circle mb-3 shadow"
            width="128" height="128"
          />
          <h3 className="fw-bold mb-1">{user.name}</h3>
          <p className="text-muted mb-4">@{user.username}</p>
          {user.bio && <p className="mb-4 text-secondary mx-auto" style={{ maxWidth: "450px" }}>{user.bio}</p>}

          <div className="d-flex gap-4 mb-4">
            <div className="text-center">
              <strong className="d-block h5 mb-0 text-primary">{user.posts_count}</strong>
              <span className="small text-muted">Postingan</span>
            </div>
            <div className="text-center cursor-pointer" onClick={() => openFollowModal("followers")} style={{ cursor: "pointer" }}>
              <strong className="d-block h5 mb-0 text-primary">{user.followers_count}</strong>
              <span className="small text-muted">Pengikut</span>
            </div>
            <div className="text-center cursor-pointer" onClick={() => openFollowModal("following")} style={{ cursor: "pointer" }}>
              <strong className="d-block h5 mb-0 text-primary">{user.following_count}</strong>
              <span className="small text-muted">Diikuti</span>
            </div>
          </div>

          <div className="d-flex gap-2">
            {isMe ? (
              <Button className="rounded-pill px-5" onClick={handleEditOpen}>Edit Profil</Button>
            ) : (
              <Button variant={isFollowing ? "outline-secondary" : "primary"} className="rounded-pill px-5" onClick={handleToggleFollow}>
                {isFollowing ? "Berhenti Mengikuti" : "Ikuti"}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* DAFTAR POSTINGAN USER */}
      <div className="posts-list">
        {loadingPosts ? (
          <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
        ) : posts.length > 0 ? (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUser={authUserInfo}
              onLike={handleLike}
              onComment={openCommentModal}
              onEdit={openEditPostModal}
              onDelete={handleDeletePost}
            />
          ))
        ) : (
          <div className="text-center py-5 bg-white border rounded">
            <p className="text-muted m-0">Belum ada postingan</p>
          </div>
        )}
      </div>

      {/* MODAL EDIT PROFIL */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold">Edit Profil</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleUpdateProfile}>
            <div className="text-center mb-3">
              <img src={previewImage} alt="preview" className="rounded-circle mb-2" width="100" height="100" />
              <Form.Control type="file" size="sm" onChange={(e) => {
                const f = e.target.files[0];
                if (f) { setEditForm({...editForm, profile_picture: f}); setPreviewImage(URL.createObjectURL(f)); }
              }} />
            </div>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">Nama Lengkap</Form.Label>
              <Form.Control value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">Username</Form.Label>
              <Form.Control value={editForm.username} onChange={e => setEditForm({...editForm, username: e.target.value})} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">Bio</Form.Label>
              <Form.Control as="textarea" rows={3} value={editForm.bio} onChange={e => setEditForm({...editForm, bio: e.target.value})} />
            </Form.Group>
            <div className="d-flex justify-content-end gap-2 mt-4">
              <Button variant="light" onClick={() => setShowEditModal(false)}>Batal</Button>
              <Button variant="primary" type="submit" disabled={loadingUpdate}>
                {loadingUpdate ? <Spinner size="sm" /> : "Simpan"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* MODAL FOLLOW LIST */}
      <Modal show={followModal.show} onHide={() => setFollowModal({ ...followModal, show: false })} centered scrollable>
        <Modal.Header closeButton className="border-0 shadow-sm">
          <Modal.Title className="h6 fw-bold">{followModal.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0" style={{ height: "400px" }}>
          {loadingFollow && followPage === 1 ? (
            <div className="text-center py-5"><Spinner animation="border" size="sm" /></div>
          ) : followList.length > 0 ? (
            <div className="p-2">
              {followList.map((u) => (
                <div key={u.id} className="d-flex align-items-center gap-3 p-2 hover-bg-light cursor-pointer" onClick={() => {
                  setFollowModal({ ...followModal, show: false });
                  navigate(`/user/${u.username}`);
                }}>
                  <img src={u.profile_url || defaultAvatar(u.username)} alt={u.name} className="rounded-circle" width="40" height="40" />
                  <div>
                    <div className="fw-bold small">{u.name}</div>
                    <div className="text-muted" style={{ fontSize: "11px" }}>@{u.username}</div>
                  </div>
                </div>
              ))}
              {hasMoreFollow && (
                <div className="text-center p-3">
                  <Button variant="link" size="sm" onClick={() => {
                    const next = followPage + 1;
                    setFollowPage(next);
                    fetchFollowList(followModal.type, next);
                  }}>Muat lebih banyak</Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-5 text-muted small">Tidak ada data</div>
          )}
        </Modal.Body>
      </Modal>

      {/* REUSED MODALS */}
      <EditPostModal
        show={showEditPostModal}
        onHide={() => setShowEditPostModal(false)}
        postData={editPostData}
        caption={editCaption}
        setCaption={setEditCaption}
        imagePreview={editImagePreview}
        onSubmit={handleUpdatePost}
        loading={btnLoading}
        onImageChange={(e) => {
          const f = e.target.files[0];
          if (f) { setEditImage(f); setEditImagePreview(URL.createObjectURL(f)); }
        }}
        onFileChange={(e) => setEditFile(e.target.files[0])}
      />

      <CommentModal
        show={showCommentModal}
        onHide={() => setShowCommentModal(false)}
        post={selectedPost}
        comments={comments}
        loading={commentLoading}
        currentUser={authUserInfo}
        editingComment={editingComment}
        setEditingComment={setEditingComment}
        commentBody={commentBody}
        setCommentBody={setCommentBody}
        onSubmit={handleCreateComment}
        onDelete={(id) => deleteComment(id, selectedPost.id, () => {
          loadPosts();
          fetchProfile(); // Also refresh profile to update post count if necessary
        })}
        onEdit={(comment) => {
          setEditingComment(comment);
          setCommentBody(comment.body || "");
          setCommentImagePreview(comment.image_url || null);
        }}
        isSubmitting={isSubmittingComment}
        commentImagePreview={commentImagePreview}
        onImageChange={(e) => {
          const f = e.target.files[0];
          if (f) { setCommentImage(f); setCommentImagePreview(URL.createObjectURL(f)); }
        }}
        onClearAttachments={clearCommentAttachments}
      />
    </div>
  );
}
