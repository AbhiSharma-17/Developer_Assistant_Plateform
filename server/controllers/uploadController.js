import { getPool } from '../config/db.js';
import path from 'path';
import fs from 'fs';

export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded or file type not allowed' });
    }

    const pool = getPool();
    const userId = req.user.id;
    const { originalname, mimetype, size, filename } = req.file;
    const fileUrl = `http://localhost:5000/uploads/${filename}`;

    if (!pool) {
      return res.status(200).json({
        success: true,
        file: {
          id: Date.now(),
          name: filename,
          original_name: originalname,
          mime_type: mimetype,
          size,
          url: fileUrl,
          created_at: new Date()
        },
        message: 'File uploaded successfully (demo fallback)'
      });
    }

    const [resDb] = await pool.query(
      'INSERT INTO files (name, original_name, mime_type, size, url, user_id) VALUES (?, ?, ?, ?, ?, ?)',
      [filename, originalname, mimetype, size, fileUrl, userId]
    );

    const fileId = resDb.insertId;

    // Log Activity
    await pool.query('INSERT INTO activity_logs (user_id, action, description, ip_address) VALUES (?, ?, ?, ?)', [
      userId, 'FILE_UPLOADED', `Uploaded file: ${originalname} (${(size/1024/1024).toFixed(2)} MB)`, req.ip || '127.0.0.1'
    ]);

    res.status(200).json({
      success: true,
      file: {
        id: fileId,
        name: filename,
        original_name: originalname,
        mime_type: mimetype,
        size,
        url: fileUrl,
        created_at: new Date()
      },
      message: 'File uploaded successfully'
    });
  } catch (error) {
    console.error('Upload File Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error uploading file' });
  }
};

export const getFiles = async (req, res) => {
  try {
    const pool = getPool();
    const userId = req.user.id;

    if (!pool) {
      const mockFiles = [
        { id: 1, name: 'gateway-spec.pdf', original_name: 'gateway-spec.pdf', mime_type: 'application/pdf', size: 4404019, url: 'http://localhost:5000/uploads/gateway-spec.pdf', created_at: '2026-05-18T18:15:00Z', uploader_name: 'Alex Mercer' },
        { id: 2, name: 'system-architecture.png', original_name: 'system-architecture.png', mime_type: 'image/png', size: 2150400, url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80', created_at: '2026-05-18T14:20:00Z', uploader_name: 'Alex Mercer' },
        { id: 3, name: 'sprint-planning.docx', original_name: 'sprint-planning.docx', mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', size: 1048576, url: 'http://localhost:5000/uploads/sprint-planning.docx', created_at: '2026-05-17T10:00:00Z', uploader_name: 'Elena Rostova' }
      ];
      return res.status(200).json({ success: true, files: mockFiles });
    }

    const [files] = await pool.query(`
      SELECT f.*, u.name as uploader_name 
      FROM files f 
      INNER JOIN users u ON f.user_id = u.id 
      ORDER BY f.created_at DESC
    `);

    res.status(200).json({ success: true, files });
  } catch (error) {
    console.error('Get Files Error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching files' });
  }
};

export const deleteFile = async (req, res) => {
  try {
    const pool = getPool();
    const fileId = req.params.id;
    const userId = req.user.id;

    if (!pool) {
      return res.status(200).json({ success: true, message: 'File deleted successfully (demo fallback)' });
    }

    const [files] = await pool.query('SELECT name, original_name FROM files WHERE id = ?', [fileId]);
    if (files.length === 0) return res.status(404).json({ success: false, message: 'File not found' });

    const { name, original_name } = files[0];

    // Delete from database
    await pool.query('DELETE FROM files WHERE id = ?', [fileId]);

    // Delete from disk
    const filePath = path.join(process.cwd(), 'uploads', name);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Log Activity
    await pool.query('INSERT INTO activity_logs (user_id, action, description, ip_address) VALUES (?, ?, ?, ?)', [
      userId, 'FILE_DELETED', `Deleted file: ${original_name}`, req.ip || '127.0.0.1'
    ]);

    res.status(200).json({ success: true, message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete File Error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting file' });
  }
};
