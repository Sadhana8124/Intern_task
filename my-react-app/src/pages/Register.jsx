import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import api from "../services/api";

// Icons
import { FiUser, FiMail, FiLock, FiUsers, FiEye, FiEyeOff, FiArrowRight, FiShield, FiCheckCircle } from "react-icons/fi";

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    role: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    full_name: "",
    email: "",
    role: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  // ✅ Validation functions
  const validateFullName = (name) => {
    const startsWithNumber = /^[0-9]/;
    const validPattern = /^[A-Za-z\s]+$/;
    if (!name.trim()) return "Full name is required.";
    if (startsWithNumber.test(name)) return "Full name cannot start with a number.";
    if (!validPattern.test(name)) return "Full name can only contain letters and spaces.";
    return "";
  };

  const validateEmail = (email) => {
    const startsWithNumber = /^[0-9]/;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) return "Email is required.";
    if (startsWithNumber.test(email)) return "Email cannot start with a number.";
    if (!emailPattern.test(email)) return "Enter a valid email.";
    return "";
  };

  const validatePassword = (password) => {
    if (!password.trim()) return "Password is required.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    let error = "";
    if (name === "full_name") error = validateFullName(value);
    if (name === "email") error = validateEmail(value);
    if (name === "password") error = validatePassword(value);

    setErrors({ ...errors, [name]: error });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const fullNameError = validateFullName(form.full_name);
    const emailError = validateEmail(form.email);
    const passwordError = validatePassword(form.password);

    if (!form.role) {
      setErrors((prev) => ({ ...prev, role: "Please select a role." }));
    } else {
      setErrors((prev) => ({ ...prev, role: "" }));
    }

    if (fullNameError || emailError || passwordError || !form.role) {
      setErrors({
        full_name: fullNameError,
        email: emailError,
        role: form.role ? "" : "Please select a role.",
        password: passwordError,
      });
      toast.error("Please fix the errors before submitting.");
      return;
    }

    try {
      await api.post("/users/", form, {
        headers: { "Content-Type": "application/json" },
      });
      toast.success("Registered successfully!");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200/30 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-6xl mx-4 flex items-center justify-center lg:justify-between gap-12">
        
        {/* Left Side - Branding & Benefits */}
        <div className="hidden lg:flex flex-col space-y-8 max-w-lg">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                <FiShield className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900">TaskFlow</h1>
            </div>
            <h2 className="text-5xl font-extrabold text-gray-900 leading-tight">
              Start Your
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-cyan-600 to-purple-600 bg-clip-text text-transparent">
                Journey Today
              </span>
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              Join thousands of teams already using TaskFlow to streamline their workflow and boost productivity.
            </p>
          </div>

          {/* Benefits List */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <FiCheckCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-gray-900 font-semibold mb-1">Instant Access</h3>
                <p className="text-gray-600 text-sm">Get started immediately after registration</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <FiCheckCircle className="w-5 h-5 text-cyan-600" />
              </div>
              <div>
                <h3 className="text-gray-900 font-semibold mb-1">Secure Platform</h3>
                <p className="text-gray-600 text-sm">Your data is protected with enterprise-grade security</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <FiCheckCircle className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-gray-900 font-semibold mb-1">Team Collaboration</h3>
                <p className="text-gray-600 text-sm">Work seamlessly with your team members</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Registration Form */}
        <div className="w-full max-w-md">
          <div className="bg-white/90 backdrop-blur-xl border border-gray-200 rounded-3xl shadow-2xl p-8 lg:p-10 animate-fadeIn">
            {/* Form Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl mb-4 shadow-lg">
                <FiUser className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h3>
              <p className="text-gray-600">Join TaskFlow and boost your productivity</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Full Name
                </label>
                <div className="relative group">
                  <FiUser className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors z-10 ${
                    errors.full_name ? "text-red-500" : "text-gray-400 group-hover:text-blue-600"
                  }`} />
                  <input
                    type="text"
                    name="full_name"
                    placeholder="John Doe"
                    value={form.full_name}
                    onChange={handleChange}
                    className={`relative w-full pl-12 pr-4 py-3.5 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-400 border transition-all focus:outline-none hover:border-gray-400 ${
                      errors.full_name 
                        ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20" 
                        : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    }`}
                  />
                </div>
                {errors.full_name && (
                  <p className="text-red-500 text-sm flex items-center gap-1">
                    <span className="text-xs">⚠</span> {errors.full_name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Email Address
                </label>
                <div className="relative group">
                  <FiMail className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors z-10 ${
                    errors.email ? "text-red-500" : "text-gray-400 group-hover:text-blue-600"
                  }`} />
                  <input
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    className={`relative w-full pl-12 pr-4 py-3.5 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-400 border transition-all focus:outline-none hover:border-gray-400 ${
                      errors.email 
                        ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20" 
                        : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm flex items-center gap-1">
                    <span className="text-xs">⚠</span> {errors.email}
                  </p>
                )}
              </div>

              {/* Role */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Role
                </label>
                <div className="relative group">
                  <FiUsers className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors z-10 ${
                    errors.role ? "text-red-500" : "text-gray-400 group-hover:text-blue-600"
                  }`} />
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    className={`relative w-full pl-12 pr-4 py-3.5 rounded-xl bg-gray-50 text-gray-900 border transition-all focus:outline-none appearance-none cursor-pointer hover:border-gray-400 ${
                      errors.role 
                        ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20" 
                        : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    }`}
                  >
                    <option value="" className="bg-white text-gray-400">Select your role</option>
                    <option value="admin" className="bg-white text-gray-900">Admin</option>
                    <option value="intern" className="bg-white text-gray-900">Intern</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                {errors.role && (
                  <p className="text-red-500 text-sm flex items-center gap-1">
                    <span className="text-xs">⚠</span> {errors.role}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Password
                </label>
                <div className="relative group">
                  <FiLock className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors z-10 ${
                    errors.password ? "text-red-500" : "text-gray-400 group-hover:text-blue-600"
                  }`} />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Create a strong password"
                    value={form.password}
                    onChange={handleChange}
                    className={`relative w-full pl-12 pr-12 py-3.5 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-400 border transition-all focus:outline-none hover:border-gray-400 ${
                      errors.password 
                        ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20" 
                        : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors z-10"
                  >
                    {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm flex items-center gap-1">
                    <span className="text-xs">⚠</span> {errors.password}
                  </p>
                )}
                {!errors.password && form.password && (
                  <p className="text-gray-500 text-xs">Must be at least 6 characters</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="group relative w-full py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 overflow-hidden mt-6"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Create Account
                  <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Already have an account?</span>
              </div>
            </div>

            {/* Login Link */}
            <div className="text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors group"
              >
                Sign in instead
                <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Security Badge */}
          <div className="mt-6 flex items-center justify-center gap-2 text-gray-500 text-sm">
            <FiShield className="w-4 h-4" />
            <span>Your information is secure and encrypted</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
