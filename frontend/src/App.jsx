import React from "react";
import Header from "./components/Header";
import { Outlet, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  const location = useLocation();
  return (
    <>
      <Header />
      <ToastContainer />
      <Outlet />
    </>
  );
};

export default App;
