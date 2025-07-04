import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { toast } from 'react-toastify';

const Profile = () => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await authAPI.getProfile();
        setProfile(response.data);
      } catch (error) {
        toast.error('Failed to fetch profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      toast.error('Logout failed');
    }
  };

  const displayProfile = profile || user;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div
          className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"
          role="status"
          aria-label="Loading"
        ></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 px-4">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="p-6 flex flex-col items-center">
          <img
            src={`https://ui-avatars.com/api/?name=${displayProfile.name}&background=4ade80&color=fff`}
            alt="avatar"
            className="w-24 h-24 rounded-full shadow mb-4"
          />
          <h2 className="text-2xl font-semibold text-gray-800">{displayProfile.name}</h2>
          <p className="text-gray-500">{displayProfile.email}</p>
          <span className="mt-2 inline-block px-3 py-1 text-sm bg-green-100 text-green-700 rounded-full">
            {displayProfile.role || 'User'}
          </span>

          <button
            className="mt-6 px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded shadow transition"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
