import React, { useState, useEffect } from "react";
import axios from "axios";
import FollowingForm from "./FollowingForm";
import FollowingTable from "./FollowingTable";
const API_BASE_URL = import.meta.env.VITE_API_URL;

const Home = () => {
  const [platform, setPlatform] = useState("YouTube");
  const [channelId, setchannelId] = useState("");
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
      console.error("获取数据失败:", error);
      setError("获取数据失败: " + error.message);
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
      setchannelId("");
      fetchFollowings();
    } catch (error) {
      console.error("提交失败:", error);
      setError("提交失败: " + error.message);
    }
  };

  const handleEdit = (following) => {
    setPlatform(following.platform);
    setchannelId(following.channelId);
    setEditingId(following._id);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/following/${id}`);
      fetchFollowings();
    } catch (error) {
      console.error("删除失败:", error);
      setError("删除失败: " + error.message);
    }
  };

  if (isLoading) return <div className="text-black">加载中...</div>;
  if (error) return <div className="text-red-500">错误: {error}</div>;

  return (
    <div className="flex flex-col min-h-screen w-full bg-gray-100 text-black">
      <div className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">关注管理</h1>

        <FollowingForm
          platform={platform}
          channelId={channelId}
          editingId={editingId}
          onPlatformChange={setPlatform}
          onChannelIdChange={setchannelId}
          onSubmit={handleSubmit}
        />

        <FollowingTable
          followings={followings}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
};

export default Home;
