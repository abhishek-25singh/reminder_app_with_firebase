import React from "react";
import { FcGoogle } from "react-icons/fc";
import { useState, useEffect } from "react";
import { auth } from "../firebase/firebase";
import {
    createUserWithEmailAndPassword,
    updateProfile,
    GoogleAuthProvider,
    signInWithPopup,
} from "firebase/auth";
import { useRouter } from "next/router";
import { useAuth } from "@/firebase/auth";
import Link from "next/link";
import Loader from "@/components/Loader";

const Provider = new GoogleAuthProvider();

const RegisterForm = () => {
    const router = useRouter();
    const [username, setUsername] = useState(null);
    const [email, setEmail] = useState(null);
    const [password, setPassword] = useState(null);
    const { authUser, isLoading, setAuthUser } = useAuth();

    const [error, setError] = useState("");

    useEffect(() => {
        if (!isLoading && authUser) {
            router.push("/");
        }
    }, [authUser, isLoading]);

    const singupHandler = async () => {
        if (!email || !password || !username) return;
        try {
            const { user } = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );
            await updateProfile(auth.currentUser, {
                displayName: username,
            });
            setAuthUser({
                uid: user.uid,
                email: user.email,
                username,
            });
        } catch (error) {
            setError(error.message)
        }
    };

    const signInWithGoogle = async () => {
        const user = await signInWithPopup(auth, Provider);
    };

    return isLoading || (!isLoading && !!authUser) ? (
        <Loader />
    ) : (
        <main className="flex lg:h-[100vh] justify-center">
            <div className="w-full lg:w-[60%] p-8 md:p-14 flex items-center justify-center">
                <div className="p-8 w-[600px]">
                    <h1 className="text-6xl font-semibold mt-1">Sign Up</h1>
                    

                    <div className="bg-black/[0.05] w-64 text-center text-white py-4 mt-10 rounded-full transition-transform hover:bg-black/[0.8] active:scale-90 flex justify-center items-center gap-4 cursor-pointer group">
                        <FcGoogle size={22} />
                        <span
                            className="font-medium text-black group-hover:text-white"
                            onClick={signInWithGoogle}
                        >
                            Sign in with Google
                        </span>
                    </div>

                    <form onSubmit={(e) => e.preventDefault()}>
                        <div className="mt-10 pl-1 flex flex-col">
                            <label>Name</label>
                            <input
                                type="text"
                                className="font-medium border-b border-black p-4 outline-0 focus-within:border-blue-400"
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mt-10 pl-1 flex flex-col">
                            <label>Email</label>
                            <input
                                type="email"
                                name="email"
                                className="font-medium border-b border-black p-4 outline-0 focus-within:border-blue-400"
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mt-10 pl-1 flex flex-col">
                            <label>Password</label>
                            <input
                                type="password"
                                name="password"
                                className="font-medium border-b border-black p-4 outline-0 focus-within:border-blue-400"
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        <br />
                        {error && <span style={{color:"red"}}>{error}</span>}
                        </div>
                        <button
                            className="bg-black text-white w-44 py-4 mt-10 rounded-full transition-transform hover:bg-black/[0.8] active:scale-90"
                            onClick={singupHandler}
                        >
                            Sign Up
                        </button>
                        {" "}
                        Already have an account ?{" "}
                        <Link
                            href="/login"
                            className="underline hover:text-blue-400 cursor-pointer"
                        >
                            Sign In
                        </Link>
                    </form>
                </div>
            </div>
        </main>
    );
};

export default RegisterForm;
