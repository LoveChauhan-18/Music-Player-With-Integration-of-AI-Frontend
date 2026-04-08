// src/services/authService.js

const API_BASE_URL = "http://127.0.0.1:8000/api";

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
      const data = await response.json();
      throw new Error(data.detail || "Login failed. Check your credentials.");
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

    if (!response.ok) {
      const data = await response.json();
      throw new Error(JSON.stringify(data) || "Registration failed.");
    }

    return await response.json();
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
