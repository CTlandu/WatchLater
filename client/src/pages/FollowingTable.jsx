import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import axiosRetry from 'axios-retry';
import YouTubeInformation from './YouTubeInformation';

const API_BASE_URL = import.meta.env.VITE_API_URL;

axiosRetry(axios, { retries: 3, retryDelay: axiosRetry.exponentialDelay });

const FollowingTable = ({ followings, onEdit, onDelete }) => {
  const [youtubeInfo, setYoutubeInfo] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchYouTubeInfo = useCallback(async () => {
    const youtubers = followings
      .filter((f) => f.platform === 'YouTube' && f.channelId)
      .map((f) => f.channelId);

    if (youtubers.length === 0) {
      setYoutubeInfo({});
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const channelIdsParam = youtubers.join(',');
      const url = `${API_BASE_URL}/youtube-info?channelIds=${channelIdsParam}`;
      const response = await axios.get(url, { timeout: 10000 });
      setYoutubeInfo(response.data);
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

  if (followings.length === 0) {
    return <p className="text-center py-4 text-gray-500">暂无订阅数据</p>;
  }

  return (
    <div className="space-y-6">
      <button
        onClick={fetchYouTubeInfo}
        className="mb-4 bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded text-sm"
        disabled={loading}
      >
        {loading ? '刷新中...' : '刷新YouTube信息'}
      </button>

      <table className="min-w-full bg-white">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              平台
            </th>
            <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              频道ID
            </th>
            <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              操作
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {followings.map((following) => (
            <tr key={following._id}>
              <td className="py-2 px-4 text-sm">{following.platform}</td>
              <td className="py-2 px-4 text-sm">{following.channelId}</td>
              <td className="py-2 px-4 text-sm">
                <button
                  onClick={() => onEdit(following)}
                  className="mr-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-2 rounded text-xs"
                >
                  编辑
                </button>
                <button
                  onClick={() => onDelete(following._id)}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-2 rounded text-xs"
                >
                  删除
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {loading && <div className="text-center py-4 text-gray-500">加载YouTube信息中...</div>}
      {error && <div className="text-center py-4 text-red-500">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {followings
          .filter((following) => following.platform === 'YouTube')
          .map((following) => {
            const channelInfo = youtubeInfo[following.channelId];
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
