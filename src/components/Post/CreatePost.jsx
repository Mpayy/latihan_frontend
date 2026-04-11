import { Form, Button, Spinner } from "react-bootstrap";
import { MdImage, MdAttachFile, MdClose } from "react-icons/md";
import { defaultAvatar } from "../../utils/helpers";

/**
 * Komponen CreatePost
 * @param {Object} currentUser - User yang sedang login
 * @param {string} caption - Value caption
 * @param {Function} setCaption - Setter value caption
 * @param {string} imagePreview - Preview gambar
 * @param {Object} file - Objek file lampiran
 * @param {Function} onImageChange - Handler ganti gambar
 * @param {Function} onFileChange - Handler ganti file
 * @param {Function} onClearAttachments - Handler hapus lampiran
 * @param {Function} onSubmit - Handler submit
 * @param {boolean} loading - Status loading
 */
const CreatePost = ({
  currentUser,
  caption,
  setCaption,
  imagePreview,
  file,
  onImageChange,
  onFileChange,
  onClearAttachments,
  onSubmit,
  loading,
}) => {
  return (
    <div className="create-post-card shadow-sm border-0 mb-4 p-3 bg-white rounded">
      <Form onSubmit={onSubmit}>
        <div className="d-flex align-items-start gap-3">
          <img
            src={currentUser.profile_url || defaultAvatar(currentUser.name)}
            alt="avatar"
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
              disabled={loading}
            />

            {/* Preview Lampiran */}
            {(imagePreview || file) && (
              <div className="mt-3 position-relative bg-light p-2 rounded border border-dashed text-center">
                <Button
                  variant="dark"
                  size="sm"
                  className="position-absolute top-0 end-0 m-1 rounded-circle p-1"
                  style={{ zIndex: 5, width: "24px", height: "24px" }}
                  onClick={onClearAttachments}
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
                  <div className="d-flex align-items-center justify-content-center gap-2 p-2 bg-white rounded border mx-auto mt-2" style={{maxWidth: '300px'}}>
                    <MdAttachFile className="text-success" size={20} />
                    <span className="small fw-bold text-truncate">{file.name}</span>
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
                  onChange={onImageChange}
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
                  onChange={onFileChange}
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
                disabled={loading || (!caption.trim() && !imagePreview && !file)}
              >
                {loading ? <Spinner size="sm" /> : "Kirim"}
              </Button>
            </div>
          </div>
        </div>
      </Form>
    </div>
  );
};

export default CreatePost;
