import { useParams, useNavigate } from 'react-router-dom'
import { Button, Modal, Form, Spinner, Dropdown } from 'react-bootstrap'
import { 
  MdFavoriteBorder, MdFavorite, MdChatBubbleOutline, MdMoreHoriz, 
  MdEdit, MdDelete, MdSend, MdImage, MdAttachFile, MdClose 
} from "react-icons/md"
import { useState, useEffect } from 'react'
import api from '../utils/api'
import Swal from 'sweetalert2'

export default function Profile() {
  const { username } = useParams()
  const navigate = useNavigate()
  const [authUserInfo, setAuthUserInfo] = useState(JSON.parse(localStorage.getItem('user')))
  const isMe = !username || username === 'me' || (authUserInfo && username === authUserInfo.username)
  const displayUsername = username || (authUserInfo ? authUserInfo.username : 'myusername')
  
  const [isFollowing, setIsFollowing] = useState(false)
  const [followModal, setFollowModal] = useState({ show: false, type: '', title: '' })
  const [followList, setFollowList] = useState([])
  const [followPage, setFollowPage] = useState(1)
  const [hasMoreFollow, setHasMoreFollow] = useState(false)
  const [loadingFollow, setLoadingFollow] = useState(false)

  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showEditModal, setShowEditModal] = useState(false)
  const [loadingUpdate, setLoadingUpdate] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    username: '',
    bio: '',
    profile_picture: null
  })
  const [previewImage, setPreviewImage] = useState(null)

  // Posts states
  const [posts, setPosts] = useState([])
  const [loadingPosts, setLoadingPosts] = useState(true)
  
  // Post Edit states
  const [showEditPostModal, setShowEditPostModal] = useState(false)
  const [editPostData, setEditPostData] = useState(null)
  const [editCaption, setEditCaption] = useState("")
  const [editImage, setEditImage] = useState(null)
  const [editImagePreview, setEditImagePreview] = useState(null)
  const [btnLoading, setBtnLoading] = useState(false)

  // Comments states
  const [showCommentModal, setShowCommentModal] = useState(false)
  const [selectedPost, setSelectedPost] = useState(null)
  const [comments, setComments] = useState([])
  const [commentLoading, setCommentLoading] = useState(false)
  const [commentBody, setCommentBody] = useState("")
  const [commentImage, setCommentImage] = useState(null)
  const [commentFile, setCommentFile] = useState(null)
  const [commentImagePreview, setCommentImagePreview] = useState(null)
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [editingComment, setEditingComment] = useState(null)

  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

  
    const fetchProfile = async () => {
      try {
        const url = username ? `/profile?username=${username}` : `/profile`
        const res = await api.get(url)
        setUser(res.data.data)
        setIsFollowing(res.data.data.is_followed || false)
      } catch (error) {
        console.error('Error fetching profile:', error)
        Swal.fire(
          "Error",
          "Gagal memuat postingan. Pastikan Anda sudah login.",
          "error",
        );
      } finally {
        setLoading(false)
      }
    }

    useEffect(() => {
        fetchProfile();
        fetchUserPosts();
      }, [username]);

    const fetchUserPosts = async () => {
      setLoadingPosts(true)
      try {
        const url = username ? `/profile/posts?username=${username}` : '/profile/posts'
        const res = await api.get(url)
        setPosts(res.data.data.data || [])
      } catch (error) {
        console.error('Error fetching user posts:', error)
      } finally {
        setLoadingPosts(false)
      }
    }

    const defaultAvatar = (seed) => `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`

    const formatDate = (dateString) => {
      const options = { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }
      return new Date(dateString).toLocaleDateString("id-ID", options)
    }

    const handleLike = async (postId) => {
      try {
        await api.post(`/posts/${postId}/likes`)
        fetchUserPosts()
      } catch (error) {
        console.error("Like Error:", error)
      }
    }

    const handleToggleFollow = async () => {
        try {
            const res = await api.post(`/users/${user.id}/follows`)
            setIsFollowing(res.data.data.followed)
            fetchProfile() // Update follower count
        } catch (error) {
            Swal.fire("Error", "Gagal melakukan aksi follow", "error")
        }
    }

    const openFollowModal = (type) => {
        const title = type === 'followers' ? 'Pengikut' : 'Diikuti'
        setFollowModal({ show: true, type, title })
        setFollowList([])
        setFollowPage(1)
        fetchFollowList(type, 1)
    }

    const fetchFollowList = async (type, page) => {
        setLoadingFollow(true)
        try {
            const res = await api.get(`/users/${user.id}/${type}?page=${page}`)
            const newData = res.data.data.data
            setFollowList(prev => page === 1 ? newData : [...prev, ...newData])
            setHasMoreFollow(res.data.data.next_page_url !== null)
        } catch (error) {
            console.error("Fetch Follow List Error:", error)
        } finally {
            setLoadingFollow(false)
        }
    }

    const loadMoreFollow = () => {
        const nextPage = followPage + 1
        setFollowPage(nextPage)
        fetchFollowList(followModal.type, nextPage)
    }

    const handleDeletePost = async (postId) => {
      const result = await Swal.fire({
        title: "Hapus Postingan?",
        text: "Data yang dihapus tidak dapat dikembalikan!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        confirmButtonText: "Ya, Hapus!"
      })

      if (result.isConfirmed) {
        try {
          await api.delete(`/posts/${postId}`)
          fetchUserPosts()
          fetchProfile() // Update post count in header
          Swal.fire("Terhapus!", "Postingan berhasil dihapus.", "success")
        } catch (error) {
          Swal.fire("Error", "Gagal menghapus postingan.", "error")
        }
      }
    }

    const openEditPostModal = (post) => {
      setEditPostData(post)
      setEditCaption(post.caption || "")
      setEditImagePreview(post.image_url || null)
      setEditImage(null)
      setShowEditPostModal(true)
    }

    const handleUpdatePost = async (e) => {
      e.preventDefault()
      setBtnLoading(true)
      const formData = new FormData()
      formData.append("caption", editCaption)
      if (editImage) formData.append("image", editImage)
      formData.append("_method", "PUT")

      try {
        await api.post(`/posts/${editPostData.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        })
        setShowEditPostModal(false)
        fetchUserPosts()
        Swal.fire("Berhasil", "Postingan diperbarui", "success")
      } catch (error) {
        Swal.fire("Error", "Gagal memperbarui postingan", "error")
      } finally {
        setBtnLoading(false)
      }
    }

    const openCommentModal = (post) => {
      setSelectedPost(post)
      setCommentBody("")
      setEditingComment(null)
      clearCommentAttachments()
      setShowCommentModal(true)
      fetchComments(post.id)
    }

    const clearCommentAttachments = () => {
      setCommentImage(null)
      setCommentFile(null)
      if (commentImagePreview) URL.revokeObjectURL(commentImagePreview)
      setCommentImagePreview(null)
    }

    const handleCommentImageChange = (e) => {
      const selected = e.target.files[0]
      if (selected) {
        if (selected.size > MAX_FILE_SIZE) {
          Swal.fire("Terlalu Besar", "Maksimal 2MB", "error")
          return
        }
        setCommentImage(selected)
        setCommentImagePreview(URL.createObjectURL(selected))
      }
    }

    const openEditComment = (comment) => {
        setEditingComment(comment)
        setCommentBody(comment.body || "")
        setCommentImagePreview(comment.image_url || null)
        setCommentImage(null)
        setCommentFile(null)
        // Focus ke input field
        const input = document.getElementById("commentBodyInput")
        if (input) input.focus()
    }

    const handleDeleteComment = async (commentId) => {
        try {
            await api.delete(`/comments/${commentId}`)
            fetchComments(selectedPost.id)
            fetchUserPosts()
        } catch (error) {
            console.error("Delete Comment Error:", error)
        }
    }

    const fetchComments = async (postId) => {
      setCommentLoading(true)
      try {
        const res = await api.get(`/posts/${postId}/comments`)
        setComments(res.data.data.data || [])
      } catch (error) {
        console.error("Fetch Comments Error:", error)
      } finally {
        setCommentLoading(false)
      }
    }

    const handleCreateComment = async (e) => {
      e.preventDefault()
      if (!commentBody.trim() && !commentImage && !commentFile) return
      
      setIsSubmittingComment(true)
      const formData = new FormData()
      formData.append("body", commentBody)
      if (commentImage) formData.append("image", commentImage)
      if (commentFile) formData.append("file", commentFile)

      try {
        if (editingComment) {
          // Mode Edit
          formData.append("_method", "PUT")
          await api.post(`/comments/${editingComment.id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" }
          })
          setEditingComment(null)
        } else {
          // Mode Create
          await api.post(`/posts/${selectedPost.id}/comments`, formData, {
            headers: { "Content-Type": "multipart/form-data" }
          })
        }

        setCommentBody("")
        clearCommentAttachments()
        fetchComments(selectedPost.id)
        fetchUserPosts()
      } catch (error) {
        Swal.fire("Error", "Gagal menyimpan komentar", "error")
      } finally {
        setIsSubmittingComment(false)
      }
    }

    const handleEditOpen = () => {
      setEditForm({
        name: user.name,
        username: user.username,
        bio: user.bio || '',
        profile_picture: null
      })
      setPreviewImage(user.profile_url)
      setShowEditModal(true)
    }

    const handleFileChange = (e) => {
      const file = e.target.files[0]
      if (file) {
        setEditForm({ ...editForm, profile_picture: file })
        setPreviewImage(URL.createObjectURL(file))
      }
    }

    const handleUpdate = async (e) => {
      e.preventDefault()
      setLoadingUpdate(true)
      
      const formData = new FormData()
      formData.append('name', editForm.name)
      formData.append('username', editForm.username)
      formData.append('bio', editForm.bio)
      if (editForm.profile_picture) {
        formData.append('profile_picture', editForm.profile_picture)
      }
      // Laravel PUT method spoofing for FormData
      formData.append('_method', 'PUT')

      try {
        const res = await api.post('/profile', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        
        setUser(res.data.data)
        setShowEditModal(false)

        // Update localStorage agar isMe tetap sinkron
        localStorage.setItem('user', JSON.stringify(res.data.data))
        setAuthUserInfo(res.data.data)

        // Jika username berubah, arahkan ke URL baru
        if (res.data.data.username !== user.username) {
            navigate(`/user/${res.data.data.username}`)
        }

        Swal.fire({
          icon: 'success',
          title: 'Berhasil',
          text: 'Profil berhasil diperbarui!',
          timer: 2000,
          showConfirmButton: false
        })
      } catch (error) {
        console.error('Error updating profile:', error)
        const errorMessage = error.response?.data?.message || 'Gagal memperbarui profil'
        const validationErrors = error.response?.data?.data
        
        let errorHtml = `<p>${errorMessage}</p>`
        if (validationErrors) {
          errorHtml += '<ul class="text-start small">'
          Object.values(validationErrors).forEach(errArr => {
            errArr.forEach(err => {
              errorHtml += `<li>${err}</li>`
            })
          })
          errorHtml += '</ul>'
        }

        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          html: errorHtml
        })
      } finally {
        setLoadingUpdate(false)
      }
    }
  

  if (loading) return <div>Loading...</div>
  if (!user) return <div>User not found</div>

  return (
    <div className="profile-page animate__animated animate__fadeIn">
      <div className="glass-card mb-5">
        <div className="glass-card-body d-flex flex-column align-items-center text-center">
          <div className="profile-avatar-container">
            <img 
              src={user.profile_url || `https://ui-avatars.com/api/?name=${user.name}&background=random&size=128`} 
              alt={user.name} 
              className="profile-avatar"
            />
          </div>
          
          <h3 className="fw-bold mb-1">{user.name}</h3>
          <p className="text-muted mb-4">@{user.username}</p>
          
          {user.bio && (
            <p className="mb-4 text-secondary mx-auto" style={{ maxWidth: '450px' }}>
              {user.bio}
            </p>
          )}

          <div className="d-flex gap-2 gap-sm-4 mb-4">
            <div className="profile-stat-box text-center flex-grow-1">
              <strong className="d-block h5 mb-0 text-primary">{user.posts_count}</strong>
              <span className="small text-muted fw-medium">Postingan</span>
            </div>
            <div className="profile-stat-box text-center flex-grow-1 cursor-pointer" onClick={() => openFollowModal('followers')}>
              <strong className="d-block h5 mb-0 text-primary">{user.followers_count}</strong>
              <span className="small text-muted fw-medium border-hover-bottom">Pengikut</span>
            </div>
            <div className="profile-stat-box text-center flex-grow-1 cursor-pointer" onClick={() => openFollowModal('following')}>
              <strong className="d-block h5 mb-0 text-primary">{user.following_count}</strong>
              <span className="small text-muted fw-medium border-hover-bottom">Diikuti</span>
            </div>
          </div>

          <div className="w-100 d-flex gap-2 justify-content-center">
            {isMe ? (
              <Button className="btn-gradient px-5" onClick={handleEditOpen}>
                Edit Profil
              </Button>
            ) : (
              <Button 
                variant={isFollowing ? 'outline-primary' : 'primary'} 
                className={isFollowing ? 'px-5' : 'btn-gradient px-5'}
                onClick={handleToggleFollow}
              >
                {isFollowing ? 'Berhenti Mengikuti' : 'Ikuti'}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="posts-list mt-4">
        {loadingPosts ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2 text-muted">Memuat postingan...</p>
          </div>
        ) : posts.length > 0 ? (
          posts.map((post) => (
            <div key={post.id} className="post-card mb-3 shadow-sm border-light animate__animated animate__fadeInUp">
              <div className="post-header border-0 d-flex justify-content-between align-items-center">
                <div className="post-user d-flex align-items-center gap-2">
                  <img
                    src={post.user?.profile_url || defaultAvatar(post.user?.username || post.id)}
                    alt={post.user?.name}
                    className="post-avatar"
                  />
                  <div className="d-flex flex-column">
                    <span className="fw-bold">{post.user?.name || "Anonim"}</span>
                    <span className="text-muted small text-start">@{post.user?.username}</span>
                  </div>
                </div>

                <Dropdown align="end">
                  <Dropdown.Toggle as="button" className="post-action-btn border-0 bg-transparent p-0">
                    <MdMoreHoriz size={24} />
                  </Dropdown.Toggle>
                  <Dropdown.Menu className="shadow border-0 rounded-3">
                    <Dropdown.Item className="small py-2 d-flex align-items-center gap-2" onClick={() => openEditPostModal(post)}>
                      <MdEdit className="text-primary" size={18} /> Ubah
                    </Dropdown.Item>
                    <Dropdown.Item className="small py-2 d-flex align-items-center gap-2 text-danger" onClick={() => handleDeletePost(post.id)}>
                      <MdDelete size={18} /> Hapus
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>

              <div className="post-content px-3 py-2 text-start">{post.caption}</div>

              {post.image_url && (
                <div className="post-media mb-2 text-center bg-light py-1">
                  <img src={post.image_url} alt="post-img" className="img-fluid" style={{ maxHeight: "400px" }} />
                </div>
              )}

              {post.file_url && (
                <div className="px-3 pb-3">
                  <a href={post.file_url} target="_blank" rel="noreferrer" className="d-flex align-items-center gap-2 p-2 bg-light rounded text-decoration-none text-dark border">
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

              <div className="post-likes px-3 mt-1 small fw-bold text-start">{post.likes_count || 0} Suka</div>
              <div className="post-time px-3 text-muted mt-2 mb-3 text-start" style={{ fontSize: "11px" }}>{formatDate(post.created_at)}</div>
            </div>
          ))
        ) : (
          <div className="col-12 text-center py-5 glass-card">
            <p className="text-muted m-0">Belum ada postingan</p>
          </div>
        )}
      </div>

      {/* MODAL EDIT POST */}
      <Modal show={showEditPostModal} onHide={() => setShowEditPostModal(false)} centered className="border-0">
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

            {editImagePreview && (
              <div className="mb-3 position-relative p-2 bg-light rounded border border-dashed text-center">
                <img src={editImagePreview} alt="preview" className="rounded" style={{ maxHeight: "200px", maxWidth: "100%" }} />
                <div className="mt-2">
                   <Button variant="outline-primary" size="sm" onClick={() => document.getElementById("editImageInput").click()}>Ganti Gambar</Button>
                </div>
              </div>
            )}

            <input type="file" id="editImageInput" hidden accept="image/*" onChange={(e) => {
              const file = e.target.files[0]
              if(file) {
                setEditImage(file)
                setEditImagePreview(URL.createObjectURL(file))
              }
            }} />

            <div className="d-flex justify-content-end gap-2 mt-4">
              <Button variant="light" className="rounded-pill px-4" onClick={() => setShowEditPostModal(false)}>Batal</Button>
              <Button variant="primary" type="submit" className="rounded-pill px-4 btn-gradient border-0" disabled={btnLoading}>
                {btnLoading ? <Spinner size="sm" /> : "Simpan Perubahan"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* MODAL KOMENTAR */}
      <Modal show={showCommentModal} onHide={() => setShowCommentModal(false)} centered size="md" className="comment-modal">
        <Modal.Header closeButton className="border-0 shadow-sm z-3">
          <Modal.Title className="fw-bold h6">Komentar</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0 bg-light" style={{ height: '400px', overflowY: 'auto' }}>
          <div className="p-3">
            {commentLoading ? (
               <div className="text-center py-5"><Spinner animation="border" size="sm" variant="primary" /></div>
            ) : comments.length > 0 ? (
               comments.map(comment => (
                 <div key={comment.id} className="d-flex align-items-start gap-2 mb-3">
                    <img 
                      src={comment.user?.profile_url || defaultAvatar(comment.user?.username)} 
                      className="rounded-circle" width="32" height="32" alt="avatar" 
                    />
                    <div className="flex-grow-1 text-start">
                       <div className="bg-white p-2 rounded-3 shadow-sm border" style={{ maxWidth: '90%', display: 'inline-block' }}>
                          <div className="d-flex justify-content-between align-items-center gap-3">
                             <span className="fw-bold small" style={{ fontSize: '12px' }}>{comment.user?.name}</span>
                             {(comment.user_id === authUserInfo?.id || authUserInfo?.is_admin) && (
                               <div className="d-flex gap-2">
                                 <button className="btn btn-link p-0 text-primary" onClick={() => openEditComment(comment)} style={{ fontSize: '10px', textDecoration: 'none' }}>Ubah</button>
                                 <button className="btn btn-link p-0 text-danger" onClick={() => handleDeleteComment(comment.id)} style={{ fontSize: '10px', textDecoration: 'none' }}>Hapus</button>
                               </div>
                             )}
                          </div>
                          <div className="small mt-1">{comment.body}</div>
                          
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
        <Modal.Footer className="border-top-0 p-2 bg-white flex-column align-items-stretch">
           {/* Indikator Mode Edit */}
           {editingComment && (
             <div className="d-flex justify-content-between align-items-center px-2 py-1 bg-primary bg-opacity-10 rounded mb-2">
                <span className="small fw-bold text-primary" style={{ fontSize: '11px' }}>Sedang mengedit komentar...</span>
                <MdClose className="text-danger cursor-pointer" onClick={() => { setEditingComment(null); setCommentBody(""); clearCommentAttachments(); }} />
             </div>
           )}

           {/* Preview lampiran di Komentar */}
           {(commentImagePreview || commentFile) && (
             <div className="p-2 mb-2 bg-light rounded border border-dashed d-flex align-items-center gap-3 position-relative">
                <Button variant="dark" size="sm" className="position-absolute top-0 end-0 m-1 rounded-circle p-0" style={{ width: '18px', height: '18px', zIndex: 10 }} onClick={clearCommentAttachments}>
                  <MdClose size={12} />
                </Button>
                
                {commentImagePreview && (
                  <div className="flex-shrink-0">
                    <img src={commentImagePreview} alt="preview" height="45" className="rounded border shadow-sm" />
                  </div>
                )}

                {commentFile && (
                  <div className="d-flex align-items-center gap-2 bg-white p-1 rounded border shadow-sm flex-grow-1 overflow-hidden">
                    <MdAttachFile className="text-success" size={18} />
                    <span className="small text-truncate" style={{ fontSize: '10px' }}>{commentFile.name}</span>
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
                    const selected = e.target.files[0]
                    if (selected && selected.size > MAX_FILE_SIZE) {
                       Swal.fire("Besar", "Maks 2MB", "error")
                       return
                    }
                    setCommentFile(selected)
                 }} />
                 <Button variant="light" size="sm" className="rounded-circle p-1 border-0" onClick={() => document.getElementById("commentFileInput").click()}>
                    <MdAttachFile size={20} className="text-success" />
                 </Button>
              </div>

              <Form.Control 
                id="commentBodyInput"
                type="text"
                placeholder={editingComment ? "Edit komentar..." : "Tulis komentar..."}
                className="bg-light border-0 px-3 py-2 rounded-pill small"
                value={commentBody}
                onChange={(e) => setCommentBody(e.target.value)}
              />
              <Button type="submit" variant="primary" size="sm" className="rounded-circle p-2" disabled={isSubmittingComment || (!commentBody.trim() && !commentImage && !commentFile)}>
                 {isSubmittingComment ? <Spinner size="sm" /> : (editingComment ? <MdSend size={20} className="text-warning" /> : <MdSend size={20} />)}
              </Button>
           </Form>
        </Modal.Footer>
      </Modal>
      
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered className="glass-modal">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold">Edit Profil</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleUpdate}>
          <Modal.Body className="py-4">
            <div className="text-center mb-4">
              <div className="position-relative d-inline-block">
                <img 
                  src={previewImage || `https://ui-avatars.com/api/?name=${editForm.name}&background=random`} 
                  alt="Preview" 
                  className="profile-avatar mb-2" 
                  style={{ width: '100px', height: '100px' }}
                />
                <Form.Label 
                  htmlFor="profile-upload" 
                  className="position-absolute bottom-0 end-0 bg-primary text-white rounded-circle d-flex align-items-center justify-content-center cursor-pointer shadow"
                  style={{ width: '32px', height: '32px', marginBottom: '8px' }}
                >
                  <i className="bi bi-camera-fill small"></i>
                </Form.Label>
                <Form.Control 
                  type="file" 
                  id="profile-upload" 
                  className="d-none" 
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
              <div className="small text-muted">Ketuk ikon kamera untuk ubah foto</div>
            </div>

            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">Nama Lengkap</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Masukkan nama anda"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">Username</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="username_anda"
                value={editForm.username}
                onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-0">
              <Form.Label className="small fw-bold">Bio</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={3} 
                placeholder="Tulis sesuatu tentang anda..."
                value={editForm.bio}
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0">
            <Button variant="light" onClick={() => setShowEditModal(false)} disabled={loadingUpdate}>
              Batal
            </Button>
            <Button type="submit" className="btn-gradient" disabled={loadingUpdate}>
              {loadingUpdate ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Menyimpan...
                </>
              ) : 'Simpan Perubahan'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* MODAL LIST FOLLOWERS / FOLLOWING */}
      <Modal show={followModal.show} onHide={() => setFollowModal({ ...followModal, show: false })} centered scrollable>
        <Modal.Header closeButton className="border-0 shadow-sm">
          <Modal.Title className="fw-bold h6">{followModal.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0 bg-light" style={{ maxHeight: '400px' }}>
          <div className="p-3">
            {followList.length > 0 ? (
              followList.map(u => (
                <div key={u.id} className="d-flex align-items-center justify-content-between mb-3 bg-white p-2 rounded shadow-sm border animate__animated animate__fadeIn">
                   <div className="d-flex align-items-center gap-3 cursor-pointer" onClick={() => { setFollowModal({ ...followModal, show: false }); navigate(`/user/${u.username}`); }}>
                      <img src={u.profile_url || defaultAvatar(u.username)} className="rounded-circle" width="40" height="40" alt={u.name} />
                      <div className="text-start">
                         <div className="fw-bold small">{u.name}</div>
                         <div className="text-muted" style={{ fontSize: '11px' }}>@{u.username}</div>
                      </div>
                   </div>
                   {/* Bisa tambah tombol follow di sini jika mau */}
                </div>
              ))
            ) : !loadingFollow && (
              <div className="text-center py-5 text-muted small">Tidak ada data ditemukan.</div>
            )}

            {loadingFollow && (
               <div className="text-center py-3"><Spinner animation="border" size="sm" variant="primary" /></div>
            )}

            {hasMoreFollow && !loadingFollow && (
               <div className="text-center mt-3">
                  <Button variant="link" size="sm" onClick={loadMoreFollow} className="text-decoration-none">
                     Muat Lebih Banyak
                  </Button>
               </div>
            )}
          </div>
        </Modal.Body>
      </Modal>
    </div>
  )
}
