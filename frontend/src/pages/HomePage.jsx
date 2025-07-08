import React, { useState, useEffect } from 'react';
import Sidebar from '../component/Sidebar';
import ChatContainer from '../component/ChatContainer';
import { Menu } from 'lucide-react';
import { ChatContext } from '../context/ChatContext';

const HomePage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(
    localStorage.getItem("sidebarOpen") === "true"
  );

  const { selectedUser } = React.useContext(ChatContext);

  // Auto-close sidebar when user is selected (on small screens only)
  useEffect(() => {
    if (selectedUser && window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, [selectedUser]);

  // Save sidebar open state to localStorage
  useEffect(() => {
    localStorage.setItem("sidebarOpen", isSidebarOpen.toString());
  }, [isSidebarOpen]);

  return (
    <div className="w-screen h-screen bg-gradient-to-r from-red-800 via-yellow-400 to-orange-700 flex items-center justify-center p-2">

      {/* Responsive Container */}
      <div className="w-full h-full bg-black rounded-lg flex flex-col md:flex-row overflow-hidden relative">

        {/* Sidebar */}
        <div
          className={`fixed z-40 top-0 left-0 h-full w-[80%] max-w-[300px] bg-black transform transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
        >
          <Sidebar />
        </div>

        {/* Overlay for small screen */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-40 z-30 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Chat Container Section */}
        <div className="flex-1 relative p-2">
          {/* Menu Button on small screens */}
          {!isSidebarOpen && (
            <button
              className="absolute top-4 left-4 z-50 md:hidden bg-white text-black p-2 rounded-full shadow"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
          )}


          {/* Chat */}
          <div className="w-full h-full max-w-[600px] mx-auto">
            <ChatContainer />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
