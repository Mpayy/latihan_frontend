import { useState, useCallback } from "react";
import api from "../utils/api";
import Swal from "sweetalert2";

/**
 * Hook useComments
 * Mengelola state dan aksi untuk komentar pada post.
 */
export const useComments = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  /**
   * Mengambil komentar milik post tertentu
   */
  const fetchComments = useCallback(async (postId) => {
    setLoading(true);
    try {
      const res = await api.get(`/posts/${postId}/comments`);
      setComments(res.data.data.data || []);
    } catch (error) {
      console.error("Fetch Comments Error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Submit komentar (Create atau Update)
   */
  const submitComment = async ({ postId, commentId = null, formData, onSuccess }) => {
    setSubmitting(true);
    try {
      if (commentId) {
        // Update
        formData.append("_method", "PUT");
        await api.post(`/comments/${commentId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        // Create
        await api.post(`/posts/${postId}/comments`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      if (onSuccess) onSuccess();
      if (postId) fetchComments(postId);
      Swal.fire("Berhasil", "Komentar disimpan", "success");
    } catch (error) {
      Swal.fire("Error", "Gagal menyimpan komentar.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Hapus komentar
   */
  const deleteComment = async (commentId, postId, onSuccess) => {
    const result = await Swal.fire({
      title: "Hapus Komentar?",
      icon: "warning",
      showCancelButton: true,
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/comments/${commentId}`);
        setComments((prev) => prev.filter((c) => c.id !== commentId));
        if (onSuccess) onSuccess();
        Swal.fire("Berhasil", "Komentar dihapus", "success");
      } catch (error) {
        console.error(error);
      }
    }
  };

  return {
    comments,
    setComments,
    loading,
    submitting,
    fetchComments,
    submitComment,
    deleteComment,
  };
};
