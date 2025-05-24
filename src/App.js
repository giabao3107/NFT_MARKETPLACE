import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import CreateItem from './pages/CreateItem';
import MyNFTs from './pages/MyNFTs';
import CreatedNFTs from './pages/CreatedNFTs';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create-item" element={<CreateItem />} />
          <Route path="/my-nfts" element={<MyNFTs />} />
          <Route path="/created-nfts" element={<CreatedNFTs />} />
        </Routes>
        <ToastContainer position="top-right" autoClose={5000} />
        
        {/* Footer */}
        <footer className="app-footer">
          <p>Created By Group 6 - Class 243BFF400602</p>
        </footer>
      </div>
    </Router>
  );
}

export default App; 