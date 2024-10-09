import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import axiosRetry from 'axios-retry';
import YouTubeInformation from './YouTubeInformation';

const API_BASE_URL = import.meta.env.VITE_API_URL;
console.log('API_BASE_URL:', API_BASE_URL);

axiosRetry(axios, { retries: 3, retryDelay: axiosRetry.exponentialDelay });

const FollowingTable = ({ followings, onEdit, onDelete }) => {
  const [youtubeInfo, setYoutubeInfo] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  console.log('FollowingTable rendered with followings:', followings);

  const fetchYouTubeInfo = useCallback(async () => {
    console.log('Fetching YouTube info...');
    console.log('Current followings:', followings);

    const youtubers = followings
      .filter((f) => f.platform === 'YouTube' && f.channelId)
      .map((f) => f.channelId);

    console.log('YouTube channel IDs:', youtubers);

    if (youtubers.length === 0) {
      console.log('No YouTube followings found');
      setYoutubeInfo({});
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const channelIdsParam = youtubers.join(',');
      const url = `${API_BASE_URL}/youtube-info?channelIds=${channelIdsParam}`;
      console.log('Fetching YouTube info from URL:', url);
      const response = await axios.get(url, { timeout: 10000 });
      console.log('Raw YouTube info received:', response.data);
      setYoutubeInfo(response.data);
      console.log('YouTube info set in state:', response.data);
    } catch (err) {
      console.error('获取YouTube信息失败:', err);
      setError(err.response?.data?.error || '获取YouTube信息失败');
    } finally {
      setLoading(false);
    }
  }, [followings]);

  useEffect(() => {
    if (followings.length > 0) {
      fetchYouTubeInfo();
    }
  }, [followings, fetchYouTubeInfo]);

  console.log('Current youtubeInfo state before rendering:', youtubeInfo);

  if (followings.length === 0) {
    return <p className="text-center py-4">暂无数据</p>;
  }

  return (
    <div className="space-y-6">
      <button
        onClick={fetchYouTubeInfo}
        className="mb-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        disabled={loading}
      >
        {loading ? '刷新中...' : '刷新YouTube信息'}
      </button>

      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">平台</th>
            <th className="py-2 px-4 border-b">频道ID</th>
            <th className="py-2 px-4 border-b">操作</th>
          </tr>
        </thead>
        <tbody>
          {followings.map((following) => (
            <tr key={following._id}>
              <td className="py-2 px-4 border-b">{following.platform}</td>
              <td className="py-2 px-4 border-b">{following.channelId}</td>
              <td className="py-2 px-4 border-b">
                <button
                  onClick={() => onEdit(following)}
                  className="mr-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
                >
                  编辑
                </button>
                <button
                  onClick={() => onDelete(following._id)}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                >
                  删除
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {loading && <div className="text-center py-4">加载YouTube信息中...</div>}
      {error && <div className="text-center py-4 text-red-500">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {followings
          .filter((following) => following.platform === 'YouTube')
          .map((following) => {
            const channelInfo = youtubeInfo[following.channelId];
            console.log('ChannelID:::::', following.channelId);
            return (
              <YouTubeInformation
                key={following._id}
                channelInfo={channelInfo}
                isLoading={loading}
              />
            );
          })}
      </div>
    </div>
  );
};

export default FollowingTable;
