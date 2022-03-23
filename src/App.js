import React from 'react';
import { Route, Routes } from "react-router-dom";
import PotreeViewer from './components/PotreeViewer'
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<PotreeViewer />}/>
      <Route path="/:viewType" element={<PotreeViewer />}/>
    </Routes>
  );
}

export default App;
