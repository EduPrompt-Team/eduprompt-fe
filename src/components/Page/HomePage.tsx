import HomepageCarousel from '@/components/Carousel/HomepageCarousel'
import HeaderHomepage from '@/components/Layout/HeaderHomepage'
import PromptFeatures from '@/components/Introduction/PromptFeatures'
import PromptList from '@/components/Introduction/PromptList'
const HomePage = () => {
    return (
        <div>
            <HeaderHomepage />
            <HomepageCarousel />
            <PromptFeatures />
            <PromptList />
        </div>
    )
}

export default HomePage