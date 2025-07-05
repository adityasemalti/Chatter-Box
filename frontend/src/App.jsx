import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import HomePage from './pages/HomePage';
import Register from './pages/Register';
import { Toaster } from 'react-hot-toast';
import ProfilePage from './pages/ProfilePage';
import { userStore } from './store/UserStore';

const App = () => {
  const {authUser,checkAuth}= userStore()
  useEffect(()=>{
    checkAuth();

  },[checkAuth])
  return (
    <>
      <Toaster />
      <Routes>
        <Route path='/' element={authUser?<HomePage />:<Login/>} />
        <Route path='/profile' element={authUser?<ProfilePage />:<Login/>} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
      </Routes>
    </>
  );
};

export default App;
