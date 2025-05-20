
import React from "react";
import DesktopSidebar from "./sidebar/DesktopSidebar";
import MobileSidebar from "./sidebar/MobileSidebar";

const Sidebar = () => {
  return (
    <>
      <DesktopSidebar />
      <MobileSidebar />
    </>
  );
};

export default Sidebar;
