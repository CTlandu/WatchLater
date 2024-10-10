import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import FollowingForm from './FollowingForm';
import FollowingTable from './FollowingTable';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const SubscribePage = () => {
  const [platform, setPlatform] = useState('YouTube');
  const [channelId, setChannelId] = useState('');
  const [followings, setFollowings] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFollowings();
  }, []);

  const fetchFollowings = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_BASE_URL}/following`);
      setFollowings(response.data);
    } catch (error) {
      console.error('获取数据失败:', error);
      setError('获取数据失败: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${API_BASE_URL}/following/${editingId}`, {
          platform,
          channelId,
        });
        setEditingId(null);
      } else {
        await axios.post(`${API_BASE_URL}/following`, { platform, channelId });
      }
      setChannelId('');
      fetchFollowings();
    } catch (error) {
      console.error('提交失败:', error);
      setError('提交失败: ' + error.message);
    }
  };

  const handleEdit = (following) => {
    setPlatform(following.platform);
    setChannelId(following.channelId);
    setEditingId(following._id);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/following/${id}`);
      fetchFollowings();
    } catch (error) {
      console.error('删除失败:', error);
      setError('删除失败: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-grow flex justify-center">
        <div className="flex w-full max-w-6xl mt-16">
          <Sidebar />
          <main className="flex-grow p-4">
            <h2 className="text-2xl font-semibold mb-4">Subscriptions</h2>
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-lg font-semibold mb-3">Add your subscribed!</h3>
              <FollowingForm
                platform={platform}
                channelId={channelId}
                editingId={editingId}
                onPlatformChange={setPlatform}
                onChannelIdChange={setChannelId}
                onSubmit={handleSubmit}
              />
              {isLoading ? (
                <div className="text-center py-4">加载中...</div>
              ) : error ? (
                <div className="text-center py-4 text-red-500">{error}</div>
              ) : (
                <FollowingTable
                  followings={followings}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default SubscribePage;
