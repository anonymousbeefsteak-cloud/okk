import React from 'react';
import { LINE_ADD_FRIEND_URL, LINE_QR_CODE_URL } from './constants';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-400 to-purple-500 flex justify-center items-center p-4 font-sans">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-2xl overflow-hidden text-center p-8 sm:p-12 animate-fadeIn">
        <header className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">歡迎光臨 🍜 台灣小吃店</h1>
          <p className="text-gray-600">請先加入我們的 LINE 好友以開始點餐！</p>
        </header>

        <div className="mb-8">
          <img src={LINE_QR_CODE_URL} alt="LINE QR Code" className="mx-auto w-48 h-48 sm:w-56 sm:h-56 rounded-lg shadow-md border-4 border-white" />
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-700">兩種方式加入好友</h2>
          <div className="flex flex-col sm:flex-row gap-4">
             <div className="flex-1 text-center p-4 bg-gray-50 rounded-lg border">
                <h3 className="font-bold mb-2 text-gray-800">1. 掃描 QR Code</h3>
                <p className="text-sm text-gray-500">使用手機相機或 LINE App 掃描上方條碼。</p>
             </div>
             <div className="flex-1 text-center p-4 bg-gray-50 rounded-lg border flex flex-col justify-between">
                <div>
                  <h3 className="font-bold mb-2 text-gray-800">2. 點擊按鈕加入</h3>
                  <p className="text-sm text-gray-500 mb-3">如果您正在使用手機瀏覽，請點擊下方按鈕。</p>
                </div>
                <a href={LINE_ADD_FRIEND_URL} target="_blank" rel="noopener noreferrer" className="inline-block w-full mt-2 px-6 py-3 text-lg font-bold text-white bg-green-500 rounded-lg shadow-lg hover:bg-green-600 transition-all transform hover:scale-105">
                  ✅ 加入 LINE 好友
                </a>
             </div>
          </div>
        </div>

        <footer className="mt-8 border-t pt-6">
          <h3 className="font-bold text-lg text-gray-800">加入後會發生什麼事？</h3>
          <p className="text-gray-600 mt-2">
            加入好友後，您將在 LINE 聊天室中收到專屬的 <span className="font-bold text-blue-600">點餐網頁連結</span>，點擊後即可開始訂餐！
          </p>
        </footer>
      </div>
    </div>
  );
}