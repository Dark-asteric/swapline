import { Outlet } from "react-router-dom"
import Footer from "../components/common/Footer"
import NavBar from "../components/common/NavBar"

const HomeLayout = () => {
    return (
        <div>
            <header>
                <NavBar/>
            </header>
            <main className="flex-1 pt-18">
                <Outlet></Outlet>
            </main>
            <footer>
                <Footer />
            </footer>
        </div>
    )
}

export default HomeLayout