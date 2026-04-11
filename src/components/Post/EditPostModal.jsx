import { Modal, Form, Button, Spinner } from "react-bootstrap";
import { MdAttachFile } from "react-icons/md";

/**
 * Komponen EditPostModal
 * @param {boolean} show - Status tampil modal
 * @param {Function} onHide - Handler untuk menutup modal
 * @param {Object} postData - Data postingan asli
 * @param {string} caption - Value caption yang sedang diedit
 * @param {Function} setCaption - Setter value caption
 * @param {string} imagePreview - Preview gambar (url atau blob)
 * @param {Object} file - File lampiran baru (jika ada)
 * @param {Function} onImageChange - Handler ganti gambar
 * @param {Function} onFileChange - Handler ganti file
 * @param {Function} onSubmit - Handler submit form
 * @param {boolean} loading - Status loading saat simpan
 */
const EditPostModal = ({
  show,
  onHide,
  postData,
  caption,
  setCaption,
  imagePreview,
  file,
  onImageChange,
  onFileChange,
  onSubmit,
  loading,
}) => {
  return (
    <Modal show={show} onHide={onHide} centered className="border-0">
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-bold h5">Ubah Postingan</Modal.Title>
      </Modal.Header>
      <Modal.Body className="pt-3">
        <Form onSubmit={onSubmit}>
          <Form.Group className="mb-3">
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Edit caption..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="border-light bg-light rounded-3"
            />
          </Form.Group>

          {/* Preview Gambar/File Saat Edit */}
          {(imagePreview || file || postData?.file_url) && (
            <div className="mb-3 position-relative p-2 bg-light rounded border border-dashed text-center">
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="preview"
                  className="rounded"
                  style={{ maxHeight: "200px", maxWidth: "100%" }}
                />
              )}

              {/* Preview Info File di Modal */}
              {(file || postData?.file_url) && (
                <div className="d-flex align-items-center justify-content-center gap-2 p-2 bg-white rounded border shadow-sm mt-2">
                  <MdAttachFile className="text-success" size={24} />
                  <span
                    className="small fw-bold text-truncate"
                    style={{ maxWidth: "200px" }}
                  >
                    {file
                      ? file.name
                      : postData.file_url.split("/").pop() || "File terlampir"}
                  </span>
                </div>
              )}

              <div className="mt-2 d-flex justify-content-center gap-2">
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => document.getElementById("editImageInput").click()}
                >
                  Ganti Gambar
                </Button>
                <Button
                  variant="outline-success"
                  size="sm"
                  onClick={() => document.getElementById("editFileInput").click()}
                >
                  Ganti File
                </Button>
              </div>
            </div>
          )}

          <input
            type="file"
            id="editImageInput"
            hidden
            accept="image/*"
            onChange={onImageChange}
          />
          <input
            type="file"
            id="editFileInput"
            hidden
            onChange={onFileChange}
          />

          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button
              variant="light"
              className="rounded-pill px-4"
              onClick={onHide}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              type="submit"
              className="rounded-pill px-4"
              disabled={loading}
            >
              {loading ? <Spinner size="sm" /> : "Simpan Perubahan"}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default EditPostModal;
