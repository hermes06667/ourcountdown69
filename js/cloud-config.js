// Cloud Storage Configuration
// Replace these values with your actual Supabase credentials

const CLOUD_CONFIG = {
    // Supabase Configuration
    SUPABASE: {
        URL: 'https://your-project-id.supabase.co',        // Replace with your project URL
        ANON_KEY: 'your-anon-public-key',                 // Replace with your anon key
        PROJECT_ID: 'your-project-id'                     // Replace with your project ID
    },
    
    // Storage Configuration
    STORAGE: {
        BUCKET_NAME: 'memories',
        MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
        ALLOWED_TYPES: [
            'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
            'video/mp4', 'video/mov', 'video/avi', 'video/mkv',
            'application/pdf', 'text/plain',
            'application/zip', 'application/x-rar-compressed'
        ]
    },
    
    // Database Configuration
    DATABASE: {
        TABLES: {
            MEMORIES: 'memories',
            FOLDERS: 'folders'
        },
        SCHEMA: 'public'
    },
    
    // Real-time Configuration
    REALTIME: {
        ENABLED: true,
        CHANNELS: {
            MEMORIES: 'memories_changes',
            FOLDERS: 'folders_changes'
        }
    },
    
    // Security Configuration
    SECURITY: {
        ROW_LEVEL_SECURITY: false,
        PUBLIC_ACCESS: true,
        AUTHENTICATION: false
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CLOUD_CONFIG;
} else if (typeof window !== 'undefined') {
    window.CLOUD_CONFIG = CLOUD_CONFIG;
} 