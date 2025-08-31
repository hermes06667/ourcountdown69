// Memories Management System
class MemoriesManager {
    constructor() {
        this.memories = this.loadMemories();
        this.folders = this.loadFolders();
        this.currentFilter = 'all';
        this.searchQuery = '';
        this.currentMemory = null;
        this.currentFolder = null;
        
        this.initializeElements();
        this.bindEvents();
        this.renderFolders();
        this.renderMemories();
        this.updateStats();
        this.initializeTheme();
        this.initializeParticles();
    }

    // Initialize particle system for enhanced visual effects
    initializeParticles() {
        const particlesContainer = document.querySelector('.particles');
        if (!particlesContainer) return;
        
        // Create particles
        for (let i = 0; i < 50; i++) {
            this.createParticle(particlesContainer);
        }
        
        // Continuously create new particles
        setInterval(() => {
            if (particlesContainer.children.length < 100) {
                this.createParticle(particlesContainer);
            }
        }, 2000);
    }

    // Create individual particle
    createParticle(container) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random positioning and animation
        const startX = Math.random() * window.innerWidth;
        const startY = window.innerHeight + 20;
        const endX = startX + (Math.random() - 0.5) * 200;
        const duration = 15 + Math.random() * 10;
        const delay = Math.random() * 5;
        
        particle.style.cssText = `
            left: ${startX}px;
            top: ${startY}px;
            animation: floatParticle ${duration}s linear ${delay}s infinite;
            opacity: 0.3 + Math.random() * 0.4;
        `;
        
        container.appendChild(particle);
        
        // Remove particle after animation
        setTimeout(() => {
            if (particle.parentNode) {
                particle.remove();
            }
        }, (duration + delay) * 1000);
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
        this.foldersList = document.getElementById('foldersList');
        this.confirmMove = document.getElementById('confirmMove');
        this.cancelMove = document.getElementById('cancelMove');
    }

    // Bind event listeners
    bindEvents() {
        // Upload events
        this.uploadBox.addEventListener('click', () => this.fileInput.click());
        this.uploadBtn.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        
        // Drag and drop events
        this.uploadBox.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.uploadBox.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.uploadBox.addEventListener('drop', (e) => this.handleDrop(e));
        
        // Search and filter events
        this.searchInput.addEventListener('input', (e) => this.handleSearch(e));
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleFilter(e));
        });
        
        // Modal events
        this.modalClose.addEventListener('click', () => this.closeModal());
        this.memoryModal.addEventListener('click', (e) => {
            if (e.target === this.memoryModal) this.closeModal();
        });
        
        // Action events
        if (this.downloadBtn) {
            this.downloadBtn.addEventListener('click', () => this.downloadMemory());
        }
        
        if (this.deleteBtn) {
            this.deleteBtn.addEventListener('click', () => this.deleteMemory());
        }
        
        if (this.moveBtn) {
            console.log('Binding move button click event');
            this.moveBtn.addEventListener('click', (e) => {
                console.log('Move button clicked!');
                e.preventDefault();
                this.showMoveModal();
            });
        } else {
            console.error('Move button not found!');
        }
        
        // Folder events
        if (this.createFolderBtn) {
            console.log('Binding create folder button click event');
            this.createFolderBtn.addEventListener('click', (e) => {
                console.log('Create folder button clicked!');
                e.preventDefault();
                this.showFolderModal();
            });
        } else {
            console.error('Create folder button not found!');
        }
        
        if (this.folderModalClose) {
            this.folderModalClose.addEventListener('click', () => this.closeFolderModal());
        }
        
        if (this.confirmCreateFolder) {
            this.confirmCreateFolder.addEventListener('click', () => this.createFolder());
        }
        
        if (this.cancelCreateFolder) {
            this.cancelCreateFolder.addEventListener('click', () => this.closeFolderModal());
        }
        
        // Move modal events
        this.moveModalClose.addEventListener('click', () => this.closeMoveModal());
        this.confirmMove.addEventListener('click', () => this.moveMemory());
        this.cancelMove.addEventListener('click', () => this.closeMoveModal());
        
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
                this.closeFolderModal();
                this.closeMoveModal();
            }
        });
    }

    // Initialize theme from localStorage
    initializeTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            document.body.setAttribute('data-theme', savedTheme);
            const themeToggle = document.querySelector('.theme-toggle');
            if (themeToggle) {
                themeToggle.innerHTML = savedTheme === 'dark' ? '☀️' : '🌙';
            }
        }
        
        // Theme toggle functionality
        const themeToggle = document.querySelector('.theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', this.toggleTheme.bind(this));
        }
    }

    // Toggle theme
    toggleTheme() {
        const currentTheme = document.body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        const themeToggle = document.querySelector('.theme-toggle');
        if (themeToggle) {
            themeToggle.innerHTML = newTheme === 'dark' ? '☀️' : '🌙';
        }
    }

    // Handle file upload
    handleFileUpload(event) {
        const files = Array.from(event.target.files);
        files.forEach(file => this.processFile(file));
        this.fileInput.value = ''; // Reset input
    }

    // Handle drag and drop
    handleDragOver(event) {
        event.preventDefault();
        this.uploadBox.classList.add('dragover');
    }

    handleDragLeave(event) {
        event.preventDefault();
        this.uploadBox.classList.remove('dragover');
    }

    handleDrop(event) {
        event.preventDefault();
        this.uploadBox.classList.remove('dragover');
        
        const files = Array.from(event.dataTransfer.files);
        files.forEach(file => this.processFile(file));
    }

    // Process uploaded file
    processFile(file) {
        // No file size limit - unlimited uploads

        // Check file type
        const allowedTypes = [
            'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
            'video/mp4', 'video/mov', 'video/avi', 'video/mkv',
            'application/pdf', 'text/plain',
            'application/zip', 'application/x-rar-compressed'
        ];

        if (!allowedTypes.includes(file.type)) {
            this.showNotification('File type not supported!', 'error');
            return;
        }

        // Create memory object
        const memory = {
            id: this.generateId(),
            name: file.name,
            type: file.type,
            size: file.size,
            uploadDate: new Date().toISOString(),
            data: null,
            folderId: null // No folder by default
        };

        // Read file data
        const reader = new FileReader();
        reader.onload = (e) => {
            memory.data = e.target.result;
            this.addMemory(memory);
            this.showNotification(`Memory "${file.name}" uploaded successfully! 💕`, 'success');
        };
        reader.readAsDataURL(file);
    }

    // Add new memory
    addMemory(memory) {
        this.memories.unshift(memory); // Add to beginning
        this.saveMemories();
        this.renderMemories();
        this.updateStats();
    }

    // Generate unique ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Save memories to localStorage
    saveMemories() {
        try {
            localStorage.setItem('memories', JSON.stringify(this.memories));
        } catch (error) {
            console.error('Error saving memories:', error);
            this.showNotification('Error saving memory!', 'error');
        }
    }

    // Load memories from localStorage
    loadMemories() {
        try {
            const saved = localStorage.getItem('memories');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Error loading memories:', error);
            return [];
        }
    }

    // Save folders to localStorage
    saveFolders() {
        try {
            localStorage.setItem('folders', JSON.stringify(this.folders));
        } catch (error) {
            console.error('Error saving folders:', error);
            this.showNotification('Error saving folder!', 'error');
        }
    }

    // Load folders from localStorage
    loadFolders() {
        try {
            const saved = localStorage.getItem('folders');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Error loading folders:', error);
            return [];
        }
    }

    // Show folder creation modal
    showFolderModal() {
        console.log('Opening folder modal...'); // Debug log
        if (!this.folderModal) {
            console.error('Folder modal not found!');
            return;
        }
        this.folderModal.classList.add('active');
        if (this.folderName) this.folderName.value = '';
        if (this.folderDescription) this.folderDescription.value = '';
        console.log('Folder modal should now be visible');
    }

    // Close folder creation modal
    closeFolderModal() {
        this.folderModal.classList.remove('active');
        // Don't change body overflow to prevent scroll issues
        // document.body.style.overflow = 'auto';
    }

    // Create new folder
    createFolder() {
        const name = this.folderName.value.trim();
        const description = this.folderDescription.value.trim();
        
        if (!name) {
            this.showNotification('Please enter a folder name!', 'error');
            return;
        }
        
        const folder = {
            id: this.generateId(),
            name: name,
            description: description,
            createdAt: new Date().toISOString(),
            memoryCount: 0
        };
        
        this.folders.push(folder);
        this.saveFolders();
        this.renderFolders();
        this.closeFolderModal();
        this.showNotification(`Folder "${name}" created successfully! 📁`, 'success');
    }

    // Render folders
    renderFolders() {
        if (this.folders.length === 0) {
            this.foldersContainer.innerHTML = `
                <div class="empty-folders">
                    <p>No folders yet. Create your first folder to organize memories!</p>
                </div>
            `;
            return;
        }
        
        this.foldersContainer.innerHTML = this.folders.map(folder => {
            const memoryCount = this.memories.filter(m => m.folderId === folder.id).length;
            return `
                <div class="folder-card" data-id="${folder.id}">
                    <div class="folder-actions">
                        <button class="folder-action-btn" onclick="memoriesManager.deleteFolder('${folder.id}')" title="Delete folder">🗑️</button>
                        <button class="folder-action-btn" onclick="memoriesManager.renameFolder('${folder.id}')" title="Rename folder">✏️</button>
                    </div>
                    <div class="folder-icon">📁</div>
                    <div class="folder-name">${folder.name}</div>
                    <div class="folder-description">${folder.description || 'No description'}</div>
                    <div class="folder-stats">
                        <span>${memoryCount} memories</span>
                        <span>${this.formatDate(folder.createdAt)}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Delete folder
    deleteFolder(folderId) {
        const folder = this.folders.find(f => f.id === folderId);
        if (!folder) return;
        
        const memoryCount = this.memories.filter(m => m.folderId === folderId).length;
        
        if (memoryCount > 0) {
            if (confirm(`Folder "${folder.name}" contains ${memoryCount} memories. Do you want to move them to the root level and delete the folder?`)) {
                // Move memories to root level
                this.memories.forEach(memory => {
                    if (memory.folderId === folderId) {
                        memory.folderId = null;
                    }
                });
                this.saveMemories();
            } else {
                return;
            }
        }
        
        this.folders = this.folders.filter(f => f.id !== folderId);
        this.saveFolders();
        this.renderFolders();
        this.renderMemories();
        this.showNotification(`Folder "${folder.name}" deleted successfully! 📁`, 'success');
    }

    // Rename folder
    renameFolder(folderId) {
        const folder = this.folders.find(f => f.id === folderId);
        if (!folder) return;
        
        const newName = prompt('Enter new folder name:', folder.name);
        if (newName && newName.trim() && newName !== folder.name) {
            folder.name = newName.trim();
            this.saveFolders();
            this.renderFolders();
            this.showNotification(`Folder renamed to "${newName}"! 📁`, 'success');
        }
    }

    // Show move modal
    showMoveModal() {
        console.log('Opening move modal...'); // Debug log
        if (!this.currentMemory) {
            console.error('No current memory selected');
            return;
        }
        
        if (!this.moveModal) {
            console.error('Move modal not found!');
            return;
        }
        
        if (this.moveFileName) this.moveFileName.textContent = this.currentMemory.name;
        this.renderFoldersList();
        this.moveModal.classList.add('active');
        console.log('Move modal should now be visible');
    }

    // Close move modal
    closeMoveModal() {
        this.moveModal.classList.remove('active');
        // Don't change body overflow to prevent scroll issues
        // document.body.style.overflow = 'auto';
    }

    // Render folders list for moving
    renderFoldersList() {
        if (this.folders.length === 0) {
            this.foldersList.innerHTML = '<p>No folders available. Create a folder first!</p>';
            return;
        }
        
        this.foldersList.innerHTML = this.folders.map(folder => `
            <label class="folder-option">
                <input type="radio" name="targetFolder" value="${folder.id}">
                <span class="folder-option-icon">📁</span>
                <div class="folder-option-info">
                    <div class="folder-option-name">${folder.name}</div>
                    <div class="folder-option-description">${folder.description || 'No description'}</div>
                </div>
            </label>
        `).join('');
    }

    // Move memory to folder
    moveMemory() {
        if (!this.currentMemory) return;
        
        const selectedFolder = document.querySelector('input[name="targetFolder"]:checked');
        if (!selectedFolder) {
            this.showNotification('Please select a folder!', 'error');
            return;
        }
        
        const folderId = selectedFolder.value;
        const folder = this.folders.find(f => f.id === folderId);
        
        this.currentMemory.folderId = folderId;
        this.saveMemories();
        this.renderMemories();
        this.renderFolders();
        this.closeMoveModal();
        this.closeModal();
        this.showNotification(`Memory moved to folder "${folder.name}"! 📁`, 'success');
    }

    // Render memories grid with performance optimization
    renderMemories() {
        const filteredMemories = this.getFilteredMemories();
        
        if (filteredMemories.length === 0) {
            this.memoriesGrid.style.display = 'none';
            this.emptyState.style.display = 'block';
        } else {
            this.memoriesGrid.style.display = 'grid';
            this.emptyState.style.display = 'none';
            
            // Performance optimization for large numbers of files
            if (filteredMemories.length > 100) {
                this.renderMemoriesWithVirtualization(filteredMemories);
            } else {
                this.memoriesGrid.innerHTML = filteredMemories.map(memory => 
                    this.createMemoryCard(memory)
                ).join('');
            }
        }
    }

    // Virtual scrolling for large numbers of memories
    renderMemoriesWithVirtualization(memories) {
        const itemsPerPage = 50;
        let currentPage = 0;
        
        const renderPage = (page) => {
            const start = page * itemsPerPage;
            const end = start + itemsPerPage;
            const pageMemories = memories.slice(start, end);
            
            this.memoriesGrid.innerHTML = pageMemories.map(memory => 
                this.createMemoryCard(memory)
            ).join('');
            
            // Add pagination controls
            this.addPaginationControls(memories.length, itemsPerPage, currentPage, renderPage);
        };
        
        renderPage(currentPage);
    }

    // Add pagination controls
    addPaginationControls(total, perPage, current, renderCallback) {
        const totalPages = Math.ceil(total / perPage);
        if (totalPages <= 1) return;
        
        const pagination = document.createElement('div');
        pagination.className = 'pagination-controls';
        pagination.innerHTML = `
            <div class="pagination-info">
                Showing ${(current * perPage) + 1}-${Math.min((current + 1) * perPage, total)} of ${total} memories
            </div>
            <div class="pagination-buttons">
                <button class="pagination-btn" onclick="memoriesManager.changePage(${current - 1}, ${total}, ${perPage}, renderCallback)" ${current === 0 ? 'disabled' : ''}>
                    ← Previous
                </button>
                <span class="pagination-current">Page ${current + 1} of ${totalPages}</span>
                <button class="pagination-btn" onclick="memoriesManager.changePage(${current + 1}, ${total}, ${perPage}, renderCallback)" ${current >= totalPages - 1 ? 'disabled' : ''}>
                    Next →
                </button>
            </div>
        `;
        
        this.memoriesGrid.parentNode.insertBefore(pagination, this.memoriesGrid.nextSibling);
    }

    // Change page in pagination
    changePage(newPage, total, perPage, renderCallback) {
        if (newPage < 0 || newPage >= Math.ceil(total / perPage)) return;
        
        // Remove existing pagination
        const existingPagination = document.querySelector('.pagination-controls');
        if (existingPagination) {
            existingPagination.remove();
        }
        
        renderCallback(newPage);
    }

    // Get filtered memories
    getFilteredMemories() {
        let filtered = this.memories;
        
        // Apply search filter
        if (this.searchQuery) {
            filtered = filtered.filter(memory => 
                memory.name.toLowerCase().includes(this.searchQuery.toLowerCase())
            );
        }
        
        // Apply type filter
        if (this.currentFilter !== 'all') {
            if (this.currentFilter === 'folder') {
                filtered = filtered.filter(memory => memory.folderId !== null);
            } else {
                filtered = filtered.filter(memory => {
                    switch (this.currentFilter) {
                        case 'image': return memory.type.startsWith('image/');
                        case 'video': return memory.type.startsWith('video/');
                        case 'document': return memory.type === 'application/pdf' || memory.type === 'text/plain';
                        case 'archive': return memory.type === 'application/zip' || memory.type === 'application/x-rar-compressed';
                        default: return true;
                    }
                });
            }
        }
        
        return filtered;
    }

    // Create memory card HTML
    createMemoryCard(memory) {
        const fileType = this.getFileType(memory.type);
        const fileIcon = this.getFileIcon(memory.type);
        const size = this.formatFileSize(memory.size);
        const date = this.formatDate(memory.uploadDate);
        const folder = memory.folderId ? this.folders.find(f => f.id === memory.folderId) : null;
        
        return `
            <div class="memory-card" data-id="${memory.id}">
                <div class="memory-preview" onclick="memoriesManager.openMemory('${memory.id}')">
                    ${this.createPreview(memory)}
                    <div class="memory-type-badge">${fileType}</div>
                    ${folder ? `<div class="folder-badge">📁 ${folder.name}</div>` : ''}
                </div>
                <div class="memory-info">
                    <div class="memory-title" title="${memory.name}">${memory.name}</div>
                    <div class="memory-date">${date}</div>
                    <div class="memory-size">${size}</div>
                    ${folder ? `<div class="memory-folder">📁 ${folder.name}</div>` : ''}
                </div>
            </div>
        `;
    }

    // Create preview content
    createPreview(memory) {
        if (memory.type.startsWith('image/')) {
            return `<img src="${memory.data}" alt="${memory.name}" loading="lazy">`;
        } else if (memory.type.startsWith('video/')) {
            return `<video src="${memory.data}" muted></video>`;
        } else {
            return `<div class="file-icon">${this.getFileIcon(memory.type)}</div>`;
        }
    }

    // Get file type string
    getFileType(mimeType) {
        if (mimeType.startsWith('image/')) return 'Image';
        if (mimeType.startsWith('video/')) return 'Video';
        if (mimeType === 'application/pdf') return 'PDF';
        if (mimeType === 'text/plain') return 'Text';
        if (mimeType === 'application/zip') return 'ZIP';
        if (mimeType === 'application/x-rar-compressed') return 'RAR';
        return 'File';
    }

    // Get file icon
    getFileIcon(mimeType) {
        if (mimeType.startsWith('image/')) return '🖼️';
        if (mimeType.startsWith('video/')) return '🎬';
        if (mimeType === 'application/pdf') return '📄';
        if (mimeType === 'text/plain') return '📝';
        if (mimeType === 'application/zip') return '📦';
        if (mimeType === 'application/x-rar-compressed') return '📦';
        return '📄';
    }

    // Format file size
    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    // Format date
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Open memory modal
    openMemory(memoryId) {
        const memory = this.memories.find(m => m.id === memoryId);
        if (!memory) return;

        this.currentMemory = memory;
        
        // Set modal content
        this.modalTitle.textContent = memory.name;
        this.modalDate.textContent = this.formatDate(memory.uploadDate);
        
        const folder = memory.folderId ? this.folders.find(f => f.id === memory.folderId) : null;
        this.modalDescription.textContent = `Uploaded on ${this.formatDate(memory.uploadDate)}${folder ? ` • In folder: ${folder.name}` : ''}`;
        
        // Set media content
        if (memory.type.startsWith('image/')) {
            this.modalMedia.innerHTML = `<img src="${memory.data}" alt="${memory.name}">`;
        } else if (memory.type.startsWith('video/')) {
            this.modalMedia.innerHTML = `<video src="${memory.data}" controls autoplay></video>`;
        } else {
            this.modalMedia.innerHTML = `<div class="file-icon">${this.getFileIcon(memory.type)}</div>`;
        }
        
        // Show modal
        this.memoryModal.classList.add('active');
        // Don't hide body overflow to prevent scroll issues
        // document.body.style.overflow = 'hidden';
    }

    // Close modal
    closeModal() {
        this.memoryModal.classList.remove('active');
        // Don't change body overflow to prevent scroll issues
        // document.body.style.overflow = 'auto';
        this.currentMemory = null;
        
        // Stop video if playing
        const video = this.modalMedia.querySelector('video');
        if (video) video.pause();
    }

    // Download memory
    downloadMemory() {
        if (!this.currentMemory) return;
        
        const link = document.createElement('a');
        link.href = this.currentMemory.data;
        link.download = this.currentMemory.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showNotification('Memory downloaded successfully! 💕', 'success');
    }

    // Delete memory
    deleteMemory() {
        if (!this.currentMemory) return;
        
        if (confirm(`Are you sure you want to delete "${this.currentMemory.name}"? This action cannot be undone.`)) {
            const index = this.memories.findIndex(m => m.id === this.currentMemory.id);
            if (index > -1) {
                this.memories.splice(index, 1);
                this.saveMemories();
                this.renderMemories();
                this.renderFolders();
                this.updateStats();
                this.closeModal();
                this.showNotification('Memory deleted successfully! 💕', 'success');
            }
        }
    }

    // Handle search
    handleSearch(event) {
        this.searchQuery = event.target.value;
        this.renderMemories();
    }

    // Handle filter
    handleFilter(event) {
        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
        
        this.currentFilter = event.target.dataset.filter;
        
        if (this.currentFilter === 'folder') {
            this.showFolderBrowser();
        } else {
            this.hideFolderBrowser();
            this.renderMemories();
        }
    }

    // Show folder browser
    showFolderBrowser() {
        this.memoriesGrid.style.display = 'none';
        this.emptyState.style.display = 'none';
        this.renderFolderBrowser();
    }

    // Hide folder browser
    hideFolderBrowser() {
        const folderBrowser = document.getElementById('folderBrowser');
        if (folderBrowser) {
            folderBrowser.remove();
        }
    }

    // Render folder browser
    renderFolderBrowser() {
        // Remove existing folder browser
        this.hideFolderBrowser();
        
        if (this.folders.length === 0) {
            this.emptyState.style.display = 'block';
            this.emptyState.innerHTML = `
                <div class="empty-icon">📁</div>
                <h3>No folders yet</h3>
                <p>Create your first folder to organize memories!</p>
                <button class="create-folder-prompt-btn" onclick="memoriesManager.showFolderModal()">
                    <span class="btn-icon">➕</span>
                    Create First Folder
                </button>
            `;
            return;
        }

        const folderBrowser = document.createElement('div');
        folderBrowser.id = 'folderBrowser';
        folderBrowser.className = 'folder-browser';
        
        folderBrowser.innerHTML = `
            <div class="folder-browser-header">
                <h3 class="browser-title">📁 Browse Folders</h3>
                <p class="browser-subtitle">Click on a folder to view its contents</p>
            </div>
            <div class="folder-browser-grid">
                ${this.folders.map(folder => {
                    const memoryCount = this.memories.filter(m => m.folderId === folder.id).length;
                    const totalSize = this.memories
                        .filter(m => m.folderId === folder.id)
                        .reduce((sum, m) => sum + m.size, 0);
                    
                    return `
                        <div class="folder-browser-card" onclick="memoriesManager.openFolder('${folder.id}')">
                            <div class="folder-browser-icon">📁</div>
                            <div class="folder-browser-info">
                                <h4 class="folder-browser-name">${folder.name}</h4>
                                <p class="folder-browser-description">${folder.description || 'No description'}</p>
                                <div class="folder-browser-stats">
                                    <span class="stat-item">
                                        <span class="stat-icon">📸</span>
                                        <span class="stat-number">${memoryCount}</span>
                                        <span class="stat-label">memories</span>
                                    </span>
                                    <span class="stat-item">
                                        <span class="stat-icon">💾</span>
                                        <span class="stat-number">${this.formatFileSize(totalSize)}</span>
                                    </span>
                                </div>
                                <div class="folder-browser-date">Created: ${this.formatDate(folder.createdAt)}</div>
                            </div>
                            <div class="folder-browser-arrow">→</div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
        
        this.memoriesGrid.parentNode.insertBefore(folderBrowser, this.memoriesGrid);
    }

    // Open folder and show its contents
    openFolder(folderId) {
        const folder = this.folders.find(f => f.id === folderId);
        if (!folder) return;
        
        this.currentFolder = folder;
        this.renderFolderContents(folderId);
    }

    // Render folder contents
    renderFolderContents(folderId) {
        const folder = this.folders.find(f => f.id === folderId);
        const folderMemories = this.memories.filter(m => m.folderId === folderId);
        
        const folderBrowser = document.getElementById('folderBrowser');
        if (folderBrowser) {
            folderBrowser.innerHTML = `
                <div class="folder-browser-header">
                    <button class="back-to-folders-btn" onclick="memoriesManager.showFolderBrowser()">
                        <span class="btn-icon">←</span>
                        Back to Folders
                    </button>
                    <h3 class="browser-title">📁 ${folder.name}</h3>
                    <p class="browser-subtitle">${folder.description || 'No description'}</p>
                    <div class="folder-summary">
                        <span class="summary-item">${folderMemories.length} memories</span>
                        <span class="summary-item">${this.formatFileSize(folderMemories.reduce((sum, m) => sum + m.size, 0))}</span>
                        <span class="summary-item">Created: ${this.formatDate(folder.createdAt)}</span>
                    </div>
                </div>
                <div class="folder-contents">
                    ${folderMemories.length === 0 ? `
                        <div class="empty-folder">
                            <div class="empty-icon">📁</div>
                            <h3>This folder is empty</h3>
                            <p>Upload some memories to get started!</p>
                        </div>
                    ` : `
                        <div class="folder-memories-grid">
                            ${folderMemories.map(memory => this.createMemoryCard(memory)).join('')}
                        </div>
                    `}
                </div>
            `;
        }
    }

    // Update statistics
    updateStats() {
        this.totalMemories.textContent = this.memories.length;
        
        const totalSizeBytes = this.memories.reduce((sum, memory) => sum + memory.size, 0);
        const totalSizeMB = (totalSizeBytes / (1024 * 1024)).toFixed(1);
        this.totalSize.textContent = totalSizeMB;
    }

    // Show notification
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span class="notification-message">${message}</span>
            <button class="notification-close">×</button>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 1rem;
            box-shadow: 0 5px 20px rgba(0,0,0,0.2);
            z-index: 3000;
            display: flex;
            align-items: center;
            gap: 1rem;
            max-width: 400px;
            animation: slideInRight 0.3s ease-out;
        `;
        
        // Add close button functionality
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.style.cssText = `
            background: none;
            border: none;
            color: white;
            font-size: 1.5rem;
            cursor: pointer;
            padding: 0;
            line-height: 1;
        `;
        closeBtn.addEventListener('click', () => notification.remove());
        
        // Add to page
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease-out';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }
}

// Add notification animations to CSS
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(notificationStyles);

// Initialize memories manager when page loads
let memoriesManager;
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing Memories Manager...'); // Debug log
    memoriesManager = new MemoriesManager();
    console.log('Memories Manager initialized!'); // Debug log
    
    // Test if modals exist
    console.log('Testing modal elements:');
    console.log('Folder Modal:', document.getElementById('folderModal'));
    console.log('Move Modal:', document.getElementById('moveModal'));
    console.log('Create Folder Button:', document.getElementById('createFolderBtn'));
    console.log('Move Button:', document.getElementById('moveBtn'));
    
    // Test click events
    const testCreateBtn = document.getElementById('createFolderBtn');
    if (testCreateBtn) {
        testCreateBtn.addEventListener('click', () => {
            console.log('Create folder button clicked (test)');
        });
    }
}); 