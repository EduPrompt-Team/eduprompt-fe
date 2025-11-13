import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const HomepageCarousel: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const navigate = useNavigate()
  
  // Dữ liệu carousel - có thể thay đổi theo nhu cầu
  const slides = [
    {
      id: 1,
      title: "Mua Prompt",
      description: "Khám phá hàng nghìn prompt AI được tối ưu cho giáo dục THPT",
      image: new URL('../../assets/Image/Carousel.png', import.meta.url).href,
      buttonText: "Mua ngay"
    },
    {
      id: 2,
      title: "Gói Prompt",
      description: "Khám phá các gói Prompt đẹp và tối ưu sẵn",
      image: new URL('../../assets/Image/Carousel2.png', import.meta.url).href,
      buttonText: "Xem gói"
    },
    {
      id: 3,
      title: "Bán Prompt",
      description: "Kết nối và chia sẻ kinh nghiệm với đồng nghiệp",
      image: new URL('../../assets/Image/Carousel3.png', import.meta.url).href,
      buttonText: "Tạo Prompt"
    }
  ]

  // Auto slide mỗi 5 giây
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [slides.length])

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  return (
    <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden bg-gradient-to-br from-[#1a1a2d] to-[#23233a]">
      {/* Slides Container */}
      <div 
        className="flex transition-transform duration-500 ease-in-out h-full"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide) => (
          <div key={slide.id} className="w-full h-full flex-shrink-0 relative">
            {/* Background Image */}
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              <div className="absolute inset-0 bg-black/40"></div>
            </div>
            
            {/* Content Overlay */}
            <div className="relative z-10 h-full flex items-center">
              <div className="container mx-auto px-6 md:px-12">
                <div className="max-w-2xl ml-8">
                  <h2 className="text-4xl md:text-6xl font-bold text-white mb-4 slide-up">
                    {slide.title}
                  </h2>
                  <p className="text-lg md:text-xl text-gray-200 mb-8 slide-up anim-delay-100">
                    {slide.description}
                  </p>
                  <button
                    onClick={() => {
                      switch (slide.id) {
                        case 1:
                          navigate('/Hire')
                          break
                        case 2:
                          navigate('/packages')
                          break
                        case 3:
                          navigate('/Sell')
                          break
                        default:
                          break
                      }
                    }}
                    className="bg-gradient-to-r from-rose-400 to-orange-400 text-white px-8 py-4 rounded-xl font-semibold hover:from-rose-500 hover:to-orange-500 transition-all duration-300 hover:scale-105 active:scale-95 slide-up anim-delay-200"
                  >
                    {slide.buttonText}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300 hover:scale-110 backdrop-blur-sm"
        aria-label="Previous slide"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300 hover:scale-110 backdrop-blur-sm"
        aria-label="Next slide"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide 
                ? 'bg-white scale-125' 
                : 'bg-white/50 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 h-1 bg-white/20 w-full">
        <div 
          className="h-full bg-gradient-to-r from-rose-400 to-orange-400 transition-all duration-100 ease-linear"
          style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
        />
      </div>
    </div>
  )
}

export default HomepageCarousel
