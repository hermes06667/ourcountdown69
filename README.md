# 💕 Omar & Nada - Our Love Countdown & Memories

A beautiful, responsive website that counts the time since Omar and Nada started their relationship, with a comprehensive cloud-based memories system for sharing precious moments.

## ✨ Features

### 🕐 Countdown Timer
- **Real-time countdown** showing years, months, weeks, days, hours, minutes, and seconds
- **Cairo timezone support** for accurate local time
- **Beautiful animations** with floating hearts and particles
- **Theme toggle** between light and dark modes
- **Background music** with toggle control

### 🌸 Memories System
- **Cloud storage** using Supabase for shared access
- **File uploads** supporting images, videos, documents, and archives
- **Folder organization** for better memory management
- **Real-time synchronization** across all devices
- **Search and filtering** by file type and content
- **Responsive design** works on all devices

### ☁️ Cloud Features
- **Shared storage** - anyone can view and upload memories
- **Automatic backups** - data protected in the cloud
- **Multi-device sync** - access from anywhere
- **Unlimited scalability** - grow as needed
- **Professional hosting** - enterprise-grade reliability

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd "our countdown"
```

### 2. Set Up Cloud Storage (Required for Memories)

Follow the complete setup guide in [SUPABASE_SETUP.md](SUPABASE_SETUP.md) to:
- Create a Supabase account
- Set up the database
- Configure file storage
- Get API credentials

### 3. Configure Credentials

1. **Copy your Supabase credentials** from the setup
2. **Update `js/cloud-config.js`** with your actual values:
   ```javascript
   SUPABASE: {
       URL: 'https://your-actual-project.supabase.co',
       ANON_KEY: 'your-actual-anon-key',
       PROJECT_ID: 'your-actual-project-id'
   }
   ```

### 4. Test Locally
```bash
# Open index.html in your browser
# Or use a local server:
python -m http.server 8000
# Then visit: http://localhost:8000
```

### 5. Deploy to Hosting
- **Netlify**: Drag and drop the folder
- **Vercel**: Connect your GitHub repository
- **GitHub Pages**: Push to main branch
- **Any hosting service**: Upload all files

## 📁 Project Structure

```
our countdown/
├── index.html              # Main countdown page
├── memories.html           # Memories management page
├── css/                    # Stylesheets
│   ├── style.css          # Main styles
│   ├── memories.css       # Memories page styles
│   ├── responsive.css     # Mobile responsiveness
│   ├── theme.css          # Dark/light theme
│   └── ...                # Additional style files
├── js/                     # JavaScript files
│   ├── config.js          # Main configuration
│   ├── cloud-config.js    # Cloud storage config
│   ├── app.js             # Main app logic
│   ├── timeCalculator.js  # Countdown calculations
│   ├── cloud-memories.js  # Cloud storage system
│   └── memories.js        # Local memories (legacy)
├── img/                    # Images
│   └── us.jpg            # Couple photo
├── music/                  # Audio files
│   └── flatsound by your side.mp3
├── SUPABASE_SETUP.md      # Complete cloud setup guide
└── README.md              # This file
```

## 🔧 Configuration

### Countdown Settings
Edit `js/config.js` to customize:
- **Start date** of your relationship
- **Timezone** for accurate counting
- **Names** for personalization

### Cloud Storage Settings
Edit `js/cloud-config.js` to configure:
- **Supabase credentials**
- **File size limits**
- **Allowed file types**
- **Storage bucket settings**

### Theme Customization
Modify `css/theme.css` to change:
- **Color schemes**
- **Font families**
- **Animation effects**

## 📱 Usage

### Countdown Page
- **View real-time countdown** of your relationship
- **Toggle theme** between light and dark modes
- **Play background music** for ambiance
- **Navigate to memories** page

### Memories Page
- **Upload files** by dragging and dropping or clicking
- **Create folders** to organize memories
- **Search and filter** through your collection
- **View, download, and delete** memories
- **Move files** between folders

### File Management
- **Supported formats**: Images (JPG, PNG, GIF, WebP), Videos (MP4, MOV, AVI, MKV), Documents (PDF, TXT), Archives (ZIP, RAR)
- **File size limit**: 50MB per file (configurable)
- **Automatic organization** by upload date
- **Cloud backup** for all files

## 🌐 Hosting Requirements

### Static Hosting
- **Netlify** (Recommended)
- **Vercel**
- **GitHub Pages**
- **Any static hosting service**

### Cloud Storage
- **Supabase** (Required for memories)
- **Free tier**: 500MB database + 1GB storage
- **Paid plans**: Unlimited storage available

## 🔒 Security & Privacy

### Public Access
- **Memories are publicly viewable** by anyone with the link
- **No authentication required** for viewing or uploading
- **Suitable for** sharing with family and friends

### Data Protection
- **Files stored securely** in Supabase cloud
- **Automatic backups** prevent data loss
- **No personal data** collected beyond what you upload

### Customization Options
- **Add authentication** for private access
- **Enable row-level security** for user-specific data
- **Implement access controls** as needed

## 🚨 Troubleshooting

### Common Issues

#### "Cloud storage not available"
- Check Supabase credentials in `js/cloud-config.js`
- Verify your Supabase project is active
- Ensure database tables are created

#### "Files won't upload"
- Check storage bucket policies
- Verify file size and type restrictions
- Check browser console for errors

#### "Countdown not working"
- Verify start date format in `js/config.js`
- Check timezone settings
- Ensure JavaScript is enabled

#### "Theme not saving"
- Check localStorage permissions
- Verify theme toggle button exists
- Check for JavaScript errors

### Debug Mode
Open browser console (F12) to see:
- Cloud connection status
- Upload progress
- Error messages
- Sync notifications

## 🎨 Customization

### Colors & Themes
Edit CSS variables in `css/theme.css`:
```css
:root {
    --primary-color: #ff6b6b;
    --secondary-color: #4ecdc4;
    --accent-color: #45b7d1;
}
```

### Animations
Modify particle effects in `js/cloud-memories.js`:
```javascript
// Change particle count
for (let i = 0; i < 100; i++) { // Increase from 50 to 100
    this.createParticle(particlesContainer);
}
```

### File Types
Add new file types in `js/cloud-config.js`:
```javascript
ALLOWED_TYPES: [
    // ... existing types
    'application/msword',        // Add Word documents
    'application/vnd.ms-excel'   // Add Excel files
]
```

## 📈 Performance

### Optimization Features
- **Lazy loading** for images and videos
- **Efficient file handling** with proper validation
- **Minimal API calls** with smart caching
- **Responsive design** for all screen sizes

### Browser Support
- **Modern browsers**: Chrome, Firefox, Safari, Edge
- **Mobile devices**: iOS Safari, Chrome Mobile
- **Minimum requirements**: ES6 support, localStorage

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Code Style
- **JavaScript**: ES6+ with proper error handling
- **CSS**: BEM methodology with CSS variables
- **HTML**: Semantic markup with accessibility

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **Supabase** for cloud infrastructure
- **Font Awesome** for icons
- **Google Fonts** for typography
- **Open source community** for inspiration

## 📞 Support

### Getting Help
1. **Check this README** for common solutions
2. **Review SUPABASE_SETUP.md** for cloud setup
3. **Check browser console** for error messages
4. **Create an issue** for bugs or questions

### Community
- **GitHub Issues**: Report bugs and request features
- **Discussions**: Ask questions and share ideas
- **Wiki**: Additional documentation and guides

---

**💕 Made with love for Nada by Omar**

*Every second with you makes life more beautiful* ✨ 