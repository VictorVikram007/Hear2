import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [profile, setProfile] = useState({
    full_name: '',
    mobile: '',
    alternate_mobile: '',
    email: '',
    gender: '',
    date_of_birth: '',
    location: '',
    hint_name: '',
  });

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        navigate('/login');
        return;
      }

      await fetchProfile(user);
    } catch (error) {
      console.error('Error checking user:', error);
      setMessage('Error loading user data');
      setMessageType('error');
    } finally {
      setPageLoading(false);
    }
  };

  const fetchProfile = async (user) => {
    try {
      console.log('Fetching profile for user:', user.id);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        if (error.message.includes('found no rows')) {
          await createProfile(user);
        } else {
          throw error;
        }
      } else {
        setProfile({
          ...data,
          email: user.email
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setMessage('Error loading profile data');
      setMessageType('error');
    }
  };

  const createProfile = async (user) => {
    try {
      console.log('Creating new profile for user:', user.id);
      
      const { data, error } = await supabase
        .from('profiles')
        .insert([{
          id: user.id,
          email: user.email,
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      setProfile({
        ...data,
        email: user.email
      });
    } catch (error) {
      console.error('Error creating profile:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setMessageType('');

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const updates = {
        ...profile,
        id: user.id,
        email: user.email,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(updates)
        .eq('id', user.id);

      if (error) throw error;

      setMessage('Profile updated successfully!');
      setMessageType('success');
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Error updating profile. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (pageLoading) {
    return (
      <div className="profile-container">
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <h2>Account Settings</h2>
      
      {message && (
        <div className={`message ${messageType}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-field">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={profile.email || ''}
            disabled
            className="form-control"
          />
          <small>Email cannot be changed</small>
        </div>

        <div className="form-field">
          <label>Full Name</label>
          <input
            type="text"
            name="full_name"
            value={profile.full_name || ''}
            onChange={handleChange}
            className="form-control"
          />
        </div>

        <div className="form-field">
          <label>Mobile</label>
          <input
            type="tel"
            name="mobile"
            value={profile.mobile || ''}
            onChange={handleChange}
            className="form-control"
          />
        </div>

        <div className="form-field">
          <label>Alternate Mobile</label>
          <input
            type="tel"
            name="alternate_mobile"
            value={profile.alternate_mobile || ''}
            onChange={handleChange}
            className="form-control"
          />
        </div>

        <div className="form-field">
          <label>Gender</label>
          <select
            name="gender"
            value={profile.gender || ''}
            onChange={handleChange}
            className="form-control"
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="form-field">
          <label>Date of Birth</label>
          <input
            type="date"
            name="date_of_birth"
            value={profile.date_of_birth || ''}
            onChange={handleChange}
            className="form-control"
          />
        </div>

        <div className="form-field">
          <label>Location</label>
          <input
            type="text"
            name="location"
            value={profile.location || ''}
            onChange={handleChange}
            className="form-control"
          />
        </div>

        <div className="form-field">
          <label>Hint Name</label>
          <input
            type="text"
            name="hint_name"
            value={profile.hint_name || ''}
            onChange={handleChange}
            className="form-control"
          />
        </div>

        <button 
          type="submit" 
          className="submit-button"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default Profile;
