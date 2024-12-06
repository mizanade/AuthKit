"use client";

import { useUserContext } from "@/context/userContext";
import React, { use } from 'react'

function LoginForm() {
    const { loginUser, userState, handlerUserInput } = useUserContext();
    const {identifier, password} = userState;
    const [showPassword, setShowPassword] = React.useState(false);

    const togglePassword = () => setShowPassword(!showPassword);
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4">
      <form className="relative mx-auto px-4 sm:px-10 py-8 sm:py-14 rounded-lg bg-white w-full max-w-[520px]">
          <div className="relative z-10">
              <h1 className="mb-2 text-center text-[1.35rem] font-medium">
                  Login to Your Accounts
              </h1>
              <p className="mb-8 px-[2rem] text-center text-[#999] text-[14px]">
                  Create an account. Already have an account?{" "}
                  <a href="/register" className="font-bold text-[#2ECC71] hover:text-[#7263F3] transition-all duration-300">Register Here</a>
              </p>
        
              <div className="mt-4 flex flex-col">
                  <label htmlFor="identifier" className="mb-1 text-[#999]">Username atau Email</label>
                  <input type="text" id="identifier" name="identifier" value={identifier} onChange={(e) => handlerUserInput("identifier")(e)} className="px-4 py-3 border-[2px] rounded-md outline-[#2ECC71]text-gray-800 transition-all duration-300" placeholder="zanova" />
              </div>
              <div className="mt-4 flex flex-col">
                  <label htmlFor="password" className="mb-1 text-[#999]">Password</label>
                  <input type={showPassword ? "text" : "password"} id="password" name="password" value={password} onChange={(e) => handlerUserInput("password")(e)} className="px-4 py-3 border-[2px] rounded-md outline-[#2ECC71]text-gray-800 transition-all duration-300" placeholder="********" />
                  <button type="button" className="absolute p-1 right-4 top-[84%] text-[22px] text-[#999] opacity-45">
                      {
                          showPassword ? (<i className="fas fa-eye" onClick={togglePassword}></i>) : (<i className="fas fa-eye-slash" onClick={togglePassword}></i>)  
                      }
                  </button>
              </div>
          </div>
          <div className="mt-4 flex justify-end">
          <a
            href="/forgot-password"
            className="font-bold text-[#2ECC71] text-[14px] hover:text-[#7263F3] transition-all duration-300"
          >
            Forgot password?
          </a>
        </div>
          <div className="flex">
              <button type="submit" disabled={!identifier || !password} onClick={loginUser} className="mt-6 flex-1 w-full py-3 bg-[#2ECC71] font-bold text-white rounded-md hover:bg-[#7263F3] transition-all duration-300">
                  Login Now
              </button>
                </div>
                <img src="/flurry.png" alt="" />
        </form>
        </div>
  )
}

export default LoginForm