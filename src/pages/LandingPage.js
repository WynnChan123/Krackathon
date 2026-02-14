import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LandingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    navigate('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">$</span>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            SaveSmart
          </span>
        </div>
        <Link
          to="/login"
          className="px-6 py-2 text-indigo-600 font-semibold hover:bg-indigo-50 rounded-lg transition-all duration-200"
        >
          Sign In
        </Link>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block mb-4 px-4 py-2 bg-indigo-100 rounded-full">
            <span className="text-indigo-700 font-semibold text-sm">
              🎯 Smart Shopping Made Simple
            </span>
          </div>
          
          <h1 className="text-6xl font-bold mb-6 leading-tight">
            Find the{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Cheapest Supermarkets
            </span>
            <br />
            Near You
          </h1>
          
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Save money on groceries with our intelligent price comparison tool. 
            We help you discover the most affordable supermarkets in your area, 
            so you can stretch your budget further.
          </p>

          <div className="flex gap-4 justify-center">
            <Link
              to="/register"
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-200"
            >
              Get Started Free
            </Link>
            <button className="px-8 py-4 bg-white text-gray-700 font-semibold rounded-xl border-2 border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-200">
              Learn More
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-24 max-w-5xl mx-auto">
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4">
              <span className="text-3xl">📍</span>
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-800">Location-Based Search</h3>
            <p className="text-gray-600">
              Find supermarkets near you with real-time pricing data and distance calculations.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
              <span className="text-3xl">💰</span>
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-800">Price Comparison</h3>
            <p className="text-gray-600">
              Compare prices across multiple stores instantly and see where you'll save the most.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center mb-4">
              <span className="text-3xl">📊</span>
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-800">Smart Analytics</h3>
            <p className="text-gray-600">
              Track your savings over time and get personalized recommendations for better deals.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
