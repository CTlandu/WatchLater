import React from 'react';

const FollowingForm = ({ platform, channelId, onPlatformChange, onChannelIdChange, onSubmit }) => {
  return (
    <form onSubmit={onSubmit} className="mb-4">
      <div className="flex items-center space-x-2">
        <select
          value={platform}
          onChange={(e) => onPlatformChange(e.target.value)}
          className="block w-1/3 bg-white border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="YouTube">YouTube</option>
          {/* 可以在这里添加其他平台选项 */}
        </select>
        <input
          type="text"
          value={channelId}
          onChange={(e) => onChannelIdChange(e.target.value)}
          className="block w-1/2 bg-white border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="请输入频道ID或用户名..."
        />
        <button
          type="submit"
          className="w-1/6 bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded text-sm focus:outline-none focus:shadow-outline"
        >
          添加
        </button>
      </div>
    </form>
  );
};

export default FollowingForm;
