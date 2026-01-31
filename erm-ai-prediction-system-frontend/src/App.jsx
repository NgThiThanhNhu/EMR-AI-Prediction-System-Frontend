import { useState } from "react";
import "./App.css";
import Home from "./pages/Home/Home";
import { Routes, Route } from "react-router-dom";
import Patient from "./pages/Patient";
import AdminHome from "./pages/admin-home/AdminHome"; 
import AdminProfile from "./pages/admin-profile/AdminProfile";
import PatientProfile from "./pages/patient-profile/PatientProfile";
import MedicalRecord from "./pages/medical-record/MedicalRecord";
import Booking from "./pages/booking/Booking";
import ERM from "./pages/erm/ERM";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* <Route path="/login*" element={<Login />} /> */}
        <Route path="/patient" element={<Patient />} />

        <Route path="/admin" element={<AdminHome />} />
        <Route path="/admin-profile" element={<AdminProfile />} />
        <Route path="/patient-profile" element={<PatientProfile />} />
        <Route path="/medical-record" element={<MedicalRecord />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/erm" element={<ERM />} />

      </Routes>
    </>
  );
}

export default App;