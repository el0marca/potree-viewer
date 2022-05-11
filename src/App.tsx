import React from "react";
import { Route, Routes } from "react-router-dom";
import PotreeViewer from "./components/PotreeViewer";
import "./App.css";
import { SignUp } from "./components/SignUp";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<PotreeViewer />} />
      <Route path="/:urlParams" element={<PotreeViewer />} />
      <Route path="/signup" element={<SignUp />} />
    </Routes>
  );
};

export default App;
