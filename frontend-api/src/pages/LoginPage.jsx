import { React, useState } from 'react'
import { FaUser } from 'react-icons/fa';
import { useAuth } from '../components/authContext';

const LoginPage = () => {
    const {login} = useAuth();
    
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async () => {
        try {
            await login(username, password);
            alert('Successful login!')
            setUsername("");
            setPassword("");
          } catch (error) {
            alert('Login failed: ', error)
            console.error("Login failed:", error);
          }
    };

    return (
        <div className="flex items-center justify-center h-screen border">
            <div className="w-96 p-6 shadow-lg bg-white rounded-md">
                <h1 className="text-3xl flex justify-center text-center font-semibold gap-2 mb-4">
                    <FaUser />
                    Login
                </h1>
                <div className="mt-3">
                    <label htmlFor="username" className="block text-base mb-2 font-semibold">
                        {" "}
                        Username
                    </label>
                    <input
                        type="text"
                        name="username"
                        placeholder="Enter Username..."
                        onChange={(e) => setUsername(e.target.value)}
                        value={username}
                        id="username"
                        className="border focus:border-2 w-full text-base px-2 focus:outline-none focus:ring-0 focus:border-blue-600 rounded-md"
                        required
                    />
                </div>
                <div className="mt-3">
                    <label htmlFor="password" className="block text-base mb-2 font-semibold">
                        {" "}
                        Password
                    </label>
                    <input
                        type="password"
                        name="password"
                        placeholder="Enter password..."
                        onChange={(e) => setPassword(e.target.value)}
                        value={password}
                        id="password"
                        className="border w-full text-base px-2 focus:outline-none focus:ring-0 focus:border-blue-600 focus:border-2 rounded-md"
                        required
                    />
                </div>
                <div className="mt-3 flex justify-between items-center">
                    <div>
                        <a
                            href="/"
                            className="text-blue-600 hover:text-blue-300 text-sm"
                        >
                            Forgot Password?
                        </a>
                    </div>
                </div>
                <div className="mt-5">
                    <button
                        onClick={handleLogin}
                        className="border bg-white text-blue-600 font-semibold py-3 px-6 rounded-md shadow-md hover:bg-gray-100 w-full"
                        type="submit"
                    >
                        Submit
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginPage