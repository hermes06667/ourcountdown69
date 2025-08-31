// Configuration object for the countdown and cloud storage
const CONFIG = {
    START_DATE: "2025-02-21T00:00:00+02:00", // Cairo timezone (+02:00)
    TIMEZONE: "Africa/Cairo",
    NAMES: {
        him: "Omar",
        her: "Nada"
    },
    
    // Cloud Storage Configuration
    CLOUD_STORAGE: {
        // Supabase Configuration - Replace with your actual credentials
        SUPABASE_URL: 'https://your-project.supabase.co',
        SUPABASE_ANON_KEY: 'your-anon-key',
        
        // Storage bucket names
        STORAGE_BUCKET: 'memories',
        
        // Database table names
        TABLES: {
            MEMORIES: 'memories',
            FOLDERS: 'folders'
        },
        
        // File upload settings
        MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
        ALLOWED_TYPES: [
            'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
            'video/mp4', 'video/mov', 'video/avi', 'video/mkv',
            'application/pdf', 'text/plain',
            'application/zip', 'application/x-rar-compressed'
        ]
    },
    
    // Local Storage Fallback
    LOCAL_STORAGE: {
        KEYS: {
            MEMORIES: 'memories',
            FOLDERS: 'folders',
            THEME: 'theme',
            SETTINGS: 'settings'
        }
    },
    
    // Real-time synchronization
    SYNC: {
        ENABLED: true,
        INTERVAL: 5000, // 5 seconds
        RETRY_ATTEMPTS: 3,
        RETRY_DELAY: 1000
    }
};
