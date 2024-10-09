import React, { useState, useEffect } from "react";
import axios from "axios";
import axiosRetry from "axios-retry";

const API_BASE_URL = import.meta.env.VITE_API_URL;

axiosRetry(axios, { retries: 3, retryDelay: axiosRetry.exponentialDelay });

const YouTubeInformation = ({ nickname }) => {
  const [channelInfo, setChannelInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChannelInfo = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${API_BASE_URL}/youtube-info?nickname=${encodeURIComponent(
            nickname
          )}`,
          { timeout: 10000 } // 设置10秒超时
        );
        setChannelInfo(response.data);
      } catch (err) {
        console.error("获取频道信息失败:", err);
        setError(err.response?.data?.error || "获取频道信息失败");
      } finally {
        setLoading(false);
      }
    };

    fetchChannelInfo();
  }, [nickname]);

  if (loading) return <div className="text-center py-4">加载中...</div>;
  if (error)
    return <div className="text-center py-4 text-red-500">{error}</div>;
  if (!channelInfo) return null;

  return (
    <div className="youtube-info bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="channel-header p-4 flex items-center border-b">
        <img
          src={channelInfo.avatar}
          alt={channelInfo.title}
          className="channel-avatar w-16 h-16 rounded-full mr-4"
        />
        <div>
          <h3 className="text-xl font-bold">{channelInfo.title}</h3>
          <p className="text-gray-600">订阅数: {channelInfo.subscribers}</p>
          <p className="text-gray-600">视频数: {channelInfo.videoCount}</p>
        </div>
      </div>
      <div className="recent-videos p-4">
        <h4 className="text-lg font-semibold mb-2">最新视频:</h4>
        {channelInfo.recentVideos.map((video) => (
          <div key={video.id} className="video-item mb-4 flex">
            <img
              src={video.thumbnail}
              alt={video.title}
              className="w-32 h-18 object-cover mr-4"
            />
            <div>
              <p className="font-medium">{video.title}</p>
              <p className="text-sm text-gray-500">
                发布时间: {new Date(video.publishedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default YouTubeInformation;
