"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  MoreHorizontal,
  CreditCard,
  History,
  Plus,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { Button, Input } from "../../../components/ui'/UIComponents";
import { createClient } from "../../../lib/supabase-client";
import {
  getUserCredits,
  addUserCredits,
  loadUserBooks,
} from "../../../lib/supabase-db";

// --- Real Data Types ---

interface UserData {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string;
  bio: string;
  joinDate: string;
  books: number;
  words: number;
  credits: number;
  status: "active" | "inactive";
}

export default function UserManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [isRechargeOpen, setIsRechargeOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState<string>("");
  const [rechargeNote, setRechargeNote] = useState("");
  const [rechargeLoading, setRechargeLoading] = useState(false);

  // Load data on component mount
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);

      // Fetch users from admin API
      const response = await fetch("/api/admin/users");
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((u) => u.email.includes(searchTerm));

  const handleOpenRecharge = (user: UserData) => {
    setSelectedUser(user);
    setIsRechargeOpen(true);
    setRechargeAmount("");
  };

  const handleOpenHistory = (user: UserData) => {
    setSelectedUser(user);
    setIsHistoryOpen(true);
  };

  // Mock history data for now
  const getMockHistory = (user: UserData) => [
    {
      id: 1,
      date: new Date(Date.now() - 86400000 * 2).toLocaleString(),
      amount: 100,
      type: "Admin Grant",
      operator: "Admin",
    },
    {
      id: 2,
      date: new Date(Date.now() - 86400000 * 5).toLocaleString(),
      amount: -20,
      type: "Consumption",
      operator: "System",
    },
  ];

  const handleRechargeSubmit = async () => {
    if (!selectedUser || !rechargeAmount) return;

    try {
      setRechargeLoading(true);
      const success = await addUserCredits(parseInt(rechargeAmount));
      if (success) {
        setIsRechargeOpen(false);
        setRechargeAmount("");
        setRechargeNote("");
        // Reload data to reflect changes
        await loadUserData();
        alert(`成功为 ${selectedUser.email} 充值 ${rechargeAmount} 积分`);
      } else {
        alert("充值失败，请重试");
      }
    } catch (error) {
      console.error("Recharge error:", error);
      alert("充值失败，请重试");
    } finally {
      setRechargeLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900">
            用户管理
          </h1>
          <p className="text-gray-500 text-sm mt-1">管理用户积分和账户信息</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="bg-white" size="sm">
            导出用户数据
          </Button>
          <Button size="sm" icon={<Plus className="w-4 h-4" />}>
            新增用户
          </Button>
        </div>
      </div>

      {/* User Management Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <h3 className="font-bold text-gray-900 text-lg">用户积分管理</h3>
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="搜索邮箱或ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-medium uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-4">用户信息</th>
                <th className="px-6 py-4">注册时间</th>
                <th className="px-6 py-4 text-center">书籍 / 字数</th>
                <th className="px-6 py-4 text-center">状态</th>
                <th className="px-6 py-4 text-right">当前积分</th>
                <th className="px-6 py-4 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.fullName || user.email}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-600">
                            {(user.fullName || user.email)
                              .charAt(0)
                              .toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-gray-900">
                          {user.fullName || "未设置姓名"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                        <div className="text-xs text-gray-400 font-mono">
                          {user.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{user.joinDate}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="text-gray-900 font-medium">
                      {user.books} 本
                    </div>
                    <div className="text-xs text-gray-400">
                      {(user.words / 1000).toFixed(1)}k 字
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        user.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {user.status === "active" ? "正常" : "冻结"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="font-mono font-bold text-lg text-gray-900">
                      {user.credits}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleOpenHistory(user)}
                        className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-md transition-colors"
                        title="充值记录"
                      >
                        <History className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenRecharge(user)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-black text-white text-xs font-medium rounded-md hover:bg-gray-800 transition-all active:scale-95 shadow-sm"
                      >
                        <CreditCard className="w-3 h-3" />
                        充值
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination (Mock) */}
        <div className="p-4 border-t border-gray-200 flex justify-between items-center text-sm text-gray-500">
          <span>
            显示 1 至 {Math.min(10, filteredUsers.length)} 条，共{" "}
            {filteredUsers.length} 条
          </span>
          <div className="flex gap-2">
            <button
              className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
              disabled
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="p-1 hover:bg-gray-100 rounded">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* --- Recharge Modal --- */}
      {isRechargeOpen && selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100 m-4">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-900">用户积分充值</h3>
              <button onClick={() => setIsRechargeOpen(false)}>
                <X className="w-5 h-5 text-gray-400 hover:text-black" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                  目标用户
                </div>
                <div className="font-medium text-gray-900">
                  {selectedUser.fullName || "未设置姓名"}
                </div>
                <div className="text-sm text-gray-600">
                  {selectedUser.email}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  当前余额: {selectedUser.credits}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">
                  充值数量
                </label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {[10, 50, 100, 500].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setRechargeAmount(amount.toString())}
                      className={`py-2 rounded-md text-sm border font-medium transition-all ${
                        rechargeAmount === amount.toString()
                          ? "border-black bg-black text-white"
                          : "border-gray-200 hover:border-gray-400 text-gray-600"
                      }`}
                    >
                      +{amount}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <input
                    type="number"
                    value={rechargeAmount}
                    onChange={(e) => setRechargeAmount(e.target.value)}
                    placeholder="或输入自定义数量"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg font-mono outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all"
                  />
                  <span className="absolute right-4 top-3.5 text-gray-400 text-sm font-medium">
                    PTS
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">
                  备注 (可选)
                </label>
                <input
                  type="text"
                  value={rechargeNote}
                  onChange={(e) => setRechargeNote(e.target.value)}
                  placeholder="例如：系统补偿、活动赠送"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm outline-none focus:border-black transition-all"
                />
              </div>

              <div className="pt-2">
                <Button
                  className="w-full h-12 text-base shadow-lg shadow-black/10"
                  onClick={handleRechargeSubmit}
                  disabled={
                    !rechargeAmount ||
                    parseInt(rechargeAmount) <= 0 ||
                    rechargeLoading
                  }
                >
                  {rechargeLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      处理中...
                    </>
                  ) : (
                    "确认充值"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- History Modal --- */}
      {isHistoryOpen && selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all scale-100 m-4 h-[600px] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
              <div>
                <h3 className="font-bold text-gray-900">积分变动记录</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {selectedUser.fullName || "未设置姓名"} ({selectedUser.email})
                </p>
              </div>
              <button onClick={() => setIsHistoryOpen(false)}>
                <X className="w-5 h-5 text-gray-400 hover:text-black" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-0">
              <table className="w-full text-sm text-left">
                <thead className="bg-white sticky top-0 z-10 border-b border-gray-100 shadow-sm">
                  <tr>
                    <th className="px-6 py-3 text-gray-500 font-medium text-xs uppercase">
                      时间
                    </th>
                    <th className="px-6 py-3 text-gray-500 font-medium text-xs uppercase">
                      类型
                    </th>
                    <th className="px-6 py-3 text-gray-500 font-medium text-xs uppercase">
                      操作人
                    </th>
                    <th className="px-6 py-3 text-gray-500 font-medium text-xs uppercase text-right">
                      变动额
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {selectedUser &&
                    getMockHistory(selectedUser).map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-gray-600 font-mono text-xs">
                          {record.date}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              record.amount > 0
                                ? "bg-green-50 text-green-700"
                                : "bg-orange-50 text-orange-700"
                            }`}
                          >
                            {record.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {record.operator}
                        </td>
                        <td
                          className={`px-6 py-4 text-right font-mono font-bold ${
                            record.amount > 0
                              ? "text-green-600"
                              : "text-gray-900"
                          }`}
                        >
                          {record.amount > 0 ? "+" : ""}
                          {record.amount}
                        </td>
                      </tr>
                    ))}
                  {/* Mock fill */}
                  {Array.from({ length: 5 }).map((_, i) => (
                    <tr key={`mock_${i}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-600 font-mono text-xs">
                        2024-02-{28 - i} 10:00
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-orange-50 text-orange-700 px-2 py-0.5 rounded text-xs">
                          Consumption
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">System</td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-gray-900">
                        -5
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 text-right shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsHistoryOpen(false)}
              >
                关闭
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
