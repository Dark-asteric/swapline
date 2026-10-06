import Categories from "../common/Categories"
import CallToAction from "../common/CallToAction"
import FeaturedProducts from "../common/FeaturedProducts"
import HeroSection from "../common/HeroSection"
import HowItWorks from "../common/HowItWorks"
import WhyChooseUs from "../common/WhyChoiceUs"
import CreatePostBanner from "../common/CreatePostBanner";
import LatestPosts from "../common/LatestPosts"

const Home = () => {
    return (
        <>
            <HeroSection />
            <CreatePostBanner />
            <Categories />
            <LatestPosts />
            <FeaturedProducts />
            <HowItWorks />
            <WhyChooseUs />
            <CallToAction />
        </>
    )
}

export default Home