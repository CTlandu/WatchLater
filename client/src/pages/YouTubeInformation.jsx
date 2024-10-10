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
    <img
      src={video.video_thumbnail}
      alt={video.video_title}
      className="w-32 h-18 object-cover mr-4 rounded"
    />
    <div>
      <p className="font-medium text-sm">{video.video_title}</p>
      <p className="text-xs text-gray-500">
        发布时间: {new Date(video.published_at).toLocaleDateString()}
      </p>
    </div>
  </div>
);

const YouTubeInformation = ({ channelInfo }) => {
  if (!channelInfo) {
    return <div className="text-center py-4">加载中...</div>;
  }

  const { channel_title, avatar, subscribers, video_count, recent_videos } = channelInfo;

  // 只显示最多3个视频
  const displayVideos = recent_videos && recent_videos.slice(0, 3);

  return (
    <div className="youtube-info bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="channel-header p-4 flex items-center border-b">
        <img
          src={avatar}
          alt={channel_title}
          className="channel-avatar w-16 h-16 rounded-full mr-4"
        />
        <div>
          <h3 className="text-xl font-bold">{channel_title}</h3>
          <p className="text-gray-600">订阅数: {formatNumber(subscribers)}</p>
          <p className="text-gray-600">视频数: {formatNumber(video_count)}</p>
        </div>
      </div>
      <div className="recent-videos p-4">
        <h4 className="text-lg font-semibold mb-2">最新视频:</h4>
        {displayVideos && displayVideos.length > 0 ? (
          displayVideos.map((video) => <VideoItem key={video.video_id} video={video} />)
        ) : (
          <p className="text-gray-500">暂无最新视频</p>
        )}
      </div>
    </div>
  );
};

export default YouTubeInformation;
