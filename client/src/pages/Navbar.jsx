import React from 'react';

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-md z-10">
      <div className="container mx-auto px-4 py-2 flex justify-center items-center">
        <h1 className="text-2xl font-bold">WatchLater</h1>
      </div>
    </nav>
  );
};

export default Navbar;
