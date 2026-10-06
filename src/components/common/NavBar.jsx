import { use, useEffect, useRef, useState } from "react"
import { Link, NavLink } from "react-router-dom"
import { AuthContext } from "../../provider/AuthContext";
import Cart from "./Cart";

const NavBar = () => {
    const { user, logOut } = use(AuthContext);
    const [theme, setTheme] = useState(() => {
        return (
            localStorage.getItem("theme") ||
            (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
        )
    })

    const [showSearch, setShowSearch] = useState(false)
    const searchBtnRef = useRef(null)
    const searchBarRef = useRef(null)

    useEffect(() => {
        if (!showSearch) return

        const handleOutside = (e) => {
            const clickedBar = searchBarRef.current?.contains(e.target)
            const clickedBtn = searchBtnRef.current?.contains(e.target)
            if (!clickedBar && !clickedBtn) setShowSearch(false)
        }

        const handleEsc = (e) => {
            if (e.key === "Escape") setShowSearch(false)
        }

        document.addEventListener("pointerdown", handleOutside)
        document.addEventListener("keydown", handleEsc)

        return () => {
            document.removeEventListener("pointerdown", handleOutside)
            document.removeEventListener("keydown", handleEsc)
        }
    }, [showSearch])

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme)
        localStorage.setItem("theme", theme)
    }, [theme])

    const handleToggle = (e) => {
        setTheme(e.target.checked ? "dark" : "light")
    }

    // const linkClass = ({ isActive }) =>
    //     isActive
    //         ? "text-indigo-800 font-bold"
    //         : "text-indigo-500 hover:text-violet-700"

    const linkClass = ({ isActive }) =>
        `rounded-lg ${isActive
            ? "!bg-indigo-600 !text-white"
            : "!bg-base-200 hover:!bg-base-300"
        }`
    const links = (
        <>
            <li className="text-xl mr-2"><NavLink to="/" className={linkClass}>Home</NavLink></li>
            <li className="text-xl mr-2"><NavLink to="/shop" className={linkClass}>Shop</NavLink></li>
            <li className="text-xl mr-2"><NavLink to="/contact-us" className={linkClass}>Contact Us</NavLink></li>
            <li className="text-xl mr-2"><NavLink to="/about" className={linkClass}>About Us</NavLink></li>
            {user && <li className='text-xl mr-2'><NavLink to="/profile" className={linkClass}>My Profile</NavLink></li>}
        </>
    )

    return (
        <div className="navbar text-base-content shadow-md backdrop-blur-md px-20 fixed top-0 left-0 right-0 z-50 flex items-center justify-between">
            <div className="navbar-start w-full justify-between md:w-1/2 md:justify-start">
                {/* Mobile menu */}
                <div className="dropdown">
                    <div tabIndex={0} role="button" className="btn btn-ghost md:hidden">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
                        </svg>
                    </div>
                    <ul
                        tabIndex={-1}
                        className="menu menu-sm dropdown-content bg-base-100 text-base-content rounded-box z-10 mt-3 w-52 p-2 shadow">
                        {links}
                        <li><Cart /></li>
                        {/* <li><Link to="/post-product" className="btn btn-primary mx-5 rounded-xl">
                            Create post
                        </Link></li> */}
                        {
                            user ? (
                                <>
                                    <li><button onClick={logOut}>Logout</button></li>
                                    <li><Link to="/chats" className="btn btn-primary mx-5 rounded-xl">Messages</Link></li>
                                </>
                            ) : (
                                <>
                                    <li><Link to="/auth/login">Login</Link></li>
                                    <li><Link to="/auth/register">Register</Link></li>
                                </>
                            )
                        }
                    </ul>
                </div>

                {/* Logo + search */}
                <div className="flex items-center gap-4">
                    <button
                        ref={searchBtnRef}
                        type="button"
                        className="btn btn-ghost btn-circle md:hidden"
                        aria-label="Search"
                        onClick={() => setShowSearch((prev) => !prev)}
                    >
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2.5" fill="none" stroke="currentColor">
                                <circle cx="11" cy="11" r="8"></circle>
                                <path d="m21 21-4.3-4.3"></path>
                            </g>
                        </svg>
                    </button>

                    <Link to="/" className="text-xl animate__hinge">
                        <img className="w-32 h-13 rounded-2xl" src="/favicon.png" alt="Skillswap Logo" />
                    </Link>
                    <label className="input hidden md:flex gap-2 items-center">
                        <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2.5" fill="none" stroke="currentColor">
                                <circle cx="11" cy="11" r="8"></circle>
                                <path d="m21 21-4.3-4.3"></path>
                            </g>
                        </svg>
                        <input type="search" required placeholder="Search" />
                    </label>
                </div>
            </div>

            {/* Desktop menu */}
            <div className="navbar-center hidden md:flex gap-5">
                <ul className="menu menu-horizontal px-1">
                    {links}
                    <li><Cart/></li>
                    <li><Link to="/post-product" className="btn btn-primary mx-5 rounded-xl">
                        Create post
                    </Link></li>
                </ul>

                <div className="flex items-center">
                    {user ? (
                        <>
                            <li><Link to="/chats" className="btn btn-primary mx-5 rounded-xl">Messages</Link></li>
                            <div className="dropdown dropdown-end">
                                <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
                                    <div className="w-10 rounded-full">
                                        <img src={user?.photoURL}/>
                                    </div>
                                </label>
                                <ul
                                    tabIndex={0}
                                    className="menu menu-sm dropdown-content bg-base-100 text-base-content rounded-box z-10 mt-3 w-52 p-2 shadow"
                                >
                                    <li><Link to="/profile" className="btn btn-primary mb-2">Profile</Link></li>
                                    <li><button onClick={logOut}>Logout</button></li>
                                </ul>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="divider divider-horizontal"></div>
                            <Link to="/auth/login" className="btn btn-outline btn-primary text-lg rounded-2xl">
                                Login
                            </Link>
                            <div className="divider divider-horizontal"></div>
                            <Link to="/auth/register" className="btn btn-outline btn-primary text-lg rounded-2xl">
                                Register
                            </Link>
                        </>
                    )}
                </div>
                {/* Dark / light toggle */}
                <label className="toggle text-base-content">
                    <input
                        type="checkbox"
                        checked={theme === "dark"}
                        onChange={handleToggle}
                        aria-label="Toggle dark mode"
                    />
                    {/* sun */}
                    <svg aria-label="sun" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor">
                            <circle cx="12" cy="12" r="4"></circle>
                            <path d="M12 2v2"></path>
                            <path d="M12 20v2"></path>
                            <path d="m4.93 4.93 1.41 1.41"></path>
                            <path d="m17.66 17.66 1.41 1.41"></path>
                            <path d="M2 12h2"></path>
                            <path d="M20 12h2"></path>
                            <path d="m6.34 17.66-1.41 1.41"></path>
                            <path d="m19.07 4.93-1.41 1.41"></path>
                        </g>
                    </svg>
                    {/* moon */}
                    <svg aria-label="moon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor">
                            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
                        </g>
                    </svg>
                </label>
            </div>
            {showSearch && (
                <div className="absolute top-full left-0 right-0 bg-base-100 p-3 shadow-md md:hidden">
                    <label className="input input-bordered flex w-full items-center gap-2">
                        <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2.5" fill="none" stroke="currentColor">
                                <circle cx="11" cy="11" r="8"></circle>
                                <path d="m21 21-4.3-4.3"></path>
                            </g>
                        </svg>
                        <input type="search" placeholder="Search" autoFocus className="grow" />
                    </label>
                </div>
            )}
        </div>
    )
}

export default NavBar