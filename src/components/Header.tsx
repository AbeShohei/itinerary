import React from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '../services/supabase'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'

interface HeaderProps {
  user: User
}

const Header: React.FC<HeaderProps> = ({ user }) => {
  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('ログアウトエラー:', error)
    }
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 左側は空（タイトルなし） */}
          <div></div>
          {/* 右側にユーザー情報とアイコン */}
          <div className="flex items-center space-x-2">
            <AccountCircleIcon style={{ fontSize: 28, color: '#555' }} />
            <div className="text-sm text-gray-700">{user.email}</div>
            <button
              onClick={handleSignOut}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              ログアウト
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header