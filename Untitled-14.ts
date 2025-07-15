// Full working Supabase profile update and fetch example for React
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient'; // Adjust path as needed

function ProfileComponent() {
  const [formData, setFormData] = useState({
    fullName: '',
    gender: 'NOTSET',
    dob: '',
    location: '',
    altMobile: '',
    hintName: '',
  });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Fetch profile from Supabase
  const fetchProfile = async () => {
    setLoading(true);
    setMessage('');
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      setMessage('Not logged in');
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    if (data) {
      setFormData({
        fullName: data.full_name || '',
        gender: data.gender || 'NOTSET',
        dob: data.date_of_birth || '',
        location: data.location || '',
        altMobile: data.alternate_mobile || '',
        hintName: data.hint_name || '',
      });
    }
    if (error) setMessage(error.message);
    setLoading(false);
  };

  // Update profile in Supabase
  const handleSave = async () => {
    setEditing(false);
    setMessage('');
    setLoading(true);
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      setMessage('Not logged in');
      setLoading(false);
      return;
    }
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: formData.fullName,
        gender: formData.gender,
        date_of_birth: formData.dob,
        location: formData.location,
        alternate_mobile: formData.altMobile,
        hint_name: formData.hintName,
      })
      .eq('id', user.id);
    if (error) {
      setMessage('Update error: ' + error.message);
    } else {
      setMessage('Profile updated!');
      await fetchProfile();
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <div>
      {loading && <div>Loading...</div>}
      {message && <div>{message}</div>}
      <div>
        <input
          type="text"
          placeholder="Full Name"
          value={formData.fullName}
          onChange={e => setFormData({ ...formData, fullName: e.target.value })}
          disabled={!editing}
        />
        <select
          value={formData.gender}
          onChange={e => setFormData({ ...formData, gender: e.target.value })}
          disabled={!editing}
        >
          <option value="NOTSET">Not Set</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
        <input
          type="date"
          value={formData.dob}
          onChange={e => setFormData({ ...formData, dob: e.target.value })}
          disabled={!editing}
        />
        <input
          type="text"
          placeholder="Location"
          value={formData.location}
          onChange={e => setFormData({ ...formData, location: e.target.value })}
          disabled={!editing}
        />
        <input
          type="text"
          placeholder="Alternate Mobile"
          value={formData.altMobile}
          onChange={e => setFormData({ ...formData, altMobile: e.target.value })}
          disabled={!editing}
        />
        <input
          type="text"
          placeholder="Hint Name"
          value={formData.hintName}
          onChange={e => setFormData({ ...formData, hintName: e.target.value })}
          disabled={!editing}
        />
      </div>
      {editing ? (
        <>
          <button onClick={handleSave}>Save</button>
          <button onClick={() => setEditing(false)}>Cancel</button>
        </>
      ) : (
        <button onClick={() => setEditing(true)}>Edit Profile</button>
      )}
    </div>
  );
}

export default ProfileComponent;
