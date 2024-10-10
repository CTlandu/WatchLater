import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import FollowingForm from './FollowingForm';
import FollowingTable from './FollowingTable';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const SubscribePage = () => {
  const [userId, setUserId] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const [platform, setPlatform] = useState('YouTube');
  const [channelId, setChannelId] = useState('');
  const [followings, setFollowings] = useState([]);
  const [youtubeInfo, setYoutubeInfo] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userId) {
      fetchFollowings();
    }
  }, [userId]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE_URL}/login`, { email: userEmail });
      setUserId(response.data.userId);
    } catch (error) {
      setError('登录失败: ' + error.message);
    }
  };

  const fetchFollowings = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_BASE_URL}/following/${userId}`);
      console.log('Fetched followings:', response.data);
      setFollowings(response.data);
      await fetchYoutubeInfo(response.data);
    } catch (error) {
      console.error('获取关注列表失败:', error);
      setError('获取数据失败: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };
  const fetchYoutubeInfo = async (followings) => {
    console.log('Fetching YouTube info for followings:', followings);
    const youtubeChannels = followings.filter((f) => f.platform === 'YouTube');
    console.log('Filtered YouTube channels:', youtubeChannels);
    if (youtubeChannels.length > 0) {
      const channelIds = youtubeChannels.map((f) => f.channel_index_id).filter((id) => id);
      console.log('Extracted channel IDs:', channelIds);
      if (channelIds.length > 0) {
        try {
          const response = await axios.get(
            `${API_BASE_URL}/youtube-info?channelIds=${channelIds.join(',')}`
          );
          console.log('YouTube info response:', response.data);
          setYoutubeInfo(response.data);
        } catch (error) {
          console.error('获取YouTube信息失败:', error);
        }
      } else {
        console.warn('No valid channel IDs found');
      }
    } else {
      console.warn('No YouTube channels found in followings');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/following/${userId}`, { platform, channelId });
      setChannelId('');
      fetchFollowings();
    } catch (error) {
      if (error.response && error.response.status === 404) {
        alert('无法找到该YouTube频道，请检查输入的用户名是否正确。');
      } else {
        setError('提交失败: ' + error.message);
      }
    }
  };

  const handleDelete = async (followingId) => {
    try {
      await axios.delete(`${API_BASE_URL}/following/${userId}/${followingId}`);
      fetchFollowings();
    } catch (error) {
      setError('删除失败: ' + error.message);
    }
  };

  if (!userId) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <form onSubmit={handleLogin} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <input
            type="email"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            placeholder="输入邮箱登录"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-4"
          >
            登录
          </button>
        </form>
      </div>
    );
  }

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
                onPlatformChange={setPlatform}
                onChannelIdChange={setChannelId}
                onSubmit={handleSubmit}
              />
              <FollowingTable
                followings={followings}
                onDelete={handleDelete}
                youtubeInfo={youtubeInfo}
                isLoading={isLoading}
                error={error}
              />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default SubscribePage;
