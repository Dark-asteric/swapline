import { Outlet } from "react-router-dom"
import NavBar from "../components/common/NavBar"

const AuthLayout = () => {
  return (
    <>
        <NavBar />
        <Outlet />
    </>
  )
}

export default AuthLayout