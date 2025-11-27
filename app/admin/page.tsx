"use client";

import React, { useState, useEffect } from "react";
import { Users, Book, FileText, TrendingUp, Plus } from "lucide-react";
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
import { Button } from "../../components/ui'/UIComponents";

// --- Real Data Types ---

interface UserData {
  id: string;
  email: string;
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

  // Load data on component mount
  useEffect(() => {
    loadAdminData();
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

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900">
            数据概览
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            欢迎回来，管理员。这里是 Fantasia 的核心数据。
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="bg-white" size="sm">
            导出报表
          </Button>
          <Button size="sm" icon={<Plus className="w-4 h-4" />}>
            新增用户
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
            loading ? "..." : `${(stats.totalWords / 1000000).toFixed(1)}M`
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
                <linearGradient id="colorWords" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#000000" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#000000" stopOpacity={0} />
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
}
