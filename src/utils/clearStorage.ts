// Utility to clear corrupted localStorage data
export const clearCorruptedStorage = () => {
  try {
    // List all possible token keys
    const tokenKeys = ['token', 'adminToken', 'userToken', 'authToken'];
    
    // List all possible user info keys
    const userInfoKeys = ['user', 'adminUser', 'userInfo', 'currentUser'];
    
    // Check and clear corrupted tokens
    tokenKeys.forEach(key => {
      const token = localStorage.getItem(key);
      if (token) {
        // Check if token is valid JWT format (basic check)
        const parts = token.split('.');
        if (parts.length !== 3) {
          localStorage.removeItem(key);
          console.log(`Cleared invalid token format from: ${key}`);
        }
      }
    });
    
    // Check and clear corrupted user info
    userInfoKeys.forEach(key => {
      const userInfo = localStorage.getItem(key);
      if (userInfo) {
        try {
          JSON.parse(userInfo);
        } catch {
          localStorage.removeItem(key);
          console.log(`Cleared corrupted user info from: ${key}`);
        }
      }
    });
    
    // Clear Redux persist if you're using it
    const reduxKeys = Object.keys(localStorage).filter(key => 
      key.startsWith('persist:')
    );
    
    reduxKeys.forEach(key => {
      try {
        const value = localStorage.getItem(key);
        if (value) {
          JSON.parse(value);
        }
      } catch {
        localStorage.removeItem(key);
        console.log(`Cleared corrupted Redux state: ${key}`);
      }
    });
    
    console.log('Storage cleanup completed');
  } catch (error) {
    console.error('Error clearing storage:', error);
  }
};