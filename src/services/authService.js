// src/services/authService.js

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? "https://love-music-backend.onrender.com/api" 
  : "http://localhost:8000/api";

export const authService = {
  /**
   * Log in a user and store tokens
   */
  async login(username, password) {
    const response = await fetch(`${API_BASE_URL}/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      // Try to get JSON error, fallback to status text
      let errorMsg = "Login failed. Check your credentials.";
      try {
        const data = await response.json();
        errorMsg = data.detail || errorMsg;
      } catch (e) {}
      throw new Error(errorMsg);
    }

    const data = await response.json();
    // data usually contains { access: "...", refresh: "..." }
    this.setToken(data.access);
    this.setUser(username);
    return data;
  },

  /**
   * Register a new user
   */
  async register(username, email, password) {
    const response = await fetch(`${API_BASE_URL}/register/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });

    const contentType = response.headers.get("content-type");
    let data;

    // Try to parse JSON if content-type is correct
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    }

    if (!response.ok) {
      // If we have JSON data and it's an object, try to extract specific errors
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        // Check for our custom 'error' key first
        if (data.error) throw new Error(data.error);
        
        // Otherwise check for DRF style errors
        const firstErrorKey = Object.keys(data)[0];
        const errorMessage = Array.isArray(data[firstErrorKey]) ? data[firstErrorKey][0] : data[firstErrorKey];
        throw new Error(`${firstErrorKey}: ${errorMessage}`);
      }
      
      // Fallback message
      throw new Error(`Server error (${response.status}). Please try again later.`);
    }

    return data;
  },

  /**
   * Logout user
   */
  logout() {
    localStorage.removeItem("nb_token");
    localStorage.removeItem("nb_user");
  },

  /**
   * Token and User management
   */
  setToken(token) {
    localStorage.setItem("nb_token", token);
  },

  getToken() {
    return localStorage.getItem("nb_token");
  },

  setUser(username) {
    localStorage.setItem("nb_user", username);
  },

  getUser() {
    return localStorage.getItem("nb_user");
  },

  isAuthenticated() {
    return !!this.getToken();
  }
};
