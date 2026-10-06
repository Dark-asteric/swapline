import { use, useState } from "react";
import { AuthContext } from "../../provider/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";
const validatePassword = (password) => {
    const errors = [];

    if (password.length < 6) {
        errors.push("At least 6 characters long");
    }
    if (!/[A-Z]/.test(password)) {
        errors.push("At least one uppercase letter (A–Z)");
    }
    if (!/[a-z]/.test(password)) {
        errors.push("At least one lowercase letter (a–z)");
    }
    return errors;
};

const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "Email is required.";
    if (!emailRegex.test(email)) return "Please enter a valid email address.";
    return "";
};

// const validatePhotoURL = (url) => {
//   if (!url) return "Photo URL is required.";          // must not be empty
//   try {
//     const parsed = new URL(url);
//     if (!["http:", "https:"].includes(parsed.protocol))
//       return "Photo URL must start with http:// or https://"; // must be valid protocol
//   } catch {
//     return "Please enter a valid URL.";               // must be parseable as URL
//   }
//   if (!/\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(url))
//     return "URL must point to an image (.jpg, .png, .gif, .webp, .svg)."; // must be image
//   return "";
// };

const Register = () => {
    const { createUser, setUser, updateUser, googleSignIn } = use(AuthContext);
    const [nameError, setNameError] = useState("");
    const [emailError, setEmailError] = useState("");
    // const [photoError, setPhotoError] = useState("");
    const [passwordError, setPasswordError] = useState([]);
    const navigate = useNavigate();
    const [isShow, setIsShow] = useState(false);

    const handleRegister = (e) => {
        e.preventDefault();
        // console.log(e.target);
        const form = e.target;
        const name = form.name.value;
        if (name.length < 5) {
            setNameError("Name should be more than 5 characters.")
            return;
        }
        else {
            setNameError("");
        }

        const email = form.email.value;
        const emailErr = validateEmail(email);
        if (emailErr) {
            setEmailError(emailErr);
            return;
        }
        else {
            setEmailError("");
        }

        const photoURL = form.photo.value;
        // const photoErr = validatePhotoURL(photoURL);
        // if (photoErr) {
        //   setPhotoError(photoErr);
        //   return;
        // } else {
        //   setPhotoError("");
        // }

        const password = form.password.value;
        const errors = validatePassword(password);
        if (errors.length > 0) {
            setPasswordError(errors);
            return;
        }
        else {
            setPasswordError([]);
        }

        createUser(email, password)
            .then(result => {
                const user = result.user;
                updateUser({ displayName: name, photoURL: photoURL }).then(() => {
                    setUser({ ...user, displayName: name, photoURL: photoURL });
                })
                    .catch(error => {
                        setUser(user);
                        toast.error(error.message);
                    })

                navigate('/');
                console.log(user)
            })
            .catch(error => {
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

    return (
        <>
            <Toaster position="top-center" />
            <div className="mt-20 px-10 flex justify-center min-h-screen items-center mx-auto">
                <div className="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl py-10">
                    <p className="text-center pt-5 font-semibold text-2xl">Create an account</p>
                    <div className="card-body">
                        <form onSubmit={handleRegister}>
                            <fieldset className="fieldset">
                                <label className="label">Name</label>
                                <input type="text" name='name' className="input" placeholder="Name" />
                                {nameError && <p className="text-red-500 text-sm">{nameError}</p>}
                                <label className="label">Email</label>
                                <input type="email" name='email' className="input" placeholder="Email" />
                                {emailError && <p className="text-red-500 text-sm">{emailError}</p>}
                                <label className="label">Photo URL</label>
                                <input type="text" name='photo' className="input" placeholder="Photo URL" />
                                {/* {photoError && <p className="text-red-500 text-sm">{photoError}</p>} */}
                                <label className="label">Password</label>
                                <div className="relative">
                                    <input type={isShow ? "text" : "password"} name="password" className="input" placeholder="Password" required />
                                    {passwordError.length > 0 && (
                                        <ul className="mt-1 space-y-1">
                                            {passwordError.map((err, index) => (
                                                <li key={index} className="text-red-500 text-sm flex items-center gap-1">
                                                    <span>✗</span> {err}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                    <button type="button" onClick={() => setIsShow(!isShow)} className="absolute top-1/2 -translate-y-1/2 right-10">
                                        {isShow
                                            ? <EyeOff size={20} color="#aaaaaa" strokeWidth={1.75} />
                                            : <Eye size={20} color="#aaaaaa" strokeWidth={1.75} />
                                        }
                                    </button>
                                </div>
                                <button type="submit" className="btn btn-neutral mt-4">Register</button>
                            </fieldset>
                        </form>
                        <button onClick={handleGoogleSignIn} className="btn bg-black text-gray-300 rounded-md mt-2 border-[#e5e5e5]">
                            <svg aria-label="Google logo" width="16" height="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><g><path d="m0 0H512V512H0" fill="#fff"></path><path fill="#34a853" d="M153 292c30 82 118 95 171 60h62v48A192 192 0 0190 341"></path><path fill="#4285f4" d="m386 400a140 175 0 0053-179H260v74h102q-7 37-38 57"></path><path fill="#fbbc02" d="m90 341a208 200 0 010-171l63 49q-12 37 0 73"></path><path fill="#ea4335" d="m153 219c22-69 116-109 179-50l55-54c-78-75-230-72-297 55"></path></g></svg>
                            Login with Google
                        </button>
                        <p className="text-xl font-semibold text-center pt-5">Already have an accout ? <Link to="/auth/login" className="text-red-600 ">Login</Link></p>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Register