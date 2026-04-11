import { useState, useEffect } from "react";
import Swal from "sweetalert2";

// Import Komponen & Helpers
import PostCard from "../components/Post/PostCard";
import CommentModal from "../components/Post/CommentModal";
import EditPostModal from "../components/Post/EditPostModal";
import CreatePost from "../components/Post/CreatePost";
import { defaultAvatar } from "../utils/helpers";

// Import Hooks
import { usePosts } from "../hooks/usePosts";
import { useComments } from "../hooks/useComments";

export default function Home() {
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

  // Menggunakan Custom Hooks
  const { 
    posts, loading, btnLoading, fetchPosts, createPost, deletePost, updatePost, likePost 
  } = usePosts();
  
  const { 
    comments, loading: commentLoading, submitting: isSubmittingComment, 
    fetchComments, submitComment, deleteComment 
  } = useComments();

  // --- STATE UI (Hanya State yang terkait tampilan/input) ---
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState(null);
  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editPostData, setEditPostData] = useState(null);
  const [editCaption, setEditCaption] = useState("");
  const [editImage, setEditImage] = useState(null);
  const [editFile, setEditFile] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(null);

  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [commentBody, setCommentBody] = useState("");
  const [commentImage, setCommentImage] = useState(null);
  const [commentFile, setCommentFile] = useState(null);
  const [commentImagePreview, setCommentImagePreview] = useState(null);
  const [editingComment, setEditingComment] = useState(null);

  /**
   * Handler untuk membuat postingan baru
   */
  const handleCreatePost = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("caption", caption);
    if (image) formData.append("image", image);
    if (file) formData.append("file", file);

    createPost(formData, () => {
      setCaption("");
      clearAttachments();
    });
  };

  /**
   * Handler untuk update postingan
   */
  const handleUpdatePost = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("caption", editCaption);
    if (editImage) formData.append("image", editImage);
    if (editFile) formData.append("file", editFile);
    formData.append("_method", "PUT");

    updatePost(editPostData.id, formData, () => setShowEditModal(false));
  };

  /**
   * Handler untuk kirim komentar
   */
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
        fetchPosts(); // Refresh post count
      }
    });
  };

  // --- UI HELPER HANDLERS ---
  const handleImageChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.size <= MAX_FILE_SIZE) {
      setImage(selected);
      setImagePreview(URL.createObjectURL(selected));
    } else if (selected) {
      Swal.fire("Error", "Ukuran gambar terlalu besar (Maks 2MB)", "error");
    }
  };

  const clearAttachments = () => {
    setImage(null);
    setFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
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

  const openEditModal = (post) => {
    setEditPostData(post);
    setEditCaption(post.caption || "");
    setEditImagePreview(post.image_url || null);
    setEditImage(null);
    setEditFile(null);
    setShowEditModal(true);
  };

  const openEditComment = (comment) => {
    setEditingComment(comment);
    setCommentBody(comment.body || "");
    setCommentImagePreview(comment.image_url || null);
    setTimeout(() => document.getElementById("commentBodyInput")?.focus(), 100);
  };

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return (
    <>
      <CreatePost
        currentUser={currentUser}
        caption={caption}
        setCaption={setCaption}
        imagePreview={imagePreview}
        file={file}
        onImageChange={handleImageChange}
        onFileChange={(e) => setFile(e.target.files[0])}
        onClearAttachments={clearAttachments}
        onSubmit={handleCreatePost}
        loading={btnLoading}
      />

      <div className="posts-list">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
          </div>
        ) : posts.length > 0 ? (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUser={currentUser}
              onLike={likePost}
              onComment={openCommentModal}
              onEdit={openEditModal}
              onDelete={deletePost}
            />
          ))
        ) : (
          <div className="text-center py-5 text-muted bg-white rounded shadow-sm border">
            <h5>Belum ada postingan</h5>
          </div>
        )}
      </div>

      <EditPostModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        postData={editPostData}
        caption={editCaption}
        setCaption={setEditCaption}
        imagePreview={editImagePreview}
        file={editFile}
        onImageChange={(e) => {
          const selected = e.target.files[0];
          if (selected) {
            setEditImage(selected);
            setEditImagePreview(URL.createObjectURL(selected));
          }
        }}
        onFileChange={(e) => setEditFile(e.target.files[0])}
        onSubmit={handleUpdatePost}
        loading={btnLoading}
      />

      <CommentModal
        show={showCommentModal}
        onHide={() => setShowCommentModal(false)}
        post={selectedPost}
        comments={comments}
        loading={commentLoading}
        currentUser={currentUser}
        editingComment={editingComment}
        setEditingComment={setEditingComment}
        commentBody={commentBody}
        setCommentBody={setCommentBody}
        onSubmit={handleCreateComment}
        onDelete={(id) => deleteComment(id, selectedPost.id, () => fetchPosts())}
        onEdit={openEditComment}
        commentImagePreview={commentImagePreview}
        commentFile={commentFile}
        onImageChange={(e) => {
          const selected = e.target.files[0];
          if (selected) {
            setCommentImage(selected);
            setCommentImagePreview(URL.createObjectURL(selected));
          }
        }}
        onFileChange={(e) => setCommentFile(e.target.files[0])}
        onClearAttachments={clearCommentAttachments}
        isSubmitting={isSubmittingComment}
      />
    </>
  );
}
