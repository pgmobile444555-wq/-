import dotenv from 'dotenv';
import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { apiRouter } from './src/server/apiRouter';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Generous payload limit to accommodate mobile high-res flood photos
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Mount API endpoints
app.use('/api', apiRouter);

// Global Error Handler for API routes (PayloadTooLarge, syntax error, etc.)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err) {
    console.error('Server error intercepted:', err.message || err);
    if (err.type === 'entity.too.large') {
      res.status(413).json({
        success: false,
        message: 'ขนาดรูปภาพหรือข้อมูลที่ส่งมีขนาดใหญ่เกินไป กรุณาลองใหม่อีกครั้ง'
      });
      return;
    }
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการประมวลผลข้อมูลของเซิร์ฟเวอร์'
    });
    return;
  }
  next();
});

// Serve static frontend in production
const distPath = path.resolve(__dirname, 'dist');
app.use(express.static(distPath));

app.get('*', (req: Request, res: Response, next: NextFunction) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Sa Kaeo Incident Command server running on port ${PORT}`);
});
