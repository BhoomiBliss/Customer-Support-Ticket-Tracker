// frontend/src/utils/auth.js

/**
 * Retrieve user session from localStorage safely.
 * @returns {Object|null} User data object including JWT token, or null if not found.
 */
export const getStoredUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error parsing stored user session:', error);
    return null;
  }
};

/**
 * Save user session to localStorage.
 * @param {Object} userData - Session payload returned by authentication API.
 */
export const setStoredUser = (userData) => {
  try {
    localStorage.setItem('user', JSON.stringify(userData));
  } catch (error) {
    console.error('Error saving user session to localStorage:', error);
  }
};

/**
 * Clear the user session from localStorage.
 */
export const clearStoredUser = () => {
  try {
    localStorage.removeItem('user');
  } catch (error) {
    console.error('Error clearing user session:', error);
  }
};
