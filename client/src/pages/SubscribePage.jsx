import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const SubscribePage = () => {
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
              <div className="flex items-center space-x-2 mb-4">
                <input
                  type="text"
                  placeholder="YouTube"
                  className="flex-grow border rounded px-3 py-2 text-sm"
                />
                <button className="bg-gray-800 text-white px-3 py-2 rounded hover:bg-gray-700 transition-colors duration-200 text-sm">
                  Add
                </button>
              </div>
              <h3 className="text-lg font-semibold mb-3">My Subscribes</h3>
              <ul className="space-y-2">
                {['Bilibili', 'YouTube', 'TikTok'].map((platform, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between bg-gray-100 rounded p-2 text-sm"
                  >
                    <span>{platform}</span>
                    <span className="text-gray-500">XXX, 18M</span>
                  </li>
                ))}
              </ul>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default SubscribePage;
