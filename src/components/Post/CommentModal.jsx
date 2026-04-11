import { Modal, Spinner, Form, Button } from "react-bootstrap";
import { MdClose, MdAttachFile, MdImage, MdSend } from "react-icons/md";
import { formatDate, defaultAvatar } from "../../utils/helpers";

/**
 * Komponen CommentModal
 * @param {boolean} show - Status tampil modal
 * @param {Function} onHide - Handler untuk menutup modal
 * @param {Object} post - Objek postingan yang dikomentari
 * @param {Array} comments - Daftar komentar
 * @param {boolean} loading - Status loading saat fetch komentar
 * @param {Object} currentUser - User login saat ini
 * @param {Object} editingComment - Objek komentar yang sedang diedit (jika ada)
 * @param {Function} setEditingComment - Setter untuk status edit
 * @param {string} commentBody - Value input teks komentar
 * @param {Function} setCommentBody - Setter value input teks
 * @param {Function} onSubmit - Handler untuk kirim komentar (create/update)
 * @param {Function} onDelete - Handler untuk hapus komentar
 * @param {Function} onEdit - Handler untuk memicu mode edit komentar
 * 
 * Props untuk Lampiran (File Handling):
 * @param {Object} commentImagePreview - Preview gambar
 * @param {Object} commentFile - File lampiran
 * @param {Function} onImageChange - Handler ganti gambar
 * @param {Function} onFileChange - Handler ganti file
 * @param {Function} onClearAttachments - Handler hapus lampiran
 * @param {boolean} isSubmitting - Status loading saat submit
 */
const CommentModal = ({
  show,
  onHide,
  post,
  comments,
  loading,
  currentUser,
  editingComment,
  setEditingComment,
  commentBody,
  setCommentBody,
  onSubmit,
  onDelete,
  onEdit,
  commentImagePreview,
  commentFile,
  onImageChange,
  onFileChange,
  onClearAttachments,
  isSubmitting,
}) => {
  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      size="md"
      className="comment-modal"
    >
      <Modal.Header closeButton className="border-0 shadow-sm z-3">
        <Modal.Title className="fw-bold h6">Komentar</Modal.Title>
      </Modal.Header>
      
      <Modal.Body
        className="p-0 bg-light"
        style={{
          height: "450px",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column-reverse",
        }}
      >
        <div className="p-3">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" size="sm" variant="primary" />
            </div>
          ) : comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment.id} className="d-flex align-items-start gap-2 mb-3">
                <img
                  src={comment.user?.profile_url || defaultAvatar(comment.user?.username)}
                  className="rounded-circle"
                  width="32"
                  height="32"
                  alt="avatar"
                />
                <div className="flex-grow-1 text-start">
                  <div
                    className="bg-white p-2 rounded-3 shadow-sm border"
                    style={{ maxWidth: "85%", display: "inline-block" }}
                  >
                    <div className="d-flex justify-content-between align-items-center gap-3">
                      <span className="fw-bold small" style={{ fontSize: "12px" }}>
                        {comment.user?.name}
                      </span>
                      {/* Opsi Edit/Hapus hanya untuk owner/admin */}
                      {(comment.user_id === currentUser.id || currentUser.is_admin) && (
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-link p-0 text-primary border-0"
                            onClick={() => onEdit(comment)}
                            style={{ fontSize: "10px", textDecoration: "none" }}
                          >
                            Ubah
                          </button>
                          <button
                            className="btn btn-link p-0 text-danger border-0"
                            onClick={() => onDelete(comment.id)}
                            style={{ fontSize: "10px", textDecoration: "none" }}
                          >
                            Hapus
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <div className="small mt-1">{comment.body}</div>

                    {/* Media di Komentar */}
                    {comment.image_url && (
                      <div className="mt-2 text-center bg-light p-1 rounded">
                        <img
                          src={comment.image_url}
                          alt="comment-img"
                          className="img-fluid rounded"
                          style={{ maxHeight: "150px" }}
                        />
                      </div>
                    )}
                    {comment.file_url && (
                      <div className="mt-2">
                        <a
                          href={comment.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="d-flex align-items-center gap-2 p-1 bg-light rounded text-decoration-none text-dark border small"
                        >
                          <MdAttachFile className="text-success" size={14} />
                          <span className="fw-semibold" style={{ fontSize: "10px" }}>
                            File
                          </span>
                        </a>
                      </div>
                    )}
                  </div>
                  <div
                    className="text-muted mt-1 px-1"
                    style={{ fontSize: "9px" }}
                  >
                    {formatDate(comment.created_at)}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-5 text-muted small">
              Belum ada komentar.
            </div>
          )}
        </div>
      </Modal.Body>

      {/* FOOTER: INPUT KOMENTAR */}
      <Modal.Footer className="border-top-0 p-2 bg-white flex-column align-items-stretch">
        {/* Indikator Mode Edit */}
        {editingComment && (
          <div className="d-flex justify-content-between align-items-center px-2 py-1 bg-primary bg-opacity-10 rounded mb-2">
            <span className="small fw-bold text-primary" style={{ fontSize: "11px" }}>
              Sedang mengedit komentar...
            </span>
            <MdClose
              className="text-danger cursor-pointer"
              onClick={() => {
                setEditingComment(null);
                setCommentBody("");
                onClearAttachments();
              }}
            />
          </div>
        )}

        {/* Preview lampiran di Komentar */}
        {(commentImagePreview || commentFile) && (
          <div className="p-2 mb-2 bg-light rounded border border-dashed d-flex align-items-center gap-3 position-relative scroll-x">
            <Button
              variant="dark"
              size="sm"
              className="position-absolute top-0 end-0 m-1 rounded-circle p-0"
              style={{ width: "18px", height: "18px", zIndex: 10 }}
              onClick={onClearAttachments}
            >
              <MdClose size={12} />
            </Button>

            {commentImagePreview && (
              <div className="flex-shrink-0 text-center">
                <img
                  src={commentImagePreview}
                  alt="preview"
                  height="45"
                  className="rounded border shadow-sm"
                />
                <div className="text-muted" style={{ fontSize: "8px" }}>
                  Gambar
                </div>
              </div>
            )}

            {commentFile && (
              <div className="d-flex align-items-center gap-2 bg-white p-1 rounded border shadow-sm flex-grow-1 overflow-hidden">
                <MdAttachFile className="text-success" size={18} />
                <span className="small text-truncate" style={{ fontSize: "10px", maxWidth: "120px" }}>
                  {commentFile.name}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Input Form */}
        <Form onSubmit={onSubmit} className="d-flex align-items-center gap-2">
          <div className="d-flex gap-1">
            <input
              type="file"
              id="commentImageInput"
              hidden
              accept="image/*"
              onChange={onImageChange}
            />
            <Button
              variant="light"
              size="sm"
              className="rounded-circle p-1 border-0"
              onClick={() => document.getElementById("commentImageInput").click()}
            >
              <MdImage size={20} className="text-primary" />
            </Button>

            <input
              type="file"
              id="commentFileInput"
              hidden
              onChange={onFileChange}
            />
            <Button
              variant="light"
              size="sm"
              className="rounded-circle p-1 border-0"
              onClick={() => document.getElementById("commentFileInput").click()}
            >
              <MdAttachFile size={20} className="text-success" />
            </Button>
          </div>

          <Form.Control
            id="commentBodyInput"
            type="text"
            placeholder={editingComment ? "Edit komentar..." : "Tulis komentar..."}
            className="bg-light border-0 px-3 py-1 rounded-pill small"
            style={{ fontSize: "14px" }}
            value={commentBody}
            onChange={(e) => setCommentBody(e.target.value)}
            autoComplete="off"
          />

          <Button
            type="submit"
            variant="primary"
            size="sm"
            className="rounded-circle p-1"
            disabled={isSubmitting || (!commentBody.trim() && !commentImagePreview && !commentFile)}
          >
            {isSubmitting ? (
              <Spinner size="sm" animation="border" />
            ) : editingComment ? (
              <MdSend size={20} className="text-warning" />
            ) : (
              <MdSend size={20} />
            )}
          </Button>
        </Form>
      </Modal.Footer>
    </Modal>
  );
};

export default CommentModal;
