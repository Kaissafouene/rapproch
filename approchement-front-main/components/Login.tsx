import React, { useState, useEffect } from "react";

interface LoginProps {
  onLogin: (token: string, user: any) => void;
  onSwitchToRegister?: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onSwitchToRegister }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!username.trim() || !password.trim()) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            username: username.trim(), 
            password 
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Login failed. Please check your credentials.");
      }

      const { access_token } = await response.json();

      const userResponse = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/me`,
        {
          headers: { Authorization: `Bearer ${access_token}` }
        }
      );

      if (userResponse.ok) {
        const user = await userResponse.json();
        onLogin(access_token, user);
      } else {
        throw new Error("Failed to fetch user data");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Calculate 3D transform based on mouse position
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

      {/* TOP CARDS IMAGE WITH 3D ANIMATION */}
      <div 
        className="absolute top-6 left-[40%] w-[380px] h-auto drop-shadow-2xl mix-blend-lighten z-20 opacity-90 hidden md:block"
        style={cardTransform}
      >
        <img
          src="/bg.png"
          alt="Credit cards illustration"
          className="w-full h-full object-contain"
        />
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
      <div className="relative z-30 w-full max-w-md px-6 text-white flex flex-col items-center">
        <h1 className="text-3xl font-bold mt-36 mb-2 text-center">Welcome!</h1>
        <p className="text-gray-200 mb-8 text-center text-lg">
          One experience, all your finances
        </p>

        <form onSubmit={handleSubmit} className="w-full space-y-6">
          <div className="space-y-5">
            <div className="relative z-10">
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username or Email"
                autoComplete="username"
                className="w-full px-4 py-3.5 rounded-xl bg-white/15 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white/60 focus:bg-white/20 backdrop-blur-md transition-all duration-200 border border-white/10 relative z-10"
                disabled={isLoading}
              />
            </div>

            <div className="relative z-10">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                autoComplete="current-password"
                className="w-full px-4 py-3.5 rounded-xl bg-white/15 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white/60 focus:bg-white/20 backdrop-blur-md transition-all duration-200 border border-white/10 pr-12 relative z-10"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white transition-colors duration-200 focus:outline-none z-20"
                disabled={isLoading}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200 text-sm text-center">
              {error}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              className="text-sm text-white/80 hover:text-white transition-colors duration-200 focus:outline-none"
              disabled={isLoading}
            >
              Forgot password?
            </button>
          </div>

          {/* LOGIN BUTTON */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-[#6e2de5] to-[#3a1cff] flex items-center justify-center text-white font-semibold shadow-lg hover:shadow-xl active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:from-[#7a3aee] hover:to-[#4a29ff] transform hover:translate-y-[-2px]"
          >
            {isLoading ? (
              <div className="w-6 h-6 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
            ) : (
              "Login"
            )}
          </button>

          {onSwitchToRegister && (
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="text-white/80 hover:text-white text-sm transition-colors duration-200 focus:outline-none"
                disabled={isLoading}
              >
                No account? Create one
              </button>
            </div>
          )}
        </form>
      </div>


    </div>
  );
};

export default Login;