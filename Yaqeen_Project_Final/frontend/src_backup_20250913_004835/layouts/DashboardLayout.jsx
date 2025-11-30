import React from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

export default function DashboardLayout({ children }){
  return (
    <div className="container">
      <aside className="sidebar"><Sidebar/></aside>
      <main className="main">
        <Topbar/>
        <div className="content">{children}</div>
      </main>
    </div>
  );
}
