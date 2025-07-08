import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import HomePage from './pages/HomePage';
import Register from './pages/Register';
import { Toaster } from 'react-hot-toast';
import ProfilePage from './pages/ProfilePage';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';

const App = () => {
  const {authUser } = useContext(AuthContext)
  return (
    <>
      <Toaster />
      <Routes>
        <Route path='/' element={authUser?<HomePage />: <Navigate to={"/login"}/>} />
        <Route path='/profile' element={<ProfilePage/>} />
        <Route path='/login' element={!authUser?<Login /> :<Navigate to={"/"}/>} />
        <Route path='/register' element={!authUser?<Register /> :<Navigate to={"/"}/>} />
      </Routes>
    </>
  );
};

export default App;
