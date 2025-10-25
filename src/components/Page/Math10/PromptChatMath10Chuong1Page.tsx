import SiderBar from '../../ProfileUser/SiderBar'
import HeaderHomepage from '../../Layout/HeaderHomepage'
import PromptChatMath10Chuong1 from '../../Introduction/Toan10-Math/PromptChatMath10chuong1'

const PromptChatMath10Chuong1Page = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <HeaderHomepage />
      <div className="flex">
        <SiderBar />
        <main className="flex-1 bg-[#23233a] text-white min-h-[calc(100vh-4rem)] px-0">
          <PromptChatMath10Chuong1 />
        </main>
      </div>
    </div>
  )
}

export default PromptChatMath10Chuong1Page