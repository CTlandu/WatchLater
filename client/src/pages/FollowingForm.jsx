import React from "react";

const FollowingForm = ({
  platform,
  channelId,
  editingId,
  onPlatformChange,
  onChannelIdChange,
  onSubmit,
}) => {
  return (
    <form onSubmit={onSubmit} className="mb-8">
      <div className="flex items-center space-x-4">
        <select
          value={platform}
          onChange={(e) => onPlatformChange(e.target.value)}
          className="block w-1/3 bg-white border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option>YouTube</option>
          <option>Bilibili</option>
          <option>Reels</option>
          <option>Tiktok</option>
        </select>
        <input
          type="text"
          value={channelId}
          onChange={(e) => onChannelIdChange(e.target.value)}
          className="block w-1/2 bg-white border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="请输入用户名..."
        />
        <button
          type="submit"
          className="w-1/6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          {editingId ? "更新" : "添加"}
        </button>
      </div>
    </form>
  );
};

export default FollowingForm;
