import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

console.log('ENV PATH:', path.resolve(__dirname, '../../.env'));
console.log('Current directory:', process.cwd());
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? '設定済み' : '未設定');