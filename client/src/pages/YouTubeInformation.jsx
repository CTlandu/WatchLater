import React from 'react';

const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

const VideoItem = ({ video }) => (
  <div className="video-item mb-4 flex">
    <img src={video.thumbnail} alt={video.title} className="w-32 h-18 object-cover mr-4 rounded" />
    <div>
      <p className="font-medium text-sm">{video.title}</p>
      <p className="text-xs text-gray-500">
        发布时间: {new Date(video.publishedAt).toLocaleDateString()}
      </p>
    </div>
  </div>
);

const YouTubeInformation = ({ channelInfo }) => {
  if (!channelInfo) {
    return <div className="text-center py-4">加载中...</div>;
  }

  const { title, avatar, subscribers, videoCount, recentVideos } = channelInfo;

  if (!title || !avatar) {
    console.error('Invalid channel info:', channelInfo);
    return <div className="text-center py-4 text-red-500">无效的频道信息</div>;
  }

  return (
    <div className="youtube-info bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="channel-header p-4 flex items-center border-b">
        <img src={avatar} alt={title} className="channel-avatar w-16 h-16 rounded-full mr-4" />
        <div>
          <h3 className="text-xl font-bold">{title}</h3>
          <p className="text-gray-600">订阅数: {formatNumber(subscribers)}</p>
          <p className="text-gray-600">视频数: {formatNumber(videoCount)}</p>
        </div>
      </div>
      <div className="recent-videos p-4">
        <h4 className="text-lg font-semibold mb-2">最新视频:</h4>
        {recentVideos && recentVideos.length > 0 ? (
          recentVideos.map((video) => <VideoItem key={video.id} video={video} />)
        ) : (
          <p className="text-gray-500">暂无最新视频</p>
        )}
      </div>
    </div>
  );
};

export default YouTubeInformation;
