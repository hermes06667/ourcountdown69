// Cloud Memories System with Real-time Synchronization
class CloudMemoriesManager {
    constructor() {
        this.memories = [];
        this.folders = [];
        this.currentFilter = 'all';
        this.searchQuery = '';
        this.currentMemory = null;
        this.currentFolder = null;
        this.supabase = null;
        this.useCloudStorage = false;
        this.syncInterval = null;
        this.lastSyncTime = null;
        this.pendingChanges = [];
        
        this.initializeSupabase();
        this.initializeElements();
        this.bindEvents();
        this.loadMemories();
        this.loadFolders();
        this.renderFolders();
        this.renderMemories();
        this.updateStats();
        this.initializeTheme();
        this.initializeParticles();
        this.startRealTimeSync();
        this.updateSystemStatus('ready', 'System ready! 🎉');
    }

    // Initialize Supabase client with proper error handling
    async initializeSupabase() {
        try {
            // Load Supabase from CDN with fallback
            if (typeof supabase === 'undefined') {
                await this.loadSupabaseLibrary();
            }
            
            if (typeof supabase !== 'undefined') {
                this.setupSupabase();
            } else {
                throw new Error('Failed to load Supabase library');
            }
        } catch (error) {
            console.log('Supabase not available, using local storage:', error);
            this.useCloudStorage = false;
            this.showNotification('Cloud storage not available, using local storage', 'info');
        }
    }

    // Load Supabase library with multiple CDN fallbacks
    async loadSupabaseLibrary() {
        const cdnUrls = [
            'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
            'https://unpkg.com/@supabase/supabase-js@2',
            'https://cdnjs.cloudflare.com/ajax/libs/supabase/2.0.0/supabase.min.js'
        ];

        for (const url of cdnUrls) {
            try {
                await this.loadScript(url);
                if (typeof supabase !== 'undefined') {
                    console.log('Supabase loaded from:', url);
                    return;
                }
            } catch (error) {
                console.log('Failed to load from:', url, error);
            }
        }
        
        throw new Error('All CDN sources failed');
    }

    // Load script dynamically
    loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // Setup Supabase client
    setupSupabase() {
        try {
            const { SUPABASE_URL, SUPABASE_ANON_KEY } = CONFIG.CLOUD_STORAGE;
            
            if (SUPABASE_URL && SUPABASE_ANON_KEY && 
                SUPABASE_URL !== 'https://your-project.supabase.co' && 
                SUPABASE_ANON_KEY !== 'your-anon-key') {
                
                this.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
                this.useCloudStorage = true;
                console.log('Supabase initialized successfully');
                this.updateSystemStatus('cloud', 'Connecting to cloud storage...');
                
                // Test connection
                this.testCloudConnection();
            } else {
                console.log('Supabase credentials not configured, using local storage');
                this.useCloudStorage = false;
                this.updateSystemStatus('error', 'Cloud storage not configured - using local storage');
                this.showNotification('Please configure Supabase credentials for cloud storage', 'info');
            }
        } catch (error) {
            console.log('Error setting up Supabase, using local storage:', error);
            this.useCloudStorage = false;
            this.updateSystemStatus('error', 'Cloud setup failed - using local storage');
        }
    }

    // Test cloud connection
    async testCloudConnection() {
        try {
            const { data, error } = await this.supabase
                .from(CONFIG.CLOUD_STORAGE.TABLES.MEMORIES)
                .select('count')
                .limit(1);
            
            if (error) {
                throw error;
            }
            
            console.log('Cloud connection successful');
            this.updateSystemStatus('cloud', 'Cloud storage connected! ☁️');
            this.loadMemoriesFromCloud();
            this.loadFoldersFromCloud();
        } catch (error) {
            console.error('Cloud connection failed:', error);
            this.useCloudStorage = false;
            this.updateSystemStatus('error', 'Cloud storage unavailable - using local storage');
            this.showNotification('Cloud connection failed, using local storage', 'warning');
        }
    }

    // Start real-time synchronization
    startRealTimeSync() {
        if (!CONFIG.SYNC.ENABLED) return;
        
        this.syncInterval = setInterval(() => {
            this.syncData();
        }, CONFIG.SYNC.INTERVAL);
    }

    // Stop real-time synchronization
    stopRealTimeSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
    }

    // Synchronize data between cloud and local storage
    async syncData() {
        if (!this.useCloudStorage || !this.supabase) return;
        
        try {
            // Sync memories
            await this.syncMemories();
            
            // Sync folders
            await this.syncFolders();
            
            this.lastSyncTime = new Date();
        } catch (error) {
            console.error('Sync error:', error);
        }
    }

    // Synchronize memories
    async syncMemories() {
        try {
            const { data, error } = await this.supabase
                .from(CONFIG.CLOUD_STORAGE.TABLES.MEMORIES)
                .select('*')
                .order('updated_at', { ascending: false });
            
            if (error) throw error;
            
            // Check for new or updated memories
            const cloudMemories = data || [];
            const localMemories = this.memories;
            
            // Find new memories from cloud
            const newMemories = cloudMemories.filter(cloudMem => 
                !localMemories.find(localMem => localMem.id === cloudMem.id)
            );
            
            // Find updated memories from cloud
            const updatedMemories = cloudMemories.filter(cloudMem => {
                const localMem = localMemories.find(localMem => localMem.id === cloudMem.id);
                return localMem && new Date(cloudMem.updated_at) > new Date(localMem.updated_at);
            });
            
            // Add new memories
            if (newMemories.length > 0) {
                this.memories.unshift(...newMemories);
                this.showNotification(`${newMemories.length} new memories synced`, 'success');
            }
            
            // Update existing memories
            if (updatedMemories.length > 0) {
                updatedMemories.forEach(cloudMem => {
                    const index = this.memories.findIndex(localMem => localMem.id === cloudMem.id);
                    if (index !== -1) {
                        this.memories[index] = cloudMem;
                    }
                });
                this.showNotification(`${updatedMemories.length} memories updated`, 'info');
            }
            
            // Update UI
            this.renderMemories();
            this.updateStats();
            
        } catch (error) {
            console.error('Error syncing memories:', error);
        }
    }

    // Synchronize folders
    async syncFolders() {
        try {
            const { data, error } = await this.supabase
                .from(CONFIG.CLOUD_STORAGE.TABLES.FOLDERS)
                .select('*')
                .order('updated_at', { ascending: false });
            
            if (error) throw error;
            
            const cloudFolders = data || [];
            const localFolders = this.folders;
            
            // Find new folders from cloud
            const newFolders = cloudFolders.filter(cloudFolder => 
                !localFolders.find(localFolder => localFolder.id === cloudFolder.id)
            );
            
            // Find updated folders from cloud
            const updatedFolders = cloudFolders.filter(cloudFolder => {
                const localFolder = localFolders.find(localFolder => localFolder.id === cloudFolder.id);
                return localFolder && new Date(cloudFolder.updated_at) > new Date(localFolder.updated_at);
            });
            
            // Add new folders
            if (newFolders.length > 0) {
                this.folders.unshift(...newFolders);
            }
            
            // Update existing folders
            if (updatedFolders.length > 0) {
                updatedFolders.forEach(cloudFolder => {
                    const index = this.folders.findIndex(localFolder => localFolder.id === cloudFolder.id);
                    if (index !== -1) {
                        this.folders[index] = cloudFolder;
                    }
                });
            }
            
            // Update UI
            this.renderFolders();
            
        } catch (error) {
            console.error('Error syncing folders:', error);
        }
    }

    // Load memories (cloud or local)
    async loadMemories() {
        if (this.useCloudStorage) {
            await this.loadMemoriesFromCloud();
        } else {
            this.loadMemoriesFromLocal();
        }
    }

    // Load folders (cloud or local)
    async loadFolders() {
        if (this.useCloudStorage) {
            await this.loadFoldersFromCloud();
        } else {
            this.loadFoldersFromLocal();
        }
    }

    // Load memories from cloud database
    async loadMemoriesFromCloud() {
        try {
            if (!this.supabase) return;
            
            const { data, error } = await this.supabase
                .from(CONFIG.CLOUD_STORAGE.TABLES.MEMORIES)
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) {
                throw error;
            }
            
            this.memories = data || [];
            this.renderMemories();
            this.updateStats();
        } catch (error) {
            console.error('Error loading memories from cloud:', error);
            this.useCloudStorage = false;
            this.loadMemoriesFromLocal();
        }
    }

    // Load folders from cloud database
    async loadFoldersFromCloud() {
        try {
            if (!this.supabase) return;
            
            const { data, error } = await this.supabase
                .from(CONFIG.CLOUD_STORAGE.TABLES.FOLDERS)
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) {
                throw error;
            }
            
            this.folders = data || [];
            this.renderFolders();
        } catch (error) {
            console.error('Error loading folders from cloud:', error);
            this.useCloudStorage = false;
            this.loadFoldersFromLocal();
        }
    }

    // Load memories from local storage
    loadMemoriesFromLocal() {
        try {
            const saved = localStorage.getItem(CONFIG.LOCAL_STORAGE.KEYS.MEMORIES);
            this.memories = saved ? JSON.parse(saved) : [];
            this.renderMemories();
            this.updateStats();
        } catch (error) {
            console.error('Error loading memories from local storage:', error);
            this.memories = [];
        }
    }

    // Load folders from local storage
    loadFoldersFromLocal() {
        try {
            const saved = localStorage.getItem(CONFIG.LOCAL_STORAGE.KEYS.FOLDERS);
            this.folders = saved ? JSON.parse(saved) : [];
            this.renderFolders();
        } catch (error) {
            console.error('Error loading folders from local storage:', error);
            this.folders = [];
        }
    }

    // Save memory (cloud or local)
    async saveMemory(memory) {
        if (this.useCloudStorage) {
            return await this.saveMemoryToCloud(memory);
        } else {
            return this.saveMemoryToLocal(memory);
        }
    }

    // Save folder (cloud or local)
    async saveFolder(folder) {
        if (this.useCloudStorage) {
            return await this.saveFolderToCloud(folder);
        } else {
            return this.saveFolderToLocal(folder);
        }
    }

    // Save memory to cloud
    async saveMemoryToCloud(memory) {
        try {
            if (!this.supabase) return false;
            
            // Add timestamps
            memory.created_at = new Date().toISOString();
            memory.updated_at = new Date().toISOString();
            
            const { data, error } = await this.supabase
                .from(CONFIG.CLOUD_STORAGE.TABLES.MEMORIES)
                .insert([memory])
                .select();
            
            if (error) {
                console.error('Error saving memory to cloud:', error);
                return false;
            }
            
            // Add to local array
            if (data && data[0]) {
                this.memories.unshift(data[0]);
                this.renderMemories();
                this.updateStats();
            }
            
            return true;
        } catch (error) {
            console.error('Error saving memory to cloud:', error);
            return false;
        }
    }

    // Save folder to cloud
    async saveFolderToCloud(folder) {
        try {
            if (!this.supabase) return false;
            
            // Add timestamps
            folder.created_at = new Date().toISOString();
            folder.updated_at = new Date().toISOString();
            
            const { data, error } = await this.supabase
                .from(CONFIG.CLOUD_STORAGE.TABLES.FOLDERS)
                .insert([folder])
                .select();
            
            if (error) {
                console.error('Error saving folder to cloud:', error);
                return false;
            }
            
            // Add to local array
            if (data && data[0]) {
                this.folders.unshift(data[0]);
                this.renderFolders();
            }
            
            return true;
        } catch (error) {
            console.error('Error saving folder to cloud:', error);
            return false;
        }
    }

    // Save memory to local storage
    saveMemoryToLocal(memory) {
        try {
            // Generate unique ID
            memory.id = Date.now() + Math.random();
            memory.created_at = new Date().toISOString();
            memory.updated_at = new Date().toISOString();
            
            this.memories.unshift(memory);
            localStorage.setItem(CONFIG.LOCAL_STORAGE.KEYS.MEMORIES, JSON.stringify(this.memories));
            this.renderMemories();
            this.updateStats();
            return true;
        } catch (error) {
            console.error('Error saving memory to local storage:', error);
            return false;
        }
    }

    // Save folder to local storage
    saveFolderToLocal(folder) {
        try {
            // Generate unique ID
            folder.id = Date.now() + Math.random();
            folder.created_at = new Date().toISOString();
            folder.updated_at = new Date().toISOString();
            
            this.folders.unshift(folder);
            localStorage.setItem(CONFIG.LOCAL_STORAGE.KEYS.FOLDERS, JSON.stringify(this.folders));
            this.renderFolders();
            return true;
        } catch (error) {
            console.error('Error saving folder to local storage:', error);
            return false;
        }
    }

    // Delete memory (cloud or local)
    async deleteMemory(memoryId) {
        if (this.useCloudStorage) {
            return await this.deleteMemoryFromCloud(memoryId);
        } else {
            return this.deleteMemoryFromLocal(memoryId);
        }
    }

    // Delete folder (cloud or local)
    async deleteFolder(folderId) {
        if (this.useCloudStorage) {
            return await this.deleteFolderFromCloud(folderId);
        } else {
            return this.deleteFolderFromLocal(folderId);
        }
    }

    // Delete memory from cloud
    async deleteMemoryFromCloud(memoryId) {
        try {
            if (!this.supabase) return false;
            
            // Get memory to delete file from storage
            const memory = this.memories.find(m => m.id === memoryId);
            if (memory && memory.storage_path) {
                const { error: storageError } = await this.supabase.storage
                    .from(CONFIG.CLOUD_STORAGE.STORAGE_BUCKET)
                    .remove([memory.storage_path]);
                
                if (storageError) {
                    console.error('Error deleting file from storage:', storageError);
                }
            }
            
            // Delete from database
            const { error } = await this.supabase
                .from(CONFIG.CLOUD_STORAGE.TABLES.MEMORIES)
                .delete()
                .eq('id', memoryId);
            
            if (error) {
                console.error('Error deleting memory from cloud:', error);
                return false;
            }
            
            // Remove from local array
            this.memories = this.memories.filter(m => m.id !== memoryId);
            this.renderMemories();
            this.updateStats();
            
            return true;
        } catch (error) {
            console.error('Error deleting memory from cloud:', error);
            return false;
        }
    }

    // Delete folder from cloud
    async deleteFolderFromCloud(folderId) {
        try {
            if (!this.supabase) return false;
            
            // First delete all memories in this folder
            const { error: memoriesError } = await this.supabase
                .from(CONFIG.CLOUD_STORAGE.TABLES.MEMORIES)
                .delete()
                .eq('folder_id', folderId);
            
            if (memoriesError) {
                console.error('Error deleting memories in folder:', memoriesError);
            }
            
            // Then delete the folder
            const { error: folderError } = await this.supabase
                .from(CONFIG.CLOUD_STORAGE.TABLES.FOLDERS)
                .delete()
                .eq('id', folderId);
            
            if (folderError) {
                console.error('Error deleting folder from cloud:', folderError);
                return false;
            }
            
            // Remove from local arrays
            this.memories = this.memories.filter(m => m.folder_id !== folderId);
            this.folders = this.folders.filter(f => f.id !== folderId);
            this.renderMemories();
            this.renderFolders();
            this.updateStats();
            
            return true;
        } catch (error) {
            console.error('Error deleting folder from cloud:', error);
            return false;
        }
    }

    // Delete memory from local storage
    deleteMemoryFromLocal(memoryId) {
        try {
            this.memories = this.memories.filter(m => m.id !== memoryId);
            localStorage.setItem(CONFIG.LOCAL_STORAGE.KEYS.MEMORIES, JSON.stringify(this.memories));
            this.renderMemories();
            this.updateStats();
            return true;
        } catch (error) {
            console.error('Error deleting memory from local storage:', error);
            return false;
        }
    }

    // Delete folder from local storage
    deleteFolderFromLocal(folderId) {
        try {
            // Remove all memories in this folder
            this.memories = this.memories.filter(m => m.folder_id !== folderId);
            this.folders = this.folders.filter(f => f.id !== folderId);
            
            localStorage.setItem(CONFIG.LOCAL_STORAGE.KEYS.MEMORIES, JSON.stringify(this.memories));
            localStorage.setItem(CONFIG.LOCAL_STORAGE.KEYS.FOLDERS, JSON.stringify(this.folders));
            
            this.renderMemories();
            this.renderFolders();
            this.updateStats();
            return true;
        } catch (error) {
            console.error('Error deleting folder from local storage:', error);
            return false;
        }
    }

    // Handle file upload with validation
    async handleFileUpload(files) {
        console.log('Uploading files:', files);
        
        for (const file of files) {
            try {
                // Validate file
                if (!this.validateFile(file)) {
                    continue;
                }
                
                console.log('Processing file:', file.name, file.type, file.size);
                
                // Create memory object
                const memory = {
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    folder_id: this.currentFolder ? this.currentFolder.id : null,
                    description: '',
                    tags: []
                };

                if (this.useCloudStorage && this.supabase) {
                    // Upload to Supabase Storage
                    const success = await this.uploadFileToCloud(file, memory);
                    if (!success) {
                        // Fallback to local storage
                        memory.file = file;
                        await this.saveMemory(memory);
                    }
                } else {
                    // Store file in memory for local storage
                    memory.file = file;
                    await this.saveMemory(memory);
                }
                
            } catch (error) {
                console.error('Error processing file:', error);
                this.showNotification(`Error uploading ${file.name}`, 'error');
            }
        }
    }

    // Validate file before upload
    validateFile(file) {
        const { MAX_FILE_SIZE, ALLOWED_TYPES } = CONFIG.CLOUD_STORAGE;
        
        if (file.size > MAX_FILE_SIZE) {
            this.showNotification(`${file.name} is too large (max ${this.formatFileSize(MAX_FILE_SIZE)})`, 'error');
            return false;
        }
        
        if (!ALLOWED_TYPES.includes(file.type)) {
            this.showNotification(`${file.name} type not supported`, 'error');
            return false;
        }
        
        return true;
    }

    // Upload file to cloud storage
    async uploadFileToCloud(file, memory) {
        try {
            const fileName = `${Date.now()}_${file.name}`;
            const { data: uploadData, error: uploadError } = await this.supabase.storage
                .from(CONFIG.CLOUD_STORAGE.STORAGE_BUCKET)
                .upload(fileName, file);
            
            if (uploadError) {
                console.error('Error uploading file to cloud:', uploadError);
                return false;
            }
            
            // Get public URL
            const { data: urlData } = this.supabase.storage
                .from(CONFIG.CLOUD_STORAGE.STORAGE_BUCKET)
                .getPublicUrl(fileName);
            
            memory.file_url = urlData.publicUrl;
            memory.storage_path = fileName;
            
            // Save memory to database
            const success = await this.saveMemory(memory);
            
            if (success) {
                this.showNotification(`Successfully uploaded ${file.name}!`, 'success');
                return true;
            } else {
                this.showNotification(`Error saving ${file.name}`, 'error');
                return false;
            }
            
        } catch (error) {
            console.error('Error uploading file to cloud:', error);
            return false;
        }
    }

    // Show notification with improved styling
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${this.getNotificationIcon(type)}</span>
                <span class="notification-message">${message}</span>
            </div>
        `;
        
        // Add styles if not already present
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 15px 20px;
                    border-radius: 12px;
                    color: white;
                    font-weight: 500;
                    z-index: 10000;
                    transform: translateX(100%);
                    transition: all 0.3s ease;
                    max-width: 350px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    backdrop-filter: blur(10px);
                }
                .notification.show {
                    transform: translateX(0);
                }
                .notification-content {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .notification-icon {
                    font-size: 18px;
                }
                .notification-success {
                    background: linear-gradient(135deg, #10b981, #059669);
                }
                .notification-error {
                    background: linear-gradient(135deg, #ef4444, #dc2626);
                }
                .notification-info {
                    background: linear-gradient(135deg, #3b82f6, #2563eb);
                }
                .notification-warning {
                    background: linear-gradient(135deg, #f59e0b, #d97706);
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }

    // Get notification icon based on type
    getNotificationIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            info: 'ℹ️',
            warning: '⚠️'
        };
        return icons[type] || icons.info;
    }

    // Initialize DOM elements
    initializeElements() {
        this.uploadBox = document.getElementById('uploadBox');
        this.uploadBtn = document.getElementById('uploadBtn');
        this.fileInput = document.getElementById('fileInput');
        this.searchInput = document.getElementById('searchInput');
        this.memoriesGrid = document.getElementById('memoriesGrid');
        this.emptyState = document.getElementById('emptyState');
        this.memoryModal = document.getElementById('memoryModal');
        this.modalClose = document.getElementById('modalClose');
        this.modalMedia = document.getElementById('modalMedia');
        this.modalTitle = document.getElementById('modalTitle');
        this.modalDate = document.getElementById('modalDate');
        this.modalDescription = document.getElementById('modalDescription');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.deleteBtn = document.getElementById('deleteBtn');
        this.moveBtn = document.getElementById('moveBtn');
        this.totalMemories = document.getElementById('totalMemories');
        this.totalSize = document.getElementById('totalSize');
        
        // Folder elements
        this.createFolderBtn = document.getElementById('createFolderBtn');
        this.foldersContainer = document.getElementById('foldersContainer');
        this.folderModal = document.getElementById('folderModal');
        this.folderModalClose = document.getElementById('folderModalClose');
        this.folderName = document.getElementById('folderName');
        this.folderDescription = document.getElementById('folderDescription');
        this.confirmCreateFolder = document.getElementById('confirmCreateFolder');
        this.cancelCreateFolder = document.getElementById('cancelCreateFolder');
        
        // Move modal elements
        this.moveModal = document.getElementById('moveModal');
        this.moveModalClose = document.getElementById('moveModalClose');
        this.moveFileName = document.getElementById('moveFileName');
        
        // Debug logging for troubleshooting
        console.log('Elements initialized:', {
            uploadBox: !!this.uploadBox,
            uploadBtn: !!this.uploadBtn,
            fileInput: !!this.fileInput,
            memoriesGrid: !!this.memoriesGrid,
            createFolderBtn: !!this.createFolderBtn
        });
    }

    // Bind events
    bindEvents() {
        // Ensure elements are available before binding events
        if (!this.uploadBox || !this.uploadBtn || !this.fileInput) {
            console.warn('Some upload elements not found, retrying in 100ms...');
            setTimeout(() => this.bindEvents(), 100);
            return;
        }
        
        if (this.uploadBox) {
            this.uploadBox.addEventListener('click', () => this.fileInput.click());
            this.uploadBox.addEventListener('dragover', this.handleDragOver.bind(this));
            this.uploadBox.addEventListener('drop', this.handleDrop.bind(this));
        }
        
        if (this.uploadBtn) {
            this.uploadBtn.addEventListener('click', () => {
                console.log('Upload button clicked!');
                if (this.fileInput) {
                    this.fileInput.click();
                } else {
                    console.error('File input not found!');
                }
            });
        }
        
        if (this.fileInput) {
            this.fileInput.addEventListener('change', (e) => {
                console.log('File input change detected:', e.target.files);
                this.handleFileSelect(e);
            });
        }
        
        if (this.searchInput) {
            this.searchInput.addEventListener('input', this.handleSearch.bind(this));
        }
        
        if (this.modalClose) {
            this.modalClose.addEventListener('click', () => this.closeMemoryModal());
        }
        
        if (this.downloadBtn) {
            this.downloadBtn.addEventListener('click', () => this.downloadMemory());
        }
        
        if (this.deleteBtn) {
            this.deleteBtn.addEventListener('click', () => this.deleteCurrentMemory());
        }
        
        if (this.moveBtn) {
            this.moveBtn.addEventListener('click', () => this.showMoveModal());
        }
        
        if (document.getElementById('confirmMove')) {
            document.getElementById('confirmMove').addEventListener('click', () => {
                const folderId = document.getElementById('moveFolderSelect').value;
                this.moveMemory(folderId);
            });
        }
        
        if (this.createFolderBtn) {
            this.createFolderBtn.addEventListener('click', () => {
                this.showCreateFolderModal();
            });
        }
        
        if (this.confirmCreateFolder) {
            this.confirmCreateFolder.addEventListener('click', () => {
                this.createFolder();
            });
        }
        
        if (this.cancelCreateFolder) {
            this.cancelCreateFolder.addEventListener('click', () => {
                this.closeCreateFolderModal();
            });
        }
        
        if (this.folderModalClose) {
            this.folderModalClose.addEventListener('click', () => {
                this.closeCreateFolderModal();
            });
        }
        
        if (this.moveModalClose) {
            this.moveModalClose.addEventListener('click', () => this.closeMoveModal());
        }
        
        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === this.memoryModal) this.closeMemoryModal();
            if (e.target === this.folderModal) this.closeCreateFolderModal();
            if (e.target === this.moveModal) this.closeMoveModal();
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.renderMemories();
            });
        });

        // Memory card clicks using event delegation
        if (this.memoriesGrid) {
            this.memoriesGrid.addEventListener('click', (e) => {
                const memoryCard = e.target.closest('.memory-card');
                if (memoryCard) {
                    const memoryId = memoryCard.dataset.memoryId;
                    if (memoryId) {
                        this.openMemory(parseInt(memoryId));
                    }
                }
            });
        }
    }

    // Handle drag and drop
    handleDragOver(e) {
        e.preventDefault();
        this.uploadBox.classList.add('drag-over');
    }

    handleDrop(e) {
        e.preventDefault();
        this.uploadBox.classList.remove('drag-over');
        const files = Array.from(e.dataTransfer.files);
        this.handleFileUpload(files);
    }

    handleFileSelect(e) {
        const files = Array.from(e.target.files);
        this.handleFileUpload(files);
        e.target.value = ''; // Reset input
    }

    // Render memories grid
    renderMemories() {
        if (!this.memoriesGrid) return;
        
        const filteredMemories = this.getFilteredMemories();
        
        if (filteredMemories.length === 0) {
            this.memoriesGrid.innerHTML = `
                <div class="empty-state" id="emptyState">
                    <div class="empty-icon">💝</div>
                    <h3>No memories yet</h3>
                    <p>Start by uploading your first special moment together!</p>
                    <p class="empty-hint">Every photo, video, or document will become a precious memory</p>
                </div>
            `;
            return;
        }
        
        this.memoriesGrid.innerHTML = filteredMemories.map(memory => this.createMemoryCard(memory)).join('');
    }

    // Create memory card
    createMemoryCard(memory) {
        const folder = this.folders.find(f => f.id === memory.folder_id);
        const folderBadge = folder ? `<span class="folder-badge">📁 ${folder.name}</span>` : '';
        
        return `
            <div class="memory-card" data-id="${memory.id}" data-memory-id="${memory.id}">
                <div class="memory-preview">
                    ${this.getMemoryPreview(memory)}
                </div>
                <div class="memory-info">
                    <h4 class="memory-title">${memory.name}</h4>
                    <p class="memory-date">${new Date(memory.created_at).toLocaleDateString('en-US')}</p>
                    <p class="memory-size">${this.formatFileSize(memory.size)}</p>
                    ${folderBadge}
                </div>
            </div>
        `;
    }

    // Get memory preview
    getMemoryPreview(memory) {
        if (memory.type.startsWith('image/')) {
            if (memory.file_url) {
                return `<img src="${memory.file_url}" alt="${memory.name}" loading="lazy">`;
            } else if (memory.file) {
                return `<img src="${URL.createObjectURL(memory.file)}" alt="${memory.name}" loading="lazy">`;
            }
        } else if (memory.type.startsWith('video/')) {
            if (memory.file_url) {
                return `<video src="${memory.file_url}" muted></video>`;
            } else if (memory.file) {
                return `<video src="${URL.createObjectURL(memory.file)}" muted></video>`;
            }
        } else if (memory.type.includes('pdf')) {
            return `<div class="file-icon">📄</div>`;
        } else if (memory.type.includes('text')) {
            return `<div class="file-icon">📝</div>`;
        } else if (memory.type.includes('zip') || memory.type.includes('rar')) {
            return `<div class="file-icon">📦</div>`;
        } else {
            return `<div class="file-icon">📁</div>`;
        }
    }

    // Format file size
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Get filtered memories
    getFilteredMemories() {
        let filtered = this.memories;
        
        // Filter by type
        if (this.currentFilter !== 'all') {
            filtered = filtered.filter(memory => {
                if (this.currentFilter === 'image') return memory.type.startsWith('image/');
                if (this.currentFilter === 'video') return memory.type.startsWith('video/');
                if (this.currentFilter === 'document') return memory.type.includes('pdf') || memory.type.includes('text');
                if (this.currentFilter === 'archive') return memory.type.includes('zip') || memory.type.includes('rar');
                if (this.currentFilter === 'folder') return memory.type === 'folder';
                return true;
            });
        }
        
        // Filter by search query
        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            filtered = filtered.filter(memory => 
                memory.name.toLowerCase().includes(query) ||
                (memory.description && memory.description.toLowerCase().includes(query))
            );
        }
        
        // Filter by folder
        if (this.currentFolder) {
            filtered = filtered.filter(memory => memory.folder_id === this.currentFolder.id);
        }
        
        return filtered;
    }

    // Open memory modal
    openMemory(memoryId) {
        const memory = this.memories.find(m => m.id === memoryId);
        if (!memory) return;
        
        this.currentMemory = memory;
        this.showMemoryModal();
    }

    // Show memory modal
    showMemoryModal() {
        if (!this.memoryModal || !this.currentMemory) return;
        
        this.modalTitle.textContent = this.currentMemory.name;
        this.modalDate.textContent = new Date(this.currentMemory.created_at).toLocaleDateString('en-US');
        this.modalDescription.value = this.currentMemory.description || '';
        
        // Set modal media
        if (this.currentMemory.type.startsWith('image/')) {
            if (this.currentMemory.file_url) {
                this.modalMedia.innerHTML = `<img src="${this.currentMemory.file_url}" alt="${this.currentMemory.name}">`;
            } else if (this.currentMemory.file) {
                this.modalMedia.innerHTML = `<img src="${URL.createObjectURL(this.currentMemory.file)}" alt="${this.currentMemory.name}">`;
            }
        } else if (this.currentMemory.type.startsWith('video/')) {
            if (this.currentMemory.file_url) {
                this.modalMedia.innerHTML = `<video src="${this.currentMemory.file_url}" controls></video>`;
            } else if (this.currentMemory.file) {
                this.modalMedia.innerHTML = `<video src="${URL.createObjectURL(this.currentMemory.file)}" controls></video>`;
            }
        } else {
            this.modalMedia.innerHTML = `<div class="file-preview">${this.getMemoryPreview(this.currentMemory)}</div>`;
        }
        
        this.memoryModal.classList.add('active');
    }

    // Close memory modal
    closeMemoryModal() {
        if (this.memoryModal) {
            this.memoryModal.classList.remove('active');
        }
        this.currentMemory = null;
    }

    // Download memory
    downloadMemory() {
        if (!this.currentMemory) return;
        
        if (this.currentMemory.file_url) {
            const link = document.createElement('a');
            link.href = this.currentMemory.file_url;
            link.download = this.currentMemory.name;
            link.click();
        } else if (this.currentMemory.file) {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(this.currentMemory.file);
            link.download = this.currentMemory.name;
            link.click();
        }
    }

    // Delete current memory
    async deleteCurrentMemory() {
        if (!this.currentMemory) return;
        
        if (confirm('Are you sure you want to delete this memory?')) {
            const success = await this.deleteMemory(this.currentMemory.id);
            if (success) {
                this.closeMemoryModal();
                this.showNotification('Memory deleted successfully!', 'success');
            } else {
                this.showNotification('Error deleting memory', 'error');
            }
        }
    }

    // Show move modal
    showMoveModal() {
        if (!this.moveModal || !this.currentMemory) return;
        
        this.moveFileName.textContent = this.currentMemory.name;
        this.populateMoveFolderSelect();
        this.moveModal.classList.add('active');
    }

    // Close move modal
    closeMoveModal() {
        if (this.moveModal) {
            this.moveModal.classList.remove('active');
        }
    }

    // Populate move folder select
    populateMoveFolderSelect() {
        const select = document.getElementById('moveFolderSelect');
        if (!select) return;
        
        select.innerHTML = '<option value="">Main Folder</option>';
        this.folders.forEach(folder => {
            const option = document.createElement('option');
            option.value = folder.id;
            option.textContent = folder.name;
            select.appendChild(option);
        });
    }

    // Move memory to folder
    async moveMemory(folderId) {
        if (!this.currentMemory) return;
        
        try {
            this.currentMemory.folder_id = folderId;
            this.currentMemory.updated_at = new Date().toISOString();
            
            if (this.useCloudStorage) {
                await this.supabase
                    .from(CONFIG.CLOUD_STORAGE.TABLES.MEMORIES)
                    .update({ folder_id: folderId, updated_at: this.currentMemory.updated_at })
                    .eq('id', this.currentMemory.id);
            } else {
                localStorage.setItem(CONFIG.LOCAL_STORAGE.KEYS.MEMORIES, JSON.stringify(this.memories));
            }
            
            this.closeMoveModal();
            this.renderMemories();
            this.showNotification('Memory moved successfully!', 'success');
        } catch (error) {
            this.showNotification('Error moving memory', 'error');
        }
    }

    // Show create folder modal
    showCreateFolderModal() {
        if (!this.folderModal) return;
        
        this.folderName.value = '';
        this.folderDescription.value = '';
        this.folderModal.classList.add('active');
    }

    // Close create folder modal
    closeCreateFolderModal() {
        if (!this.folderModal) return;
        
        this.folderModal.classList.remove('active');
    }

    // Create folder
    async createFolder() {
        const name = this.folderName.value.trim();
        const description = this.folderDescription.value.trim();
        
        if (!name) {
            this.showNotification('Please enter a folder name', 'error');
            return;
        }
        
        const folder = {
            name: name,
            description: description
        };
        
        const success = await this.saveFolder(folder);
        
        if (success) {
            this.closeCreateFolderModal();
            this.showNotification('Folder created successfully!', 'success');
        } else {
            this.showNotification('Error creating folder', 'error');
        }
    }

    // Render folders
    renderFolders() {
        if (!this.foldersContainer) return;
        
        this.foldersContainer.innerHTML = `
            <div class="folder-card active" onclick="memoriesManager.selectFolder(null)">
                <div class="folder-icon">🏠</div>
                <div class="folder-info">
                    <h4>Main Folder</h4>
                    <p>All memories</p>
                </div>
            </div>
        `;
        
        this.folders.forEach(folder => {
            const folderCard = document.createElement('div');
            folderCard.className = 'folder-card';
            folderCard.onclick = () => this.selectFolder(folder);
            
            folderCard.innerHTML = `
                <div class="folder-icon">📁</div>
                <div class="folder-info">
                    <h4>${folder.name}</h4>
                    <p>${folder.description || 'No description'}</p>
                </div>
                <button class="delete-folder-btn" onclick="event.stopPropagation(); memoriesManager.deleteFolder(${folder.id})">🗑️</button>
            `;
            
            this.foldersContainer.appendChild(folderCard);
        });
    }

    // Select folder
    selectFolder(folder) {
        this.currentFolder = folder;
        this.renderMemories();
        this.updateActiveFolder();
    }

    // Update active folder
    updateActiveFolder() {
        const folderCards = document.querySelectorAll('.folder-card');
        folderCards.forEach(card => card.classList.remove('active'));
        
        if (this.currentFolder) {
            const activeCard = Array.from(folderCards).find(card => 
                card.querySelector('h4').textContent === this.currentFolder.name
            );
            if (activeCard) activeCard.classList.add('active');
        } else {
            folderCards[0]?.classList.add('active');
        }
    }

    // Delete folder
    async deleteFolder(folderId) {
        if (confirm('Are you sure you want to delete this folder? All memories inside will be deleted.')) {
            const success = await this.deleteFolder(folderId);
            if (success) {
                this.showNotification('Folder deleted successfully!', 'success');
            } else {
                this.showNotification('Error deleting folder', 'error');
            }
        }
    }

    // Handle search
    handleSearch(e) {
        this.searchQuery = e.target.value;
        this.renderMemories();
    }

    // Update stats
    updateStats() {
        if (!this.totalMemories || !this.totalSize) return;
        
        const totalSize = this.memories.reduce((sum, memory) => sum + memory.size, 0);
        
        this.totalMemories.textContent = this.memories.length;
        this.totalSize.textContent = this.formatFileSize(totalSize);
    }

    // Update system status
    updateSystemStatus(status, message) {
        const statusElement = document.getElementById('systemStatus');
        if (!statusElement) return;
        
        // Remove all status classes
        statusElement.classList.remove('ready', 'error', 'cloud');
        
        // Add new status class
        statusElement.classList.add(status);
        
        // Update icon and text
        const iconElement = statusElement.querySelector('.status-icon');
        const textElement = statusElement.querySelector('.status-text');
        
        if (iconElement && textElement) {
            const icons = {
                ready: '✅',
                error: '❌',
                cloud: '☁️'
            };
            
            iconElement.textContent = icons[status] || '⏳';
            textElement.textContent = message;
        }
    }

    // Initialize theme
    initializeTheme() {
        const savedTheme = localStorage.getItem(CONFIG.LOCAL_STORAGE.KEYS.THEME);
        if (savedTheme) {
            document.body.setAttribute('data-theme', savedTheme);
        }
    }

    // Initialize particles
    initializeParticles() {
        const particlesContainer = document.querySelector('.particles');
        if (!particlesContainer) return;
        
        for (let i = 0; i < 50; i++) {
            this.createParticle(particlesContainer);
        }
        
        setInterval(() => {
            if (particlesContainer.children.length < 100) {
                this.createParticle(particlesContainer);
            }
        }, 2000);
    }

    // Create particle
    createParticle(container) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        const startX = Math.random() * window.innerWidth;
        const startY = window.innerHeight + 20;
        const duration = 15 + Math.random() * 10;
        const delay = Math.random() * 5;
        
        particle.style.cssText = `
            left: ${startX}px;
            top: ${startY}px;
            animation: floatParticle ${duration}s linear ${delay}s infinite;
            opacity: 0.3 + Math.random() * 0.4;
        `;
        
        container.appendChild(particle);
        
        setTimeout(() => {
            if (particle.parentNode) {
                particle.remove();
            }
        }, (duration + delay) * 1000);
    }

    // Cleanup on page unload
    cleanup() {
        this.stopRealTimeSync();
    }
}

// Initialize cloud memories manager
let memoriesManager;
document.addEventListener('DOMContentLoaded', () => {
    memoriesManager = new CloudMemoriesManager();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (memoriesManager) {
        memoriesManager.cleanup();
    }
}); 