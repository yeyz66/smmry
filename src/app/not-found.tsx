import Link from 'next/link';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <FileQuestion className="h-24 w-24 text-blue-500" />
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-4">404 - 页面未找到</h1>
        <p className="text-xl text-gray-600 mb-8">
          您访问的页面不存在或已被移动。
        </p>
        
        <Link href="/" className="btn btn-primary text-lg px-6 py-3">
          返回首页
        </Link>
      </div>
    </div>
  )
} 