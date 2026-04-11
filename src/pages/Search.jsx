import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { MdSearch } from "react-icons/md";
import { Spinner, Form, Tabs, Tab } from "react-bootstrap";
import api from "../utils/api";

// Import Komponen & Helpers
import PostCard from "../components/Post/PostCard";
import CommentModal from "../components/Post/CommentModal";
import EditPostModal from "../components/Post/EditPostModal";
import { defaultAvatar } from "../utils/helpers";

// Import Hooks
import { usePosts } from "../hooks/usePosts";
import { useComments } from "../hooks/useComments";

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({ users: [], posts: [] });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  // --- HOOKS ---
  const { 
    posts: hookPosts, setPosts, btnLoading, deletePost, updatePost, likePost 
  } = usePosts();

  const { 
    comments, loading: commentLoading, submitting: isSubmittingComment,
    fetchComments, submitComment, deleteComment 
  } = useComments();

  // --- UI STATE ---
  const [showEditModal, setShowEditModal] = useState(false);
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

  // Debounce Search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.trim()) handleSearch();
      else setResults({ users: [], posts: [] });
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/search?q=${encodeURIComponent(query)}`);
      setResults(res.data.data);
      // Sinkronkan post hasil search ke hookPosts agar bisa dikelola hook
      setPosts(res.data.data.posts);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLERS ---
  const handleLike = (postId) => {
    likePost(postId);
  };

  const handleDeletePost = (postId) => {
    deletePost(postId).then(() => handleSearch());
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
    setCommentImage(null); setCommentFile(null);
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
        handleSearch();
      }
    });
  };

  const openEditModal = (post) => {
    setEditPostData(post);
    setEditCaption(post.caption || "");
    setEditImagePreview(post.image_url || null);
    setEditImage(null);
    setShowEditModal(true);
  };

  const handleUpdatePost = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("caption", editCaption);
    if (editImage) formData.append("image", editImage);
    formData.append("_method", "PUT");
    updatePost(editPostData.id, formData, () => {
      setShowEditModal(false);
      handleSearch();
    });
  };

  return (
    <div className="search-page animate__animated animate__fadeIn">
      {/* Search Header */}
      <div className="glass-card mb-4 p-3 d-flex align-items-center gap-3 bg-white border rounded shadow-sm">
        <div className="search-input-wrapper flex-grow-1 position-relative">
          <MdSearch className="position-absolute ms-3 text-muted" size={24} style={{ top: '50%', transform: 'translateY(-50%)' }} />
          <Form.Control
            type="text" placeholder="Cari postingan atau orang..."
            className="ps-5 py-2 border-0 bg-light rounded-pill"
            value={query} onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        {loading && <Spinner animation="border" size="sm" variant="primary" />}
      </div>

      {query.trim() ? (
        <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-4 custom-tabs justify-content-center">
          <Tab eventKey="all" title="Semua">
             {results.users.length > 0 && (
               <div className="mb-4">
                 <h6 className="fw-bold mb-3">Orang</h6>
                 <div className="row g-3">
                    {results.users.slice(0, 4).map(user => (
                      <div key={user.id} className="col-md-6">
                        <Link to={`/user/${user.username}`} className="text-decoration-none text-dark">
                          <div className="p-3 d-flex align-items-center gap-3 bg-white border rounded hover-bg-light">
                            <img src={user.profile_url || defaultAvatar(user.username)} className="rounded-circle" width="50" height="50" alt={user.name} />
                            <div className="text-start">
                              <div className="fw-bold small">{user.name}</div>
                              <div className="text-muted" style={{fontSize: '11px'}}>@{user.username}</div>
                            </div>
                          </div>
                        </Link>
                      </div>
                    ))}
                 </div>
               </div>
             )}
             <div>
                <h6 className="fw-bold mb-3">Postingan</h6>
                {hookPosts.length > 0 ? (
                   hookPosts.map(post => <PostCard key={post.id} post={post} currentUser={currentUser} onLike={handleLike} onComment={openCommentModal} onEdit={openEditModal} onDelete={handleDeletePost} />)
                ) : <div className="text-center py-5 text-muted">Tidak ada postingan</div>}
             </div>
          </Tab>
          
          <Tab eventKey="posts" title="Postingan">
             <div className="mt-2">
                {hookPosts.length > 0 ? (
                   hookPosts.map(post => <PostCard key={post.id} post={post} currentUser={currentUser} onLike={handleLike} onComment={openCommentModal} onEdit={openEditModal} onDelete={handleDeletePost} />)
                ) : <div className="text-center py-5">Postingan tidak ditemukan</div>}
             </div>
          </Tab>

          <Tab eventKey="users" title="Orang">
             <div className="row g-3 mt-1">
                {results.users.length > 0 ? (
                   results.users.map(user => (
                    <div key={user.id} className="col-md-6">
                      <Link to={`/user/${user.username}`} className="text-decoration-none text-dark">
                        <div className="p-3 d-flex align-items-center gap-3 bg-white border rounded hover-bg-light">
                          <img src={user.profile_url || defaultAvatar(user.username)} className="rounded-circle" width="50" height="50" alt={user.name} />
                          <div className="text-start">
                            <div className="fw-bold small">{user.name}</div>
                            <div className="text-muted" style={{fontSize: '11px'}}>@{user.username}</div>
                          </div>
                        </div>
                      </Link>
                    </div>
                   ))
                ) : <div className="col-12 text-center py-5 text-muted">Orang tidak ditemukan</div>}
             </div>
          </Tab>
        </Tabs>
      ) : (
        <div className="text-center py-5 opacity-50">
           <MdSearch size={64} className="text-muted" />
           <p className="mt-2">Masukkan kata kunci...</p>
        </div>
      )}

      {/* MODALS */}
      <EditPostModal
        show={showEditModal} onHide={() => setShowEditModal(false)}
        postData={editPostData} caption={editCaption} setCaption={setEditCaption}
        imagePreview={editImagePreview} onSubmit={handleUpdatePost} loading={btnLoading}
        onImageChange={(e) => {
          const f = e.target.files[0];
          if(f) { setEditImage(f); setEditImagePreview(URL.createObjectURL(f)); }
        }}
        onFileChange={(e) => setEditFile(e.target.files[0])}
      />

      <CommentModal
        show={showCommentModal} onHide={() => setShowCommentModal(false)}
        post={selectedPost} comments={comments} loading={commentLoading}
        currentUser={currentUser} editingComment={editingComment} setEditingComment={setEditingComment}
        commentBody={commentBody} setCommentBody={setCommentBody}
        onSubmit={handleCreateComment} onDelete={(id) => deleteComment(id, selectedPost.id, () => handleSearch())}
        onEdit={(c) => { 
          setEditingComment(c); setCommentBody(c.body || ""); setCommentImagePreview(c.image_url || null);
          setTimeout(() => document.getElementById("commentBodyInput")?.focus(), 100);
        }}
        isSubmitting={isSubmittingComment} commentImagePreview={commentImagePreview}
        onImageChange={(e) => {
          const f = e.target.files[0];
          if(f) { setCommentImage(f); setCommentImagePreview(URL.createObjectURL(f)); }
        }}
        onClearAttachments={clearCommentAttachments}
      />
    </div>
  );
}
