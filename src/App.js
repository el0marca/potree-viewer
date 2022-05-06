import React from 'react';
import { Route, Routes } from "react-router-dom";
import PotreeViewer from './components/PotreeViewer.tsx'
import './App.css';
import { SignUp } from './components/SignUp';

function App() {
  return (
    <Routes>
      <Route path="/" element={<PotreeViewer />}/>
      <Route path="/:urlParams" element={<PotreeViewer />}/>
      <Route path='/signup' element={<SignUp/>}/>
    </Routes>
  );
}

export default App;
