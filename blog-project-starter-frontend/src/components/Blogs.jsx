import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Footer from './common/Footer';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function Blogs() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchBlogs = () => {
    setLoading(true);
    axios
      .get(`${API_BASE}/blogs`)
      .then((res) => {
        setBlogs(res.data || []);
        setError('');
      })
      .catch((err) => {
        console.error('Error fetching blogs:', err);
        setError('Unable to load blogs from MongoDB. Please ensure backend is running.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchBlogs();
  }, []);

  const handleLike = async (blog_id) => {
    try {
      const response = await axios.patch(`${API_BASE}/blogs/like/${blog_id}`);
      if (response.status === 200) {
        // Optimistically update likes count in state
        setBlogs((prev) =>
          prev.map((b) => (b._id === blog_id ? { ...b, likes: (b.likes || 0) + 1 } : b))
        );
      }
    } catch (error) {
      console.error('Error liking the blog post:', error);
    }
  };

  const filteredBlogs = blogs.filter((blog) => {
    const titleMatch = (blog.newTitle || '').toLowerCase().includes(searchTerm.toLowerCase());
    const contentMatch = (blog.newContent || '').toLowerCase().includes(searchTerm.toLowerCase());
    return titleMatch || contentMatch;
  });

  return (
    <div className="blog-section py-10">
      {/* Title */}
      <div className="text-center mb-10">
        <h2 className="text-4xl md:text-5xl font-extrabold mb-3">
          Latest <span className="text-orange-500">Blogs</span> 📚
        </h2>
        <p className="text-gray-500 max-w-xl mx-auto">
          Explore articles on modern web development, backend engineering, cloud integration, and tutorials.
        </p>

        {/* Admin Shortcut if logged in as Admin */}
        {isAdmin && (
          <div className="mt-4 inline-flex items-center gap-3 bg-purple-50 border border-purple-200 px-4 py-2 rounded-full text-sm text-purple-700">
            <span>🛡️ You have Admin Access.</span>
            <button
              onClick={() => navigate('/admin')}
              className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-semibold hover:bg-purple-700 transition"
            >
              Open Admin Panel
            </button>
          </div>
        )}
      </div>

      {/* Search and Action Bar */}
      <div className="max-w-2xl mx-auto mb-10 px-4 flex gap-3">
        <input
          type="text"
          placeholder="Search articles by title or keyword..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none shadow-sm"
        />
        {isAdmin && (
          <button
            onClick={() => navigate('/admin')}
            className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-5 py-3 rounded-xl transition shadow flex items-center gap-1.5 whitespace-nowrap"
          >
            + Create Post
          </button>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="max-w-2xl mx-auto mb-8 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-center">
          <p className="font-semibold">{error}</p>
          <button
            onClick={fetchBlogs}
            className="mt-3 bg-red-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-red-700 transition"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && filteredBlogs.length === 0 && (
        <div className="text-center py-16 bg-gray-50 rounded-2xl max-w-xl mx-auto border border-gray-200">
          <div className="text-4xl mb-3">📝</div>
          <h3 className="text-xl font-bold text-gray-700">No blogs found</h3>
          <p className="text-gray-500 text-sm mt-1">
            {searchTerm ? 'No results matched your search term.' : 'No blog posts have been published yet.'}
          </p>
          {isAdmin && (
            <button
              onClick={() => navigate('/admin')}
              className="mt-4 bg-orange-500 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-orange-600 transition"
            >
              Add First Post via Admin Panel
            </button>
          )}
        </div>
      )}

      {/* Blogs Grid */}
      <div className="blogs-container grid grid-cols-1 md:grid-cols-2 gap-8 container mx-auto px-4 mb-16">
        {filteredBlogs.map((blog) => (
          <article
            key={blog._id}
            className="blog-post p-6 md:p-8 bg-white border border-gray-100 shadow-md hover:shadow-xl rounded-2xl transition duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full font-medium">
                  Article
                </span>
                <span>{blog.date}</span>
              </div>
              <h3 className="blog-title font-bold text-2xl text-gray-900 mb-3 hover:text-orange-500 transition">
                {blog.newTitle}
              </h3>
              <p className="blog-content text-gray-600 leading-relaxed mb-6 whitespace-pre-line">
                {blog.newContent}
              </p>
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <button
                onClick={() => handleLike(blog._id)}
                className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-red-500 transition py-1.5 px-3 rounded-lg hover:bg-red-50"
              >
                <span>❤️ Like</span>
                <span className="bg-gray-100 text-gray-800 text-xs py-0.5 px-2 rounded-full font-bold">
                  {blog.likes || 0}
                </span>
              </button>

              {isAdmin && (
                <button
                  onClick={() => navigate('/admin')}
                  className="text-xs text-purple-600 hover:text-purple-800 font-semibold underline"
                >
                  Manage Post
                </button>
              )}
            </div>
          </article>
        ))}
      </div>

      <Footer />
    </div>
  );
}

export default Blogs;
