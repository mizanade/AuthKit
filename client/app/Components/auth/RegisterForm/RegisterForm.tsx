"use client";

import { useUserContext } from "@/context/userContext";
import React, { use } from 'react'

function RegisterForm() {
    const { registerUser, userState, handlerUserInput } = useUserContext();
    const {name, username, email, password} = userState;
    const [showPassword, setShowPassword] = React.useState(false);

    const togglePassword = () => setShowPassword(!showPassword);
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4">
      <form className="relative mx-auto px-4 sm:px-10 py-8 sm:py-14  rounded-lg bg-white w-full max-w-[520px]">
          <div className="relative z-10">
              <h1 className="mb-2 text-center text-[1.35rem] font-medium">
                  Register for an Accounts
              </h1>
              <p className="mb-8 px-[2rem] text-center text-[#999] text-[14px]">
                  Create an account. Already have an account?{" "}
                  <a href="/login" className="font-bold text-[#2ECC71] hover:text-[#7263F3] transition-all duration-300">Login here</a>
              </p>
              <div className="flex flex-col">
                  <label htmlFor="name" className="mb-1 text-[#999]">Full Name</label>
                  <input type="text" id="name" name="name" value={name} onChange={(e) => handlerUserInput("name")(e)}  className="px-4 py-3 border-[2px] rounded-md outline-[#2ECC71 text-gray-800 transition-all duration-300" placeholder="Your Full Name" />
              </div>
              <div className="mt-4 flex flex-col">
                  <label htmlFor="username" className="mb-1 text-[#999]">Username</label>
                  <input type="text" id="username" name="username" value={username} onChange={(e) => handlerUserInput("username")(e)} className="px-4 py-3 border-[2px] rounded-md outline-[#2ECC71]text-gray-800 transition-all duration-300" placeholder="Your Username" />
              </div>
              <div className="mt-4 flex flex-col">
                  <label htmlFor="email" className="mb-1 text-[#999]">Email</label>
                  <input type="text" id="email" name="email" value={email} onChange={(e) => handlerUserInput("email")(e)} className="px-4 py-3 border-[2px] rounded-md outline-[#2ECC71]text-gray-800 transition-all duration-300" placeholder="youremail@gmail.com" />
              </div>
              <div className="mt-4 flex flex-col">
                  <label htmlFor="password" className="mb-1 text-[#999]">Password</label>
                  <input type={showPassword ? "text" : "password"} id="password" name="password" value={password} onChange={(e) => handlerUserInput("password")(e)} className="px-4 py-3 border-[2px] rounded-md outline-[#2ECC71]text-gray-800 transition-all duration-300" placeholder="********" />
                  <button type="button" className="absolute p-1 right-4 top-[90.5%] text-[22px] text-[#999] opacity-45">
                      {
                          showPassword ? (<i className="fas fa-eye" onClick={togglePassword}></i>) : (<i className="fas fa-eye-slash" onClick={togglePassword}></i>)  
                      }
                  </button>
              </div>
          </div>

          <div className="flex">
              <button type="submit" disabled={!name || !email || !username || !password} onClick={registerUser} className="mt-6 flex-1 w-full py-3 bg-[#2ECC71] font-bold text-white rounded-md hover:bg-[#7263F3] transition-all duration-300">
                  Register Now
              </button>
                </div>
                <img src="/flurry.png" alt="" />
            </form>
            
    </div>
  )
}

export default RegisterForm