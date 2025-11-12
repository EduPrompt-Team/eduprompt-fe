import HomepageCarousel from '@/components/Carousel/HomepageCarousel'
import HeaderHomepage from '@/components/Layout/HeaderHomepage'
import PromptFeatures from '@/components/Introduction/PromptFeatures'
import PromptList from '@/components/Introduction/PromptList'
import ShoppingSection from '@/components/Shopping/ShoppingSection'

const HomePage = () => {
    return (
        <div>
            <HeaderHomepage />
            <HomepageCarousel />
            <PromptFeatures />
            <PromptList />
            <ShoppingSection />
        </div>
    )
}

export default HomePage