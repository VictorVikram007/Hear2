import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "./login.css";

const slideImages = [
  require("./assets/audiologist.jpg"),
  require("./assets/hearing.jpg"),
  require("./assets/hearing-test.jpg"),
];

const Login = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showSignupModule, setShowSignupModule] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'error' or 'success'

  // Debug: Log Supabase configuration
  useEffect(() => {
    console.log('Supabase URL:', process.env.REACT_APP_SUPABASE_URL);
    console.log('Supabase Key exists:', !!process.env.REACT_APP_SUPABASE_ANON_KEY);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Session check error:', error);
        return;
      }
      if (session) {
        navigate('/');
      }
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth event:', event);
      console.log('Session:', session);
      if (event === 'SIGNED_IN' && session) {
        navigate('/');
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [navigate]);

  const handleOAuthLogin = async (provider) => {
    setLoading(true);
    setMessage('');
    setMessageType('');
    
    try {
      console.log(`Attempting ${provider} OAuth login...`);
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin
        }
      });
      
      if (error) {
        console.error(`${provider} OAuth error:`, error);
        setMessage(`${provider} login error: ${error.message}`);
        setMessageType('error');
      }
    } catch (error) {
      console.error(`${provider} OAuth error:`, error);
      setMessage('An unexpected error occurred. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setMessageType('');

    if (!email || !password) {
      setMessage('Please enter both email and password');
      setMessageType('error');
      setLoading(false);
      return;
    }

    try {
      console.log('Attempting login...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Login error:', error);
        setMessage(`Login error: ${error.message}`);
        setMessageType('error');
      } else if (data?.user) {
        console.log('Login successful:', data.user);
        setMessage('Login successful! Redirecting...');
        setMessageType('success');
        navigate('/');
      }
    } catch (error) {
      console.error('Login error:', error);
      setMessage('An unexpected error occurred. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setMessageType('');

    // Validate inputs
    if (!email || !password) {
      setMessage('Please enter both email and password');
      setMessageType('error');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setMessage('Password must be at least 6 characters long');
      setMessageType('error');
      setLoading(false);
      return;
    }

    try {
      console.log('Starting signup process...');
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            email: email
          }
        }
      });

      console.log('Signup response:', { data, error });

      if (error) {
        console.error('Signup error:', error);
        if (error.message.includes('already registered')) {
          setMessage('This email is already registered. Please try logging in.');
        } else {
          setMessage(`Signup error: ${error.message}`);
        }
        setMessageType('error');
      } else if (data?.user) {
        console.log('User created successfully:', data.user);
        // Clear form and show success message
        setEmail('');
        setPassword('');
        setMessage('Account created successfully! Please login.');
        setMessageType('success');
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          setShowSignupModule(false);
        }, 2000);
      }
    } catch (error) {
      console.error('Unexpected error during signup:', error);
      setMessage('An unexpected error occurred. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="animation-container">
        <img
          src={slideImages[currentSlide]}
          alt="Slideshow"
          className="slide-image"
        />
      </div>

      <div className="form-container">
        {!showSignupModule ? (
          <div className="credentials-container">
            <h2>Welcome Back</h2>
            {message && <div className={`message ${messageType}`}>{message}</div>}
            
            <div className="social-buttons">
              <button
                className="social-login-btn google"
                onClick={() => handleOAuthLogin("google")}
                disabled={loading}
              >
                <img
                  src="https://img.icons8.com/color/48/google-logo.png"
                  alt="Google"
                />
                Continue with Google
              </button>
              <button
                className="social-login-btn microsoft"
                onClick={() => handleOAuthLogin("azure")}
                disabled={loading}
              >
                <img
                  src="https://img.icons8.com/color/48/microsoft.png"
                  alt="Microsoft"
                />
                Continue with Microsoft
              </button>
              <button
                className="social-login-btn phone"
                onClick={() => setShowSignupModule(true)}
                disabled={loading}
              >
                <img
                  src="https://img.icons8.com/ios-filled/50/000000/phone.png"
                  alt="Phone"
                />
                Continue with Phone
              </button>
            </div>

            <div className="divider">
              <span>OR</span>
            </div>

            <form onSubmit={handleEmailLogin}>
              <div className="input-group">
                <input
                  type="email"
                  placeholder="Email or username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="input-group">
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button className="login-button" type="submit" disabled={loading}>
                {loading ? 'Logging in...' : 'Log In'}
              </button>
            </form>

            <p className="toggle-signup" onClick={() => setShowSignupModule(true)}>
              Don&apos;t have an account? <b>Sign up</b>
            </p>

            <p className="forgot-password">Forgot your password?</p>
          </div>
        ) : (
          <div className="spotify-signup-form">
            <div className="spotify-signup-box">
              <h2>Sign up to App</h2>
              {message && <div className={`message ${messageType}`}>{message}</div>}
              
              <form onSubmit={handleSignUp}>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <input
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button className="spotify-button" type="submit" disabled={loading}>
                  {loading ? 'Signing up...' : 'Sign Up'}
                </button>
              </form>

              <button
                className="spotify-button dark"
                onClick={() => handleOAuthLogin("google")}
                disabled={loading}
              >
                <img
                  src="https://img.icons8.com/color/24/google-logo.png"
                  alt="Google"
                />
                Sign up with Google
              </button>
              <button
                className="spotify-button dark"
                onClick={() => handleOAuthLogin("azure")}
                disabled={loading}
              >
                <img
                  src="https://img.icons8.com/color/24/microsoft.png"
                  alt="Microsoft"
                />
                Sign up with Microsoft
              </button>

              <p className="toggle-signup" onClick={() => setShowSignupModule(false)}>
                Already have an account? <b>Log in</b>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
