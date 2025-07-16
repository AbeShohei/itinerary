// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
// 他のどのimportよりも先に、副作用のためだけにこのファイルをインポートする
import './config/env';
// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★

import express from 'express';
import cors from 'cors';
import connectDB from './config/database';
import travelRoutes from './routes/travels';

const app = express();
const PORT = process.env.PORT || 5000;

// データベース接続（エラーハンドリング付き）
const startServer = async () => {
  try {
    await connectDB();
    console.log('MongoDB接続成功');
  } catch (error) {
    console.error('MongoDB接続エラー:', error);
    console.log('MongoDBなしでサーバーを起動します（一部機能が制限されます）');
  }

  // ミドルウェア
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // ルート
  app.use('/api/travels', travelRoutes);

  // ヘルスチェック
  app.get('/health', (req, res) => {
    res.json({ message: 'Travel App API is running' });
  });

  // エラーハンドリング
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  });

  // 404ハンドリング
  app.use('*', (req, res) => {
    res.status(404).json({ message: 'エンドポイントが見つかりません' });
  });

  app.listen(PORT, () => {
    console.log(`サーバーがポート${PORT}で起動しました`);
  });
};

startServer(); 