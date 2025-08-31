# 🚀 Complete Supabase Setup for Shared Memories

## 📋 What is Supabase?

Supabase is an open-source alternative to Firebase that provides:
- **PostgreSQL Database** - Reliable, scalable database
- **File Storage** - Unlimited file uploads with CDN
- **Real-time Updates** - Live synchronization across devices
- **User Authentication** - Secure access control
- **100% Free** - Up to 500MB database + 1GB storage
- **No Vendor Lock-in** - Open source and portable

## 🎯 Why We Need Supabase?

**Current Problem**: Memories are stored in `localStorage` (only visible to you)
**Solution**: Store memories in cloud database (visible to everyone)

## 📝 Complete Setup Guide

### 1. Create Supabase Account

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign in with GitHub or Google
4. Click "New Project"

### 2. Create New Project

1. **Project Name**: `omar-nada-memories` (or your preferred name)
2. **Database Password**: Choose a strong password (save it!)
3. **Region**: Select closest to your location
4. **Pricing Plan**: Free tier
5. Click "Create new project"
6. Wait 2-3 minutes for setup

### 3. Create Database Tables

After project creation, go to **SQL Editor** and run:

```sql
-- Create memories table
CREATE TABLE memories (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    size BIGINT NOT NULL,
    file_url TEXT,
    storage_path TEXT,
    folder_id BIGINT,
    description TEXT,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create folders table
CREATE TABLE folders (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for fast searching
CREATE INDEX idx_memories_name ON memories(name);
CREATE INDEX idx_memories_type ON memories(type);
CREATE INDEX idx_memories_folder_id ON memories(folder_id);
CREATE INDEX idx_memories_created_at ON memories(created_at);
CREATE INDEX idx_memories_updated_at ON memories(updated_at);

CREATE INDEX idx_folders_name ON folders(name);
CREATE INDEX idx_folders_created_at ON folders(created_at);
CREATE INDEX idx_folders_updated_at ON folders(updated_at);

-- Add foreign key constraint
ALTER TABLE memories ADD CONSTRAINT fk_memories_folder 
    FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE CASCADE;
```

### 4. Create Storage Bucket

1. Go to **Storage** in left sidebar
2. Click "Create a new bucket"
3. **Bucket Name**: `memories`
4. **Public bucket**: ✅ Check this (allows public access)
5. Click "Create bucket"

### 5. Set Storage Policies

In **Storage > Policies**, add these policies:

```sql
-- Allow public read access to all files
CREATE POLICY "Public Read Access" ON storage.objects 
FOR SELECT USING (bucket_id = 'memories');

-- Allow public upload to memories bucket
CREATE POLICY "Public Upload Access" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'memories');

-- Allow public delete from memories bucket
CREATE POLICY "Public Delete Access" ON storage.objects 
FOR DELETE USING (bucket_id = 'memories');

-- Allow public update in memories bucket
CREATE POLICY "Public Update Access" ON storage.objects 
FOR UPDATE USING (bucket_id = 'memories');
```

### 6. Get API Credentials

1. Go to **Settings > API**
2. Copy these values:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **anon public key**: `your-long-anon-key`

### 7. Update Configuration

In `js/config.js`, replace:

```javascript
CLOUD_STORAGE: {
    SUPABASE_URL: 'https://your-project-id.supabase.co',  // Your actual URL
    SUPABASE_ANON_KEY: 'your-actual-anon-key',           // Your actual key
    // ... rest stays the same
}
```

### 8. Test the Setup

1. Upload your project to hosting (Netlify, Vercel, etc.)
2. Go to memories page
3. Try uploading a file
4. Check if it appears in Supabase dashboard
5. Open the site from another device/browser
6. Verify the file appears there too

## 🔧 Advanced Features

### Real-time Subscriptions

Add this to enable live updates:

```sql
-- Enable real-time for memories table
ALTER PUBLICATION supabase_realtime ADD TABLE memories;
ALTER PUBLICATION supabase_realtime ADD TABLE folders;
```

### File Type Restrictions

The system already validates file types, but you can customize in `config.js`:

```javascript
ALLOWED_TYPES: [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
    'video/mp4', 'video/mov', 'video/avi', 'video/mkv',
    'application/pdf', 'text/plain',
    'application/zip', 'application/x-rar-compressed'
]
```

### File Size Limits

Adjust maximum file size in `config.js`:

```javascript
MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
```

## 🚨 Troubleshooting

### Problem: "Cloud storage not available"
**Solution**: Check your Supabase URL and key in `config.js`

### Problem: Files won't upload
**Solution**: Verify storage bucket policies are set correctly

### Problem: Database errors
**Solution**: Make sure you ran the SQL commands in the correct order

### Problem: Files not syncing between devices
**Solution**: Check if real-time is enabled and credentials are correct

## 📱 Features After Setup

✅ **Shared Memories**: Everyone sees the same memories
✅ **Cloud Storage**: Files stored safely in the cloud
✅ **Real-time Sync**: Updates appear instantly for everyone
✅ **Automatic Backups**: Data protected automatically
✅ **Multi-device Support**: Works on any device/browser
✅ **Unlimited Storage**: Scale as needed
✅ **Professional Hosting**: Enterprise-grade reliability

## 🔒 Security Notes

- **Public Key**: Safe to share in code (read-only access)
- **Secret Key**: Never share (full database access)
- **Row Level Security**: Can be enabled for user-specific data
- **File Access**: Public bucket means anyone can view files

## 📞 Need Help?

1. Check Supabase documentation: [supabase.com/docs](https://supabase.com/docs)
2. Join Supabase Discord: [discord.gg/supabase](https://discord.gg/supabase)
3. Check browser console for error messages
4. Verify all setup steps were completed

---

**🎉 Congratulations!** Your memories website now has professional cloud storage and real-time synchronization! 