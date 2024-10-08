import React, { useState, useEffect } from "react";
import axios from "axios";

const YouTubeInfo = ({ username }) => {
  const [channelInfo, setChannelInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChannelInfo = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `/api/youtube-info?username=${username}`
        );
        setChannelInfo(response.data);
        setError(null);
      } catch (err) {
        setError("Failed to fetch channel info");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchChannelInfo();
  }, [username]);

  if (loading) return <div>加载中...</div>;
  if (error) return <div>错误: {error}</div>;
  if (!channelInfo) return null;

  return (
    <div className="youtube-info">
      <img
        src={channelInfo.avatar}
        alt={channelInfo.title}
        className="channel-avatar"
      />
      <h2>{channelInfo.title}</h2>
      <p>订阅者: {channelInfo.subscribers}</p>
      <p>视频数量: {channelInfo.videoCount}</p>
      {channelInfo.latestVideo && (
        <div className="latest-video">
          <h3>最新视频:</h3>
          <a
            href={channelInfo.latestVideo.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {channelInfo.latestVideo.title}
          </a>
        </div>
      )}
    </div>
  );
};

export default YouTubeInfo;
