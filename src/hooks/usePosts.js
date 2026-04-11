import { useState, useCallback } from "react";
import api from "../utils/api";
import Swal from "sweetalert2";

/**
 * Hook usePosts
 * Mengelola state dan aksi untuk postingan.
 */
export const usePosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);

  /**
   * Mengambil data postingan dari API
   * @param {string} endpoint - Endpoint API (default: "/posts")
   */
  const fetchPosts = useCallback(async (endpoint = "/posts") => {
    setLoading(true);
    try {
      const res = await api.get(endpoint);
      const postData = res.data.data.data || [];
      setPosts(postData);
    } catch (error) {
      console.error("Fetch Error:", error);
      Swal.fire("Error", "Gagal memuat postingan.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Membuat postingan baru
   */
  const createPost = async (formData, onSuccess) => {
    setBtnLoading(true);
    try {
      await api.post("/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      Swal.fire({ icon: "success", title: "Diposting!", timer: 1500, showConfirmButton: false });
      if (onSuccess) onSuccess();
      fetchPosts();
    } catch (error) {
      Swal.fire("Error", "Gagal mengirim postingan.", "error");
    } finally {
      setBtnLoading(false);
    }
  };

  /**
   * Menghapus postingan
   */
  const deletePost = async (postId) => {
    const result = await Swal.fire({
      title: "Hapus Postingan?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/posts/${postId}`);
        setPosts((prev) => prev.filter((p) => p.id !== postId));
        Swal.fire("Terhapus!", "Postingan berhasil dihapus.", "success");
      } catch (error) {
        Swal.fire("Error", "Gagal menghapus postingan.", "error");
      }
    }
  };

  /**
   * Update postingan
   */
  const updatePost = async (postId, formData, onSuccess) => {
    setBtnLoading(true);
    try {
      await api.post(`/posts/${postId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (onSuccess) onSuccess();
      fetchPosts();
      Swal.fire({ icon: "success", title: "Berhasil diperbarui", timer: 1500, showConfirmButton: false });
    } catch (error) {
      Swal.fire("Error", "Gagal memperbarui postingan.", "error");
    } finally {
      setBtnLoading(false);
    }
  };

  /**
   * Like / Unlike postingan
   */
  const likePost = async (postId) => {
    // 1. Update State secara Optimistic (langsung ubah UI)
    setPosts((currentPosts) =>
      currentPosts.map((post) => {
        if (post.id === postId) {
          const isLiked = !post.is_liked;
          return {
            ...post,
            is_liked: isLiked,
            likes_count: isLiked 
              ? (post.likes_count || 0) + 1 
              : Math.max(0, (post.likes_count || 0) - 1),
          };
        }
        return post;
      })
    );

    try {
      await api.post(`/posts/${postId}/likes`);
      // Tidak perlu re-fetch jika berhasil karena state sudah diupdate di atas
    } catch (error) {
      console.error("Like Error:", error);
      // Revert / Sinkronkan ulang jika gagal
      fetchPosts(); 
    }
  };

  return {
    posts,
    setPosts,
    loading,
    btnLoading,
    fetchPosts,
    createPost,
    deletePost,
    updatePost,
    likePost,
  };
};
