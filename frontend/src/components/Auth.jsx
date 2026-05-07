import React, { useState, useContext } from "react";

import { useNavigate } from "react-router-dom";

import { AuthContext } from "../context/AuthContext";

import api from "../utils/api";

import toast from "react-hot-toast";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);

  const [formData, setFormData] = useState({
    name: "",

    email: "",

    password: "",
  });

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const { loginAction } = useContext(AuthContext);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,

      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/register";

      const payload = isLogin
        ? {
            email: formData.email,

            password: formData.password,
          }
        : formData;

      const { data } = await api.post(endpoint, payload);

      // LOGIN
      if (isLogin) {
        loginAction(data);

        toast.success("Login successful");

        if (data.user.role === "Admin") {
          navigate("/admin");
        } else if (data.user.role === "Editor") {
          navigate("/editor");
        } else {
          navigate("/user");
        }
      } else {
        // REGISTER
        toast.success("Registration successful");

        setIsLogin(true);

        setFormData({
          name: "",

          email: formData.email,

          password: "",
        });
      }
    } catch (err) {
      console.error(err);

      toast.error(err.response?.data?.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 w-full max-w-md">
        {/* HEADER */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-black text-slate-800">FieldTrack Pro</h1>

          <p className="text-slate-500 mt-2">
            {isLogin
              ? "Secure access to the field operations platform."
              : "Create your account to begin."}
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* NAME */}
          {!isLogin && (
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Full Name
              </label>

              <input
                type="text"
                name="name"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleInputChange}
                required={!isLogin}
                className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* EMAIL */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Email Address
            </label>

            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Password
            </label>

            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className={`

              w-full
              py-3
              rounded-lg
              font-bold
              text-white
              transition-all

              ${
                loading
                  ? "bg-slate-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }

            `}
          >
            {loading ? "Processing..." : isLogin ? "Login" : "Register"}
          </button>
        </form>

        {/* TOGGLE */}
        <div className="text-center mt-6 text-sm text-slate-500">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-600 hover:text-blue-800 font-bold ml-1"
          >
            {isLogin ? "Register" : "Login"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
