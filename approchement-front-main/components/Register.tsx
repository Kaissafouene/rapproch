import React, { useState, useEffect } from 'react';
import { UserPlus } from 'lucide-react';

interface RegisterProps {
  onRegister: (token: string, user: any) => void;
  onSwitchToLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ onRegister, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    full_name: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const x = (clientX / window.innerWidth - 0.5) * 2;
      const y = (clientY / window.innerHeight - 0.5) * 2;
      setMousePosition({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      setIsLoading(false);
      return;
    }

    try {
      // Register user
      const registerResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          full_name: formData.full_name,
          role: 'user'
        })
      });

      if (!registerResponse.ok) {
        const errorData = await registerResponse.json();
        throw new Error(errorData.detail || 'Registration failed');
      }

      // Show success message and redirect to login after 2 seconds
      setSuccess(true);
      setTimeout(() => {
        onSwitchToLogin();
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const cardTransform = {
    transform: `
      perspective(1000px)
      rotateY(${mousePosition.x * 15}deg)
      rotateX(${mousePosition.y * -15}deg)
      translateY(-20px)
      scale3d(1.05, 1.05, 1.05)
    `,
    transition: 'transform 0.1s ease-out'
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">

      {/* TOP ICON */}
      <div 
        className="absolute top-6 left-0 right-0 flex justify-center drop-shadow-2xl z-20"
      >
        <UserPlus className="w-24 h-24 text-white/30 mr-4 md:mr-0" strokeWidth={1.5} />
      </div>

      {/* FLOATING PARTICLES FOR DEPTH */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/10 blur-sm"
            style={{
              width: Math.random() * 8 + 4 + 'px',
              height: Math.random() * 8 + 4 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              animation: `float ${Math.random() * 10 + 10}s infinite ease-in-out`,
              animationDelay: Math.random() * 5 + 's',
              transform: `translate(${mousePosition.x * 10}px, ${mousePosition.y * 10}px)`
            }}
          />
        ))}
      </div>

      {/* MAIN CONTENT */}
      <div className="relative z-10 w-full max-w-md px-6 text-white flex flex-col items-center">
        <h1 className="text-3xl font-bold mt-36 mb-2 text-center">Create Account</h1>
        <p className="text-gray-200 mb-8 text-center text-lg">
          Join us to manage your finances
        </p>

        <form onSubmit={handleSubmit} className="w-full space-y-6">
          <div className="space-y-5">
            <div>
              <input
                name="full_name"
                type="text"
                required
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Full name"
                className="w-full px-4 py-3.5 rounded-xl bg-white/15 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white/60 focus:bg-white/20 backdrop-blur-md transition-all duration-200 border border-white/10"
                disabled={isLoading}
              />
            </div>
            <div>
              <input
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                placeholder="Username"
                className="w-full px-4 py-3.5 rounded-xl bg-white/15 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white/60 focus:bg-white/20 backdrop-blur-md transition-all duration-200 border border-white/10"
                disabled={isLoading}
              />
            </div>
            <div>
              <input
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="Email address"
                className="w-full px-4 py-3.5 rounded-xl bg-white/15 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white/60 focus:bg-white/20 backdrop-blur-md transition-all duration-200 border border-white/10"
                disabled={isLoading}
              />
            </div>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                className="w-full px-4 py-3.5 rounded-xl bg-white/15 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white/60 focus:bg-white/20 backdrop-blur-md transition-all duration-200 border border-white/10 pr-12"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white transition-colors duration-200 focus:outline-none"
                disabled={isLoading}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
            <div className="relative">
              <input
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm password"
                className="w-full px-4 py-3.5 rounded-xl bg-white/15 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white/60 focus:bg-white/20 backdrop-blur-md transition-all duration-200 border border-white/10 pr-12"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white transition-colors duration-200 focus:outline-none"
                disabled={isLoading}
              >
                {showConfirmPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200 text-sm text-center">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 rounded-lg bg-green-500/20 border border-green-500/50 text-green-200 text-sm text-center">
              ✅ Account created successfully! Redirecting to login...
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-[#6e2de5] to-[#3a1cff] flex items-center justify-center text-white font-semibold shadow-lg hover:shadow-xl active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:from-[#7a3aee] hover:to-[#4a29ff] transform hover:translate-y-[-2px]"
          >
            {isLoading ? (
              <div className="w-6 h-6 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
            ) : (
              "Create Account"
            )}
          </button>

          <div className="text-center mt-4">
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-white/80 hover:text-white text-sm transition-colors duration-200 focus:outline-none"
              disabled={isLoading}
            >
              Already have an account? Sign in
            </button>
          </div>
        </form>
      </div>


    </div>
  );
};

export default Register;