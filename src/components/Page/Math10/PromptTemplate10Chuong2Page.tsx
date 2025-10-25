import SiderBar from '../../ProfileUser/SiderBar'
import HeaderHomepage from '../../Layout/HeaderHomepage'
import PromptTemplate10Chuong2 from '../../Introduction/Toan10-Math/PromptTemplate10Chuong2'

const PromptTemplate10Chuong2Page = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <HeaderHomepage />
      <div className="flex">
        <SiderBar />
        <main className="flex-1 bg-[#23233a] text-white min-h-[calc(100vh-4rem)] px-0">
          <div className="p-8">
            <h1 className="text-3xl font-bold text-white mb-6">Template Chương 2 - Bất Phương Trình</h1>
            <div className="bg-[#1a1a2d] rounded-lg p-6 border border-[#2a2a44]">
              <PromptTemplate10Chuong2 />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default PromptTemplate10Chuong2Page