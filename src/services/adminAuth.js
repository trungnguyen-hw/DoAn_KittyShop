// Service to handle Admin Authentication and Route Protection

export const adminAuthService = {
  isAuthenticated() {
    try {
      const auth = localStorage.getItem("adminAuth") === "true";
      const token = localStorage.getItem("adminToken");
      return auth && !!token;
    } catch (e) {
      console.error("Error reading adminAuth from localStorage", e);
      return false;
    }
  },

  logout() {
    try {
      localStorage.removeItem("adminAuth");
      localStorage.removeItem("adminUser");
      localStorage.removeItem("adminToken");
    } catch (e) {
      console.error("Error removing auth from localStorage", e);
    }
    return true;
  },

  getLoggedUser() {
    try {
      const userStr = localStorage.getItem("adminUser");
      if (userStr) {
        // Support parsing stored JSON object or plain string
        try {
          const userObj = JSON.parse(userStr);
          return userObj.username || userObj;
        } catch {
          return userStr;
        }
      }
      return "trungngo1903";
    } catch {
      return "trungngo1903";
    }
  }
};
