import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import ChatContainer from "../components/ChatContainer";
import RightSidebar from "../components/RightSidebar";

const HomePage = () => {
  const [selectedUser, setselectedUser] = useState(false);

  return (
    <div className="border w-full h-screen">
      <div
        className={`backdrop-blur-sm border-2 border-gray-600 rounded-2x1 overflow-hidden h-[100%] grid grid-cols-1 relative ${
          selectedUser
            ? "md:grid-cols-[1fr_1.5fr_1fr] xl:grid-cols-[1fr_2fr_1fr]"
            : "md:grid-cols-2"
        }`}
      >
        <Sidebar
          selectedUser={selectedUser}
          setselectedUser={setselectedUser}
        />
        <ChatContainer
          selectedUser={selectedUser}
          setselectedUser={setselectedUser}
        />
        <RightSidebar
          selectedUser={selectedUser}
          setselectedUser={setselectedUser}
        />
      </div>
    </div>
  );
};

export default HomePage;
