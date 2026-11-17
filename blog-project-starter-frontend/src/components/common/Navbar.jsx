import React from 'react';
import './Navbar.css';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function Navbar() {
  const navigate = useNavigate();
  const { user, isAdmin, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/home');
  };

  return (
    <nav className="py-5 flex flex-wrap justify-between items-center border-b border-gray-100 mb-4">
      <Link to="/home" className="text-2xl font-extrabold text-gray-900 tracking-tight hover:text-orange-500 transition">
        Personal<span className="text-orange-500">.</span>
      </Link>

      <div className="flex items-center gap-1 sm:gap-4 flex-wrap">
        <Link className="px-3 py-1 font-medium text-gray-700 hover:text-orange-500 transition" to="/home">
          Home
        </Link>
        <Link className="px-3 py-1 font-medium text-gray-700 hover:text-orange-500 transition" to="/blogs">
          Blogs
        </Link>
        <Link className="px-3 py-1 font-medium text-gray-700 hover:text-orange-500 transition" to="/about">
          About
        </Link>

        {isAdmin && (
          <Link
            to="/admin"
            className="px-3 py-1 rounded-md text-sm font-semibold bg-purple-100 text-purple-700 hover:bg-purple-200 transition flex items-center gap-1"
          >
            ⚙️ Admin Panel
          </Link>
        )}

        {user ? (
          <div className="flex items-center gap-2 ml-2">
            <span className="text-xs sm:text-sm font-medium text-gray-600 bg-gray-100 py-1 px-2.5 rounded-full border">
              👤 {user.email?.split('@')[0]}
            </span>
            <button
              onClick={handleLogout}
              className="bg-gray-800 hover:bg-black text-white text-xs sm:text-sm py-1.5 px-3.5 rounded-full transition shadow-sm font-medium"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 ml-2">
            <button
              className="button-style text-xs sm:text-sm py-1.5 px-4"
              onClick={() => navigate('/login')}
            >
              Login
            </button>
            <button
              className="border border-orange-400 text-orange-500 hover:bg-orange-50 text-xs sm:text-sm py-1.5 px-3.5 rounded-full transition font-medium"
              onClick={() => navigate('/signup')}
            >
              Register
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
