import React from "react";
import { Route, Routes } from "react-router-dom";
import { PotreeContainer } from "./components/PotreeViewer";
import "./App.css";
import { SignUp } from "./components/SignUp";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<PotreeContainer />} />
      <Route path="/:urlParams" element={<PotreeContainer />} />
      <Route path="/signup" element={<SignUp />} />
    </Routes>
  );
};

export default App;
