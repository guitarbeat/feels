// Helper to store data in localStorage with proper error handling

/**
 * Save data to localStorage with error handling
 */
export const saveToLocalStorage = <T>(key: string, data: T): void => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(data));
    }
  } catch (error) {
    console.error(`Error saving to localStorage (${key}):`, error);
  }
};

/**
 * Load data from localStorage with error handling
 */
export const loadFromLocalStorage = <T>(key: string, defaultValue: T): T => {
  try {
    if (typeof window !== 'undefined') {
      const storedData = localStorage.getItem(key);
      return storedData ? JSON.parse(storedData) as T : defaultValue;
    }
  } catch (error) {
    console.error(`Error loading from localStorage (${key}):`, error);
  }
  return defaultValue;
};

/**
 * Load theme preference from localStorage
 */
export const loadThemePreference = (): 'light' | 'dark' | 'system' => {
  return loadFromLocalStorage<'light' | 'dark' | 'system'>('ui-theme', 'system');
};

/**
 * Save theme preference to localStorage
 */
export const saveThemePreference = (theme: 'light' | 'dark' | 'system'): void => {
  saveToLocalStorage('ui-theme', theme);
};
