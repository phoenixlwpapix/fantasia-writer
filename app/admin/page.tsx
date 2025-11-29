"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Users,
  Book,
  FileText,
  TrendingUp,
  Plus,
  Search,
  MoreHorizontal,
  CreditCard,
  History,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { Button, Input } from "../../components/ui'/UIComponents";
import { createClient } from "../../lib/supabase-client";
import {
  getUserCredits,
  addUserCredits,
  loadUserBooks,
} from "../../lib/supabase-db";

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

interface StatsData {
  totalUsers: number;
  totalBooks: number;
  totalWords: number;
  userTrend: number;
  bookTrend: number;
  wordTrend: number;
}

interface ChartDataPoint {
  name: string;
  users: number;
  words: number;
}

// --- Components ---

const StatCard = ({ title, value, subValue, icon: Icon, trend }: any) => (
  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between h-32">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">
          {title}
        </p>
        <h3 className="text-3xl font-serif font-bold text-gray-900">{value}</h3>
      </div>
      <div className="p-2 bg-gray-50 rounded-lg text-gray-600">
        <Icon className="w-5 h-5" />
      </div>
    </div>
    <div className="flex items-center text-xs">
      <span
        className={`font-bold ${
          trend > 0 ? "text-green-600" : "text-red-600"
        } flex items-center`}
      >
        {trend > 0 ? "+" : ""}
        {trend}%
        <TrendingUp className="w-3 h-3 ml-1" />
      </span>
      <span className="text-gray-400 ml-2">{subValue}</span>
    </div>
  </div>
);

export default function AdminDashboard() {
  const searchParams = useSearchParams();
  const currentTab =
    (searchParams.get("tab") as "overview" | "users") || "overview";

  const [stats, setStats] = useState<StatsData>({
    totalUsers: 0,
    totalBooks: 0,
    totalWords: 0,
    userTrend: 0,
    bookTrend: 0,
    wordTrend: 0,
  });
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  // User management states
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<UserData[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // Modal States
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [isRechargeOpen, setIsRechargeOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState<string>("");
  const [rechargeNote, setRechargeNote] = useState("");
  const [rechargeLoading, setRechargeLoading] = useState(false);

  // Load data on component mount
  useEffect(() => {
    loadAdminData();
    loadUserData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);

      // Fetch real stats from admin API
      const response = await fetch("/api/admin/stats");
      if (!response.ok) {
        throw new Error("Failed to fetch stats");
      }

      const data = await response.json();
      setStats(data.stats);

      // Mock chart data for now (can be enhanced later with real time-series data)
      setChartData([
        {
          name: "Mon",
          users: Math.floor(data.stats.totalUsers * 0.8),
          words: Math.floor(data.stats.totalWords * 0.7),
        },
        {
          name: "Tue",
          users: Math.floor(data.stats.totalUsers * 0.85),
          words: Math.floor(data.stats.totalWords * 0.75),
        },
        {
          name: "Wed",
          users: Math.floor(data.stats.totalUsers * 0.75),
          words: Math.floor(data.stats.totalWords * 0.72),
        },
        {
          name: "Thu",
          users: Math.floor(data.stats.totalUsers * 0.9),
          words: Math.floor(data.stats.totalWords * 0.8),
        },
        {
          name: "Fri",
          users: Math.floor(data.stats.totalUsers * 1.0),
          words: Math.floor(data.stats.totalWords * 0.95),
        },
        {
          name: "Sat",
          users: Math.floor(data.stats.totalUsers * 1.1),
          words: Math.floor(data.stats.totalWords * 1.1),
        },
        {
          name: "Sun",
          users: Math.floor(data.stats.totalUsers * 1.05),
          words: Math.floor(data.stats.totalWords * 1.05),
        },
      ]);
    } catch (error) {
      console.error("Error loading admin data:", error);
      // Fallback to mock data if API fails
      setStats({
        totalUsers: 0,
        totalBooks: 0,
        totalWords: 0,
        userTrend: 0,
        bookTrend: 0,
        wordTrend: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = async () => {
    try {
      setUsersLoading(true);

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
      setUsersLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {(() => {
        switch (currentTab) {
          case "overview":
            return (
              <div className="space-y-8 animate-in fade-in duration-500">
                {/* Header */}
                <div className="flex justify-between items-end">
                  <div>
                    <h2 className="text-2xl font-serif font-bold text-gray-900">
                      数据概览
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                      平台核心数据和增长趋势
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" className="bg-white" size="sm">
                      导出报表
                    </Button>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StatCard
                    title="总用户数"
                    value={loading ? "..." : stats.totalUsers.toLocaleString()}
                    subValue="较上周"
                    trend={stats.userTrend}
                    icon={Users}
                  />
                  <StatCard
                    title="总书籍量"
                    value={loading ? "..." : stats.totalBooks.toLocaleString()}
                    subValue="较上周"
                    trend={stats.bookTrend}
                    icon={Book}
                  />
                  <StatCard
                    title="总生成字数"
                    value={
                      loading
                        ? "..."
                        : stats.totalWords >= 1000000
                        ? `${(stats.totalWords / 1000000).toFixed(1)}M`
                        : `${(stats.totalWords / 1000).toFixed(1)}K`
                    }
                    subValue="较上周"
                    trend={stats.wordTrend}
                    icon={FileText}
                  />
                </div>

                {/* Charts Section */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-gray-900">平台增长趋势</h3>
                    <select className="text-sm border border-gray-200 rounded-md px-2 py-1 bg-gray-50 outline-none">
                      <option>最近7天</option>
                      <option>最近30天</option>
                    </select>
                  </div>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient
                            id="colorWords"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#000000"
                              stopOpacity={0.1}
                            />
                            <stop
                              offset="95%"
                              stopColor="#000000"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#f0f0f0"
                        />
                        <XAxis
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#9ca3af", fontSize: 12 }}
                          dy={10}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#9ca3af", fontSize: 12 }}
                        />
                        <Tooltip
                          contentStyle={{
                            borderRadius: "8px",
                            border: "none",
                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="words"
                          stroke="#000000"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorWords)"
                        />
                        <Line
                          type="monotone"
                          dataKey="users"
                          stroke="#9ca3af"
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          dot={false}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            );

          case "users":
            return (
              <div className="space-y-8 animate-in fade-in duration-500">
                {/* Header */}
                <div className="flex justify-between items-end">
                  <div>
                    <h2 className="text-2xl font-serif font-bold text-gray-900">
                      用户管理
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                      用户积分管理和账户操作
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button size="sm" icon={<Plus className="w-4 h-4" />}>
                      新增用户
                    </Button>
                  </div>
                </div>

                {/* User Management Section */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
                    <h3 className="font-bold text-gray-900 text-lg">
                      用户积分管理
                    </h3>
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
                        {users
                          .filter((u) => u.email.includes(searchTerm))
                          .map((user) => (
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
                                    <div className="w-8 bg-gray-200 rounded-full flex items-center justify-center">
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
                              <td className="px-6 py-4 text-gray-500">
                                {user.joinDate}
                              </td>
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
                                    onClick={() => {
                                      setSelectedUser(user);
                                      setIsHistoryOpen(true);
                                    }}
                                    className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-md transition-colors"
                                    title="充值记录"
                                  >
                                    <History className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedUser(user);
                                      setIsRechargeOpen(true);
                                      setRechargeAmount("");
                                    }}
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
                      显示 1 至{" "}
                      {Math.min(
                        10,
                        users.filter((u) => u.email.includes(searchTerm)).length
                      )}{" "}
                      条，共{" "}
                      {users.filter((u) => u.email.includes(searchTerm)).length}{" "}
                      条
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
              </div>
            );

          default:
            return null;
        }
      })()}

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
                  onClick={async () => {
                    if (!selectedUser || !rechargeAmount) return;

                    try {
                      setRechargeLoading(true);
                      const success = await addUserCredits(
                        parseInt(rechargeAmount)
                      );
                      if (success) {
                        setIsRechargeOpen(false);
                        setRechargeAmount("");
                        setRechargeNote("");
                        // Reload data to reflect changes
                        await loadUserData();
                        alert(
                          `成功为 ${selectedUser.email} 充值 ${rechargeAmount} 积分`
                        );
                      } else {
                        alert("充值失败，请重试");
                      }
                    } catch (error) {
                      console.error("Recharge error:", error);
                      alert("充值失败，请重试");
                    } finally {
                      setRechargeLoading(false);
                    }
                  }}
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
                  {/* Mock history data */}
                  {[
                    {
                      id: 1,
                      date: new Date(
                        Date.now() - 86400000 * 2
                      ).toLocaleString(),
                      amount: 100,
                      type: "Admin Grant",
                      operator: "Admin",
                    },
                    {
                      id: 2,
                      date: new Date(
                        Date.now() - 86400000 * 5
                      ).toLocaleString(),
                      amount: -20,
                      type: "Consumption",
                      operator: "System",
                    },
                  ].map((record) => (
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
                          record.amount > 0 ? "text-green-600" : "text-gray-900"
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
