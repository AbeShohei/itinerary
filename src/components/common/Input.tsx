import React from 'react';

/**
 * 入力フィールドのタイプ
 */
type InputType = 'text' | 'email' | 'password' | 'number' | 'date' | 'textarea';

/**
 * 再利用可能な入力フィールドコンポーネント
 * 
 * @param type - 入力フィールドのタイプ
 * @param label - ラベルテキスト
 * @param placeholder - プレースホルダーテキスト
 * @param error - エラーメッセージ
 * @param required - 必須項目かどうか
 * @param disabled - 無効化状態
 * @param className - 追加のCSSクラス
 * @param value - 入力値
 * @param onChange - 値変更ハンドラー
 */
interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  type?: InputType;
  label?: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  value?: string | number;
  onChange?: (value: string) => void;
}

const Input: React.FC<InputProps> = ({
  type = 'text',
  label,
  placeholder,
  error,
  required = false,
  disabled = false,
  className = '',
  value,
  onChange,
  ...props
}) => {
  // エラー状態のクラス名
  const errorClasses = error 
    ? 'border-red-300 focus:border-red-500 focus:ring-red-500 dark:border-red-600 dark:focus:border-red-400' 
    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:focus:border-blue-400';

  // 無効化状態のクラス名
  const disabledClasses = disabled 
    ? 'bg-gray-50 cursor-not-allowed dark:bg-gray-800 text-gray-400' 
    : 'bg-white text-gray-900';

  const baseClasses = `
    block w-full px-3 py-2 border rounded-lg shadow-sm
    placeholder-gray-400 focus:outline-none focus:ring-1
    transition-colors duration-200 ${errorClasses} ${disabledClasses} ${className}
  `.trim();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  return (
    <div className="space-y-1">
      {/* ラベル */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {/* 入力フィールド */}
      {type === 'textarea' ? (
        <textarea
          className={baseClasses}
          placeholder={placeholder}
          value={value ?? ""}
          onChange={e => onChange && onChange(e.target.value)}
          disabled={disabled}
          required={required}
          {...props as any}
        />
      ) : (
        <input
          type={type}
          className={baseClasses}
          placeholder={placeholder}
          value={value ?? ""}
          onChange={handleChange}
          disabled={disabled}
          required={required}
          {...props}
        />
      )}
      
      {/* エラーメッセージ */}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};

export default Input; 