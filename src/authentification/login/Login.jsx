import toast, { Toaster } from 'react-hot-toast';
import { Eye, EyeOff } from "lucide-react";
import { use, useState } from 'react';
import { AuthContext } from '../../provider/AuthContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Login = () => {
    const [errorMessage, setErrorMessage] = useState("");
    const { logIn, googleSignIn, setUser, forgotPassword } = use(AuthContext);
    const [showForgotModal, setShowForgotModal] = useState(false);
    const [resetEmail, setResetEmail] = useState("");
    const [resetLoading, setResetLoading] = useState(false);
    const [isShow, setIsShow] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogIn = (e) => {
        e.preventDefault();
        const form = e.target;
        const email = form.email.value;
        const password = form.password.value;
        logIn(email, password).then(() => {
            navigate(`${location.state ? location.state : '/'}`)
        })
            .catch(error => {
                setErrorMessage(error.message);
                toast.error(error.message);
            })
    }
    const handleGoogleSignIn = () => {
        googleSignIn()
            .then(result => {
                setUser(result.user)
                navigate('/')
            })
            .catch(error => {
                toast.error(error.message);
            })
    }

    const handleForgotPassword = (e) => {
        e.preventDefault();
        if (!resetEmail) return toast.error("Please enter your email.");
        setResetLoading(true);
        forgotPassword(resetEmail)
            .then(() => {
                toast.success("Reset link sent! Check your inbox.");
                setShowForgotModal(false);
                setResetEmail("");
            })
            .catch((error) => {
                toast.error(error.message);
            })
            .finally(() => {
                setResetLoading(false);
            });
    };
    return (
        <>
            <Toaster position="top-center" />
            <div className="mt-20 px-10 flex justify-center min-h-screen items-center mx-auto">
                <div className="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl py-10">
                    <p className="text-center pt-5 font-semibold text-2xl">Login to your account</p>
                    <div className="card-body">
                        <form onSubmit={handleLogIn}>
                            <fieldset className="fieldset">
                                <label className="label">Email</label>
                                <input type="email" name="email" className="input" placeholder="Email" required />
                                <label className="label">Password</label>
                                <div className="flex relative">
                                    <input type={isShow ? "text" : "password"} name="password" className="input" placeholder="Password" required />
                                    <button type="button" onClick={() => setIsShow(!isShow)} className="absolute top-1/2 -translate-y-1/2 right-10">
                                        {isShow
                                            ? <EyeOff size={16} color="#aaaaaa" strokeWidth={1.75} />
                                            : <Eye size={16} color="#aaaaaa" strokeWidth={1.75} />
                                        }
                                    </button>
                                </div>
                                <div><button onClick={() => setShowForgotModal(true)} className="link link-hover">Forgot password?</button></div>
                                {errorMessage && <p className="text-red-500 text-md">{errorMessage}</p>}
                                <button type="submit" className="btn btn-neutral mt-4">Login</button>
                            </fieldset>
                        </form>
                        <button onClick={handleGoogleSignIn} className="btn bg-black text-gray-300 rounded-md mt-2 border-[#e5e5e5]">
                            <svg aria-label="Google logo" width="16" height="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><g><path d="m0 0H512V512H0" fill="#fff"></path><path fill="#34a853" d="M153 292c30 82 118 95 171 60h62v48A192 192 0 0190 341"></path><path fill="#4285f4" d="m386 400a140 175 0 0053-179H260v74h102q-7 37-38 57"></path><path fill="#fbbc02" d="m90 341a208 200 0 010-171l63 49q-12 37 0 73"></path><path fill="#ea4335" d="m153 219c22-69 116-109 179-50l55-54c-78-75-230-72-297 55"></path></g></svg>
                            Login with Google
                        </button>
                        <p className="text-xl font-semibold text-center mt-2">Don't have an accout ? <Link to="/auth/register" className="text-red-600 ">Register</Link></p>
                    </div>
                </div>
            </div>
            {showForgotModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-base-100 rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-8">
                        <h3 className="text-xl font-bold mb-1">Reset your password</h3>
                        <p className="text-sm text-gray-500 mb-6">
                            Enter your email and we'll send you a reset link.
                        </p>
                        <form onSubmit={handleForgotPassword}>
                            <fieldset className="fieldset">
                                <label className="label">Email</label>
                                <input
                                    type="email"
                                    className="input w-full"
                                    placeholder="you@example.com"
                                    value={resetEmail}
                                    onChange={(e) => setResetEmail(e.target.value)}
                                    required
                                />
                                <div className="flex gap-3 mt-5">
                                    <button
                                        type="button"
                                        onClick={() => { setShowForgotModal(false); setResetEmail(""); }}
                                        className="btn btn-ghost flex-1"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-neutral flex-1"
                                        disabled={resetLoading}
                                    >
                                        {resetLoading ? "Sending..." : "Send Reset Link"}
                                    </button>
                                </div>
                            </fieldset>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}

export default Login