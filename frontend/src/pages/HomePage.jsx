import React from 'react'
import Sidebar from '../component/Sidebar'
import ChatContainer from '../component/ChatContainer'

const HomePage = () => {
  return (
    <div className="w-screen h-screen bg-gradient-to-r from-red-800 via-yellow-400 to-orange-700 flex items-center justify-center gap-10">
      <div className="w-[350px] h-[600px] rounded-lg">
        <Sidebar />
      </div>
      <div className='w-[600px] h-[650px]'>
        <ChatContainer/>
      </div>
    </div>
  )
}

export default HomePage
