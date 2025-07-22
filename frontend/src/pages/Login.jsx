import React, { useContext, useState } from 'react';
import right from '../assets/right.jpeg'
import { useNavigate } from 'react-router-dom';
import axios from 'axios'
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const [loading, setLoading] = useState(false)
  const {login} = useContext(AuthContext)
    const navigate= useNavigate()
    const [formData,setFormData]= useState({
        email:'',
        password:'',
    })

    const onChangeHandle = (e)=>{
        setFormData({...formData,[e.target.name]:e.target.value})
    }

    const onSubmitHandle= async(e)=>{
        e.preventDefault();
        setLoading(true)
       try {
        await login(formData)
        navigate('/')
        setLoading(false)
       } catch (error) {
        toast.error("Invalid Credentials")
       }
        
    }

  return (
    <div className="flex h-[100vh] bg-[#dbe1ec] justify-center items-center">
      <div className="w-[90%] h-[80%] max-w-6xl bg-white flex flex-col md:flex-row rounded-3xl overflow-hidden shadow-2xl">
        {/* Left: Registration Form */}
        <div className="md:w-1/2 p-10 bg-gradient-to-b from-[#fefcea] to-[#f1f1f1] flex flex-col justify-between">
          <div>
            <div className="text-xl font-semibold mb-8">Chatter-Box</div>
            <h2 className="text-2xl font-semibold mb-2">Login into your account..</h2>
            <p className="text-sm text-gray-600 mb-6">And Connect to your Loved Ones</p>

            <form className="flex flex-col space-y-4">
              <input
              onChange={onChangeHandle}
                type="email"
                name='email'
                placeholder="Email"
                className="px-4 py-3 rounded-full border border-gray-300 focus:outline-none"
              />
              <div className="relative">
                <input
                onChange={onChangeHandle}
                  type="password"
                  name='password'
                  placeholder="Password"
                  className="px-4 py-3 pr-10 rounded-full border border-gray-300 focus:outline-none w-full"
                />
              </div>
              <button
              onClick={onSubmitHandle}
                type="submit"
                className="bg-yellow-400 hover:bg-yellow-500 text-white py-3 rounded-full font-semibold transition duration-300"
              >
                {
                  loading ?"Logging...":"Login" 
                }
              </button>
            </form>

            <div className="flex justify-between items-center mt-6 space-x-4">
              <button className="flex-1 py-2 border border-black rounded-full flex justify-center items-center space-x-2">
                <img src="https://img.icons8.com/ios-filled/20/000000/mac-os.png" alt="Apple" />
                <span>Apple</span>
              </button>
              <button className="flex-1 py-2 border border-black rounded-full flex justify-center items-center space-x-2">
                <img src="https://img.icons8.com/color/20/000000/google-logo.png" alt="Google" />
                <span>Google</span>
              </button>
            </div>
          </div>

          <div className="text-sm text-center mt-10 text-gray-600">
            Don't Have any account?{' '}
            <p onClick={()=>{navigate('/register')}} className="text-blue-600 cursor-pointer hover:underline">
              Sign Up
            </p>
            <br />
            <a href="#" className="underline text-xs mt-2 block">
              Terms & Conditions
            </a>
          </div>
        </div>

        {/* Right: Image and UI mock */}
        <div className="md:w-1/2 relative">
          <img
            src={right}
            alt="Right Side"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default Login;
