"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  Users,
  Book,
  FileText,
  TrendingUp,
  Plus,
  Search,
  CreditCard,
  History,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  LucideIcon,
} from "lucide-react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { Button } from "../../components/ui/UIComponents";
import { createClient } from "../../lib/supabase/client";
import { addUserCredits } from "../../lib/supabase-db";

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
  totalCredits: number;
  userTrend: number;
  bookTrend: number;
  wordTrend: number;
}

interface ChartDataPoint {
  name: string;
  users: number;
  words: number;
}

interface StatCardProps {
  title: string;
  value: string;
  subValue: string;
  icon: LucideIcon;
  trend: number;
}

// --- Components ---

const StatCard = ({ title, value, subValue, icon: Icon, trend }: StatCardProps) => (
  <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between h-28 sm:h-32">
    <div className="flex justify-between items-start">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1 truncate">
          {title}
        </p>
        <h3 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 truncate">
          {value}
        </h3>
      </div>
      <div className="p-2 bg-gray-50 rounded-lg text-gray-600 ml-3 flex-shrink-0">
        <Icon className="w-5 h-5" />
      </div>
    </div>
    <div className="flex items-center text-xs mt-2">
      <span
        className={`font-bold ${trend > 0 ? "text-green-600" : "text-red-600"
          } flex items-center`}
      >
        {trend > 0 ? "+" : ""}
        {trend}%
        <TrendingUp className="w-3 h-3 ml-1" />
      </span>
      <span className="text-gray-400 ml-2 truncate">{subValue}</span>
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
    totalCredits: 0,
    userTrend: 0,
    bookTrend: 0,
    wordTrend: 0,
  });
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  // User management states
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<UserData[]>([]);
  const [, setUsersLoading] = useState(false);

  // Modal States
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [isRechargeOpen, setIsRechargeOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState<string>("");
  const [rechargeNote, setRechargeNote] = useState("");
  const [rechargeLoading, setRechargeLoading] = useState(false);

  const [timeRange, setTimeRange] = useState<"7days" | "30days">("7days");
  const [fullChartData, setFullChartData] = useState<ChartDataPoint[]>([]);

  // 使用 useMemo 缓存搜索过滤结果
  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    const term = searchTerm.toLowerCase();
    return users.filter(
      (u) =>
        u.email.toLowerCase().includes(term) ||
        u.id.toLowerCase().includes(term)
    );
  }, [users, searchTerm]);

  // Load data ONLY once on component mount
  useEffect(() => {
    loadAdminData();
    loadUserData();
  }, []);

  // Filter chart data locally when timeRange changes or full data arrives
  useEffect(() => {
    if (fullChartData.length === 0) return;

    if (timeRange === "7days") {
      // Take the last 7 days from the cached full data
      setChartData(fullChartData.slice(-7));
    } else {
      // Show all 30 days
      setChartData(fullChartData);
    }
  }, [timeRange, fullChartData]);

  const loadAdminData = async () => {
    try {
      setLoading(true);

      // Always fetch 30 days of data to cache it locally
      const response = await fetch(`/api/admin/stats?days=30`);
      if (!response.ok) {
        throw new Error("Failed to fetch stats");
      }

      const data = await response.json();
      setStats(data.stats);

      // Store the full dataset locally
      const allData = data.chartData || [];
      setFullChartData(allData);

      // Note: we don't need to call setChartData here because the useEffect above 
      // will trigger as soon as fullChartData changes.

    } catch (error) {
      console.error("Error loading admin data:", error);
      // Fallback to mock data if API fails
      setStats({
        totalUsers: 0,
        totalBooks: 0,
        totalWords: 0,
        totalCredits: 0,
        userTrend: 0,
        bookTrend: 0,
        wordTrend: 0,
      });
      setChartData([]);
      setFullChartData([]);
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
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-serif font-bold text-gray-900">
                      数据概览
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                      平台核心数据和增长趋势
                    </p>
                  </div>
                  <div className="flex gap-3 w-full sm:w-auto">
                    <Button
                      variant="outline"
                      className="bg-white flex-1 sm:flex-none"
                      size="sm"
                    >
                      导出报表
                    </Button>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
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
                    <select
                      className="text-sm border border-gray-200 rounded-md px-2 py-1 bg-gray-50 outline-none hover:bg-gray-100 transition-colors cursor-pointer"
                      value={timeRange}
                      onChange={(e) => setTimeRange(e.target.value as "7days" | "30days")}
                    >
                      <option value="7days">最近7天</option>
                      <option value="30days">最近30天</option>
                    </select>
                  </div>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} barGap={0}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#f0f0f0"
                        />
                        <XAxis
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#6b7280", fontSize: 12 }}
                          dy={10}
                        />
                        <YAxis
                          yAxisId="left"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#6b7280", fontSize: 12 }}
                          tickFormatter={(value) =>
                            value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value
                          }
                        />
                        <YAxis
                          yAxisId="right"
                          orientation="right"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#6b7280", fontSize: 12 }}
                        />
                        <Tooltip
                          cursor={{ fill: "#f9fafb" }}
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-white p-3 border border-gray-100 shadow-xl rounded-lg text-xs">
                                  <p className="font-bold text-gray-900 mb-2">{label}</p>
                                  {payload.map((entry: { color?: string; name?: string; value?: number }, index: number) => (
                                    <div key={index} className="flex items-center gap-2 mb-1 last:mb-0">
                                      <div
                                        className="w-2 h-2 rounded-full"
                                        style={{ backgroundColor: entry.color }}
                                      />
                                      <span className="text-gray-500 capitalize">
                                        {entry.name === 'words' ? '新增字数' : entry.name === 'users' ? '新增用户' : entry.name}:
                                      </span>
                                      <span className="font-mono font-medium">
                                        {entry.name === 'words'
                                          ? ((entry.value ?? 0) >= 1000 ? `${((entry.value ?? 0) / 1000).toFixed(1)}k` : entry.value ?? 0)
                                          : entry.value ?? 0}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar
                          yAxisId="left"
                          dataKey="words"
                          fill="#000000"
                          radius={[4, 4, 0, 0]}
                          maxBarSize={50}
                        />
                        <Bar
                          yAxisId="right"
                          dataKey="users"
                          fill="#e5e7eb"
                          radius={[4, 4, 0, 0]}
                          maxBarSize={50}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            );

          case "users":
            return (
              <div className="space-y-8 animate-in fade-in duration-500">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-serif font-bold text-gray-900">
                      用户管理
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                      用户积分管理和账户操作
                    </p>
                  </div>
                  <div className="flex gap-3 w-full sm:w-auto">
                    <Button
                      size="sm"
                      icon={<Plus className="w-4 h-4" />}
                      className="flex-1 sm:flex-none"
                    >
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

                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-gray-50 text-gray-500 font-medium uppercase tracking-wider text-xs">
                        <tr>
                          <th className="px-6 py-4">用户信息</th>
                          <th className="px-6 py-4">注册时间</th>
                          <th className="px-6 py-4 text-center">书籍 / 字数</th>

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
                                    /* eslint-disable-next-line @next/next/no-img-element */
                                    <img
                                      src={user.avatarUrl}
                                      alt={user.fullName || user.email}
                                      className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                                    />
                                  ) : (
                                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
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

                  {/* Mobile Card View */}
                  <div className="md:hidden space-y-4">
                    {filteredUsers.map((user) => (
                        <div
                          key={user.id}
                          className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              {user.avatarUrl ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img
                                  src={user.avatarUrl}
                                  alt={user.fullName || user.email}
                                  className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                                />
                              ) : (
                                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                                  <span className="text-sm font-medium text-gray-600">
                                    {(user.fullName || user.email)
                                      .charAt(0)
                                      .toUpperCase()}
                                  </span>
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <div className="font-medium text-gray-900 truncate">
                                  {user.fullName || "未设置姓名"}
                                </div>
                                <div className="text-sm text-gray-500 truncate">
                                  {user.email}
                                </div>
                                <div className="text-xs text-gray-400 font-mono truncate">
                                  {user.id}
                                </div>
                              </div>
                            </div>

                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                            <div>
                              <div className="text-gray-500 text-xs uppercase tracking-wider">
                                注册时间
                              </div>
                              <div className="text-gray-900">
                                {user.joinDate}
                              </div>
                            </div>
                            <div>
                              <div className="text-gray-500 text-xs uppercase tracking-wider">
                                当前积分
                              </div>
                              <div className="font-mono font-bold text-lg text-gray-900">
                                {user.credits}
                              </div>
                            </div>
                            <div>
                              <div className="text-gray-500 text-xs uppercase tracking-wider">
                                书籍数量
                              </div>
                              <div className="text-gray-900 font-medium">
                                {user.books} 本
                              </div>
                            </div>
                            <div>
                              <div className="text-gray-500 text-xs uppercase tracking-wider">
                                生成字数
                              </div>
                              <div className="text-gray-900 font-medium">
                                {(user.words / 1000).toFixed(1)}k 字
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2 pt-3 border-t border-gray-100">
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setIsHistoryOpen(true);
                              }}
                              className="flex-1 flex items-center justify-center gap-2 p-2 text-gray-600 hover:text-black hover:bg-gray-50 rounded-md transition-colors border border-gray-200"
                            >
                              <History className="w-4 h-4" />
                              记录
                            </button>
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setIsRechargeOpen(true);
                                setRechargeAmount("");
                              }}
                              className="flex-1 flex items-center justify-center gap-2 p-2 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-all active:scale-95 shadow-sm"
                            >
                              <CreditCard className="w-4 h-4" />
                              充值
                            </button>
                          </div>
                        </div>
                      ))}
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
              </div>
            );

          default:
            return null;
        }
      })()}

      {/* --- Recharge Modal --- */}
      {isRechargeOpen && selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100 max-h-[90vh] overflow-y-auto">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-900 text-base sm:text-lg">
                用户积分充值
              </h3>
              <button onClick={() => setIsRechargeOpen(false)} className="p-1">
                <X className="w-5 h-5 text-gray-400 hover:text-black" />
              </button>
            </div>
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-100">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                  目标用户
                </div>
                <div className="font-medium text-gray-900 text-sm sm:text-base truncate">
                  {selectedUser.fullName || "未设置姓名"}
                </div>
                <div className="text-sm text-gray-600 truncate">
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
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                  {[10, 50, 100, 500].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setRechargeAmount(amount.toString())}
                      className={`py-2 px-3 rounded-md text-sm border font-medium transition-all ${rechargeAmount === amount.toString()
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
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base sm:text-lg font-mono outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all"
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

              <div className="pt-2 space-y-3">
                <Button
                  className="w-full h-11 sm:h-12 text-sm sm:text-base shadow-lg shadow-black/10"
                  onClick={async () => {
                    if (!selectedUser || !rechargeAmount) return;

                    try {
                      setRechargeLoading(true);
                      const supabase = createClient();
                      const success = await addUserCredits(
                        supabase,
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
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setIsRechargeOpen(false)}
                >
                  取消
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- History Modal --- */}
      {isHistoryOpen && selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all scale-100 max-h-[80vh] sm:h-[600px] flex flex-col">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-gray-900 text-base sm:text-lg truncate">
                  积分变动记录
                </h3>
                <p className="text-xs text-gray-500 mt-0.5 truncate">
                  {selectedUser.fullName || "未设置姓名"} ({selectedUser.email})
                </p>
              </div>
              <button
                onClick={() => setIsHistoryOpen(false)}
                className="p-1 ml-2 flex-shrink-0"
              >
                <X className="w-5 h-5 text-gray-400 hover:text-black" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Desktop Table View */}
              <div className="hidden sm:block">
                <table className="w-full text-sm text-left">
                  <thead className="bg-white sticky top-0 z-10 border-b border-gray-100 shadow-sm">
                    <tr>
                      <th className="px-4 sm:px-6 py-3 text-gray-500 font-medium text-xs uppercase">
                        时间
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-gray-500 font-medium text-xs uppercase">
                        类型
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-gray-500 font-medium text-xs uppercase">
                        操作人
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-gray-500 font-medium text-xs uppercase text-right">
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
                        <td className="px-4 sm:px-6 py-4 text-gray-600 font-mono text-xs">
                          {record.date}
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${record.amount > 0
                              ? "bg-green-50 text-green-700"
                              : "bg-orange-50 text-orange-700"
                              }`}
                          >
                            {record.type}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-gray-600">
                          {record.operator}
                        </td>
                        <td
                          className={`px-4 sm:px-6 py-4 text-right font-mono font-bold ${record.amount > 0
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
                        <td className="px-4 sm:px-6 py-4 text-gray-600 font-mono text-xs">
                          2024-02-{28 - i} 10:00
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <span className="bg-orange-50 text-orange-700 px-2 py-0.5 rounded text-xs">
                            Consumption
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-gray-600">
                          System
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-right font-mono font-bold text-gray-900">
                          -5
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="sm:hidden divide-y divide-gray-100">
                {[
                  {
                    id: "1",
                    date: new Date(Date.now() - 86400000 * 2).toLocaleString(),
                    amount: 100,
                    type: "Admin Grant",
                    operator: "Admin",
                  },
                  {
                    id: "2",
                    date: new Date(Date.now() - 86400000 * 5).toLocaleString(),
                    amount: -20,
                    type: "Consumption",
                    operator: "System",
                  },
                ]
                  .concat(
                    Array.from({ length: 5 }).map((_, i) => ({
                      id: `mock_${i}`,
                      date: `2024-02-${28 - i} 10:00`,
                      amount: -5,
                      type: "Consumption",
                      operator: "System",
                    }))
                  )
                  .map((record) => (
                    <div key={record.id} className="p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-gray-400 font-mono mb-1">
                            {record.date}
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${record.amount > 0
                                ? "bg-green-50 text-green-700"
                                : "bg-orange-50 text-orange-700"
                                }`}
                            >
                              {record.type}
                            </span>
                            <span className="text-sm text-gray-600">
                              {record.operator}
                            </span>
                          </div>
                        </div>
                        <div
                          className={`text-right font-mono font-bold text-lg ${record.amount > 0
                            ? "text-green-600"
                            : "text-gray-900"
                            }`}
                        >
                          {record.amount > 0 ? "+" : ""}
                          {record.amount}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 text-right shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsHistoryOpen(false)}
                className="w-full sm:w-auto"
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
