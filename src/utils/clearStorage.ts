// Utility to clear corrupted localStorage data
export const clearCorruptedStorage = () => {
  try {
    const adminToken = localStorage.getItem('adminToken');
    const adminUser = localStorage.getItem('adminUser');
    
    // If either exists but is invalid, clear both
    if (adminToken || adminUser) {
      try {
        if (adminUser) {
          JSON.parse(adminUser);
        }
      } catch {
        // Invalid JSON - clear storage
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        console.log('Cleared corrupted admin storage data');
      }
    }
  } catch (error) {
    console.error('Error clearing storage:', error);
  }
};
