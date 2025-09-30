import React from 'react'
import SiderBar from '../ProfileUser/SiderBar'
import PromptStorage from '../ProfileUser/PromptStorage'
import HeaderHomepage from '../Layout/HeaderHomepage'

const PromptBarStoragePage = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <HeaderHomepage />
      <div className="flex">
        <SiderBar />
        <main className="flex-1 bg-[#23233a] text-white min-h-[calc(100vh-4rem)] px-0">
          <PromptStorage />
        </main>
      </div>
    </div>
  )
}

export default PromptBarStoragePage