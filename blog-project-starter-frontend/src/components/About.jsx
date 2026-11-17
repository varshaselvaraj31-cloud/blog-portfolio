import React, { useEffect } from 'react';
import Footer from './common/Footer';
import BlogProfileImage from '../assets/Blog Website Design.jpg';
import { useNavigate } from 'react-router-dom';

function About() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="py-10">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">
            About <span className="text-orange-500">Me</span>
          </h1>
          <p className="text-gray-500 mt-2">Get to know the developer behind this Blog Portfolio</p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-10 bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-12">
          <img
            src={BlogProfileImage}
            alt="Jacky Thomas"
            className="w-56 h-56 object-cover rounded-2xl shadow-md"
          />
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Jacky Thomas</h2>
            <p className="text-orange-500 font-semibold mb-4">Full Stack Developer & Tech Enthusiast</p>
            <p className="text-gray-600 mb-4 leading-relaxed">
              I am a passionate software engineer specializing in building modern, scalable web applications with React, Node.js, Express, MongoDB, and Firebase. 
              I love turning complex problems into elegant, user-friendly digital experiences.
            </p>
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="bg-orange-50 text-orange-600 text-xs font-semibold px-3 py-1 rounded-full">React.js</span>
              <span className="bg-orange-50 text-orange-600 text-xs font-semibold px-3 py-1 rounded-full">Node.js</span>
              <span className="bg-orange-50 text-orange-600 text-xs font-semibold px-3 py-1 rounded-full">Express</span>
              <span className="bg-orange-50 text-orange-600 text-xs font-semibold px-3 py-1 rounded-full">MongoDB</span>
              <span className="bg-orange-50 text-orange-600 text-xs font-semibold px-3 py-1 rounded-full">Firebase Auth</span>
              <span className="bg-orange-50 text-orange-600 text-xs font-semibold px-3 py-1 rounded-full">Tailwind CSS</span>
            </div>
            <button
              onClick={() => navigate('/blogs')}
              className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-2.5 rounded-lg transition shadow"
            >
              Explore My Articles
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default About;
