import { Dropdown } from "react-bootstrap";
import {
  MdFavoriteBorder,
  MdFavorite,
  MdChatBubbleOutline,
  MdMoreHoriz,
  MdEdit,
  MdDelete,
  MdAttachFile,
} from "react-icons/md";
import { formatDate, defaultAvatar } from "../../utils/helpers";

/**
 * Komponen PostCard
 * @param {Object} post - Objek data postingan
 * @param {Object} currentUser - Objek user pemberi otorisasi (saat ini)
 * @param {Function} onLike - Handler saat tombol like diklik
 * @param {Function} onComment - Handler saat tombol comment diklik
 * @param {Function} onEdit - Handler saat tombol edit diklik
 * @param {Function} onDelete - Handler saat tombol delete diklik
 */
const PostCard = ({ 
  post, 
  currentUser, 
  onLike, 
  onComment, 
  onEdit, 
  onDelete 
}) => {
  return (
    <div className="post-card mb-3 shadow-sm border-light">
      {/* Header Postingan: Info User & Menu Dropdown */}
      <div className="post-header border-0 d-flex justify-content-between align-items-center">
        <div className="post-user d-flex align-items-center gap-2">
          <img
            src={
              post.user?.profile_url ||
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

        {/* Menu Dropdown - Hanya tampil jika owner atau admin */}
        {(post.user_id === currentUser.id || currentUser.is_admin) && (
          <Dropdown align="end">
            <Dropdown.Toggle
              as="button"
              className="post-action-btn border-0 bg-transparent p-0"
            >
              <MdMoreHoriz size={24} />
            </Dropdown.Toggle>
            <Dropdown.Menu className="shadow border-0 rounded-3">
              {post.user_id === currentUser.id && (
                <Dropdown.Item
                  className="small py-2 d-flex align-items-center gap-2"
                  onClick={() => onEdit(post)}
                >
                  <MdEdit className="text-primary" size={18} /> Ubah
                </Dropdown.Item>
              )}
              <Dropdown.Item
                className="small py-2 d-flex align-items-center gap-2 text-danger"
                onClick={() => onDelete(post.id)}
              >
                <MdDelete size={18} /> Hapus
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        )}
      </div>

      {/* Konten Utama Postingan */}
      <div className="post-content px-3 py-2">{post.caption}</div>

      {/* Media Gambar (Jika ada) */}
      {post.image_url && (
        <div className="post-media mb-2 text-center bg-gray-50 border-y py-1">
          <img
            src={post.image_url}
            alt="post-img"
            className="img-fluid"
            style={{ maxHeight: "400px" }}
          />
        </div>
      )}

      {/* Lampiran File (Jika ada) */}
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

      {/* Tombol Aksi: Like & Comment */}
      <div className="post-actions px-3 mt-2 border-0 d-flex gap-3">
        <button
          className="post-action-btn border-0 bg-transparent p-0"
          style={{ color: post.is_liked ? "#ef4444" : "inherit" }}
          onClick={() => onLike(post.id)}
        >
          {post.is_liked ? <MdFavorite size={24} /> : <MdFavoriteBorder size={24} />}
        </button>
        <button
          className="post-action-btn border-0 bg-transparent p-0"
          onClick={() => onComment(post)}
        >
          <MdChatBubbleOutline size={22} />
          <span className="ms-1 small">{post.comments_count || 0}</span>
        </button>
      </div>

      {/* Informasi Like & Waktu Postingan */}
      <div className="post-likes px-3 mt-1 small fw-bold">
        {post.likes_count || 0} Suka
      </div>
      <div
        className="post-time px-3 text-muted mt-2 mb-3"
        style={{ fontSize: "11px" }}
      >
        {formatDate(post.created_at)}
      </div>
    </div>
  );
};

export default PostCard;
