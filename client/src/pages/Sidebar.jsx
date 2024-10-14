import React from 'react';

const Sidebar = () => {
  const menuItems = ['Followings', 'Subscriptions', "Today's Feeds", 'Watch Later', 'Setting'];

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-48 min-w-[10rem] bg-gray-100 p-2 overflow-y-auto transition-transform duration-300 ease-in-out transform md:translate-x-0 -translate-x-full md:relative md:top-0">
      <ul>
        {menuItems.map((item, index) => (
          <li key={index} className="mb-1">
            <button className="w-full text-left py-2 px-3 rounded hover:bg-gray-200 transition-colors duration-200 text-sm">
              {item}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;
