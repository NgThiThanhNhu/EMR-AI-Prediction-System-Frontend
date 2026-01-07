import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import Home from "./pages/Home/Home";
import { Routes, Route } from "react-router-dom";
import Patient from "./pages/Patient";
function App() {
  return (
    <>
      <Routes>
        {/* <Route path="/" element={<Home />} /> */}
        {/* <Route path="/login*" element={<Login />} /> */}
        <Route path="/" element={<Patient />} />
      </Routes>
    </>
  );
}

export default App;
