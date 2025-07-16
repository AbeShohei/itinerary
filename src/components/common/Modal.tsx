import React from 'react';
import { X } from 'lucide-react';

/**
 * 再利用可能なモーダルコンポーネント
 * 
 * @param isOpen - モーダルの表示状態
 * @param onClose - モーダルを閉じる関数
 * @param title - モーダルのタイトル
 * @param children - モーダル内に表示するコンテンツ
 * @param size - モーダルのサイズ ('sm', 'md', 'lg')
 */
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md' 
}) => {
  if (!isOpen) return null;

  // モーダルサイズに応じたクラス名を決定
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl'
  };

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      {/* 背景オーバーレイ */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* モーダルコンテンツ */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className={`relative bg-white rounded-lg shadow-xl w-full dark:bg-gray-800 ${sizeClasses[size]}`}>
          {/* ヘッダー */}
          {title && (
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors dark:text-gray-500 dark:hover:text-gray-300"
                aria-label="モーダルを閉じる"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}
          
          {/* コンテンツ */}
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal; 