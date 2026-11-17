import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Footer from './common/Footer';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function AdminPanel() {
  const { user } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });

  // New Blog form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit Blog modal state
  const [editingBlog, setEditingBlog] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  // Fetch blogs
  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/blogs`);
      setBlogs(res.data || []);
    } catch (err) {
      console.error('Error fetching blogs:', err);
      setMessage({ text: 'Failed to load blogs from backend.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchBlogs();
  }, []);

  const showNotification = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => {
      setMessage({ text: '', type: '' });
    }, 4000);
  };

  // Handle Add New Blog
  const handleCreateBlog = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      showNotification('Title and Content are required.', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const today = new Date();
      const date = today.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });

      await axios.post(`${API_BASE}/blogs`, {
        newTitle: newTitle.trim(),
        newContent: newContent.trim(),
        date: date,
        likes: 0
      });

      showNotification('Blog post created successfully! 🎉', 'success');
      setNewTitle('');
      setNewContent('');
      setShowAddForm(false);
      fetchBlogs();
    } catch (err) {
      console.error('Error creating blog:', err);
      showNotification('Failed to create blog post. Make sure the backend server is running.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (blog) => {
    setEditingBlog(blog);
    setEditTitle(blog.newTitle);
    setEditContent(blog.newContent);
  };

  // Handle Update Blog
  const handleUpdateBlog = async (e) => {
    e.preventDefault();
    if (!editTitle.trim() || !editContent.trim()) {
      showNotification('Title and Content cannot be empty.', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      await axios.put(`${API_BASE}/blogs/${editingBlog._id}`, {
        newTitle: editTitle.trim(),
        newContent: editContent.trim()
      });

      showNotification('Blog post updated successfully!', 'success');
      setEditingBlog(null);
      fetchBlogs();
    } catch (err) {
      console.error('Error updating blog:', err);
      showNotification('Failed to update blog post.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Blog
  const handleDeleteBlog = async (id, title) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`);
    if (!confirmDelete) return;

    try {
      await axios.delete(`${API_BASE}/blogs/${id}`);
      showNotification('Blog post deleted successfully.', 'success');
      setBlogs(blogs.filter((b) => b._id !== id));
    } catch (err) {
      console.error('Error deleting blog:', err);
      showNotification('Failed to delete blog post.', 'error');
    }
  };

  const totalLikes = blogs.reduce((sum, b) => sum + (b.likes || 0), 0);

  return (
    <div className="admin-panel py-8 min-h-screen">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-2xl p-8 mb-8 shadow-md">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="inline-block bg-orange-500 text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider mb-2">
              Admin Workspace
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold">Blog Management Dashboard</h1>
            <p className="text-gray-300 mt-1">
              Signed in as: <span className="font-semibold text-orange-300">{user?.email}</span> (Admin)
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-5 py-2.5 rounded-lg transition duration-200 shadow flex items-center gap-2"
          >
            <span>{showAddForm ? '✕ Close Form' : '+ Add New Blog Post'}</span>
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-700">
          <div className="bg-gray-800/80 p-4 rounded-xl border border-gray-700">
            <div className="text-gray-400 text-xs font-medium uppercase">Total Blogs</div>
            <div className="text-3xl font-bold text-white mt-1">{blogs.length}</div>
          </div>
          <div className="bg-gray-800/80 p-4 rounded-xl border border-gray-700">
            <div className="text-gray-400 text-xs font-medium uppercase">Total Likes Received</div>
            <div className="text-3xl font-bold text-orange-400 mt-1">{totalLikes}</div>
          </div>
          <div className="bg-gray-800/80 p-4 rounded-xl border border-gray-700 col-span-2 sm:col-span-1">
            <div className="text-gray-400 text-xs font-medium uppercase">Backend Status</div>
            <div className="text-lg font-semibold text-green-400 mt-2 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-green-400 inline-block"></span> Connected (MongoDB)
            </div>
          </div>
        </div>
      </div>

      {/* Notification Banner */}
      {message.text && (
        <div
          className={`mb-6 p-4 rounded-lg font-medium transition ${
            message.type === 'error'
              ? 'bg-red-100 text-red-700 border border-red-300'
              : 'bg-green-100 text-green-700 border border-green-300'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Add New Blog Form */}
      {showAddForm && (
        <div className="mb-10 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b">Create New Blog Post</h2>
          <form onSubmit={handleCreateBlog} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Blog Title</label>
              <input
                type="text"
                placeholder="e.g. Modern Full Stack Best Practices"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Blog Content</label>
              <textarea
                placeholder="Write your article content here..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                rows="5"
                required
              />
            </div>
            <div className="flex gap-3 justify-end mt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-medium transition shadow disabled:opacity-50"
              >
                {isSubmitting ? 'Publishing...' : 'Publish Blog'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Blogs List Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mb-12">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800">All Published Blogs ({blogs.length})</h2>
          <button
            onClick={fetchBlogs}
            className="text-sm text-gray-600 hover:text-orange-500 transition font-medium"
          >
            ↻ Refresh List
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading blog posts from MongoDB...</div>
        ) : blogs.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No blog posts found in the database. Click "+ Add New Blog Post" above to add your first post!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-700 text-xs uppercase font-semibold border-b">
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Likes</th>
                  <th className="py-3 px-4">Excerpt</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {blogs.map((blog) => (
                  <tr key={blog._id} className="hover:bg-gray-50 transition">
                    <td className="py-4 px-4 font-semibold text-gray-900 max-w-xs truncate">
                      {blog.newTitle}
                    </td>
                    <td className="py-4 px-4 text-gray-500 whitespace-nowrap">
                      {blog.date}
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        ❤️ {blog.likes || 0}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-500 max-w-md truncate">
                      {blog.newContent}
                    </td>
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => openEditModal(blog)}
                        className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-md font-medium text-xs mr-2 transition"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDeleteBlog(blog._id, blog.newTitle)}
                        className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-md font-medium text-xs transition"
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Blog Modal */}
      {editingBlog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative animate-fade-in">
            <div className="flex justify-between items-center mb-4 pb-2 border-b">
              <h3 className="text-xl font-bold text-gray-800">Edit Blog Post</h3>
              <button
                onClick={() => setEditingBlog(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleUpdateBlog} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Content</label>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  rows="6"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setEditingBlog(null)}
                  className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default AdminPanel;
