import { Link } from "react-router-dom";

import React from "react";
import {
  Users,
  BookOpen,
  FileText,
  TrendingUp,
  DollarSign,
  Activity,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Mock Data for Charts
const BORROW_ACTIVITY_DATA = [
  { name: "Mon", borrows: 40 },
  { name: "Tue", borrows: 30 },
  { name: "Wed", borrows: 20 },
  { name: "Thu", borrows: 27 },
  { name: "Fri", borrows: 18 },
  { name: "Sat", borrows: 23 },
  { name: "Sun", borrows: 34 },
];

const BOOKS_PER_CATEGORY_DATA = [
  { name: "Fiction", count: 400 },
  { name: "Science", count: 300 },
  { name: "History", count: 300 },
  { name: "Tech", count: 200 },
  { name: "Art", count: 100 },
];

const FREE_VS_PAID_DATA = [
  { name: "Free Books", value: 60 },
  { name: "Paid Books", value: 40 },
];

const PIE_COLORS = ["#10B981", "#3B82F6"]; // Green, Blue

export default function AdminDashboard() {
  const kpiCards = [
    {
      title: "Total Users",
      value: "1,240",
      change: "+12%",
      icon: Users,
      color: "bg-blue-500",
    },
    {
      title: "Total Books",
      value: "8,340",
      change: "+4%",
      icon: BookOpen,
      color: "bg-purple-500",
    },
    {
      title: "Reports",
      value: "145",
      change: "-2%",
      icon: FileText,
      color: "bg-orange-500",
    },
    {
      title: "Active Borrows",
      value: "342",
      change: "+24%",
      icon: Activity,
      color: "bg-green-500",
    },
    {
      title: "Paid Orders",
      value: "$12,450",
      change: "+8%",
      icon: DollarSign,
      color: "bg-indigo-500",
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm">Last updated: Just now</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {kpiCards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div
                className={`p-3 rounded-lg ${card.color} bg-opacity-10 text-opacity-100 text-white`}
              >
                <card.icon className={`h-6 w-6 ${card.color.replace("bg-", "text-")}`} />
              </div>
              <span
                className={`text-xs font-medium px-2 py-1 rounded-full ${
                  card.change.startsWith("+")
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {card.change}
              </span>
            </div>
            <div>
              <h3 className="text-gray-500 text-sm font-medium">{card.title}</h3>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {card.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Line Chart: Borrow Activity */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900">Borrow Activity</h3>
            <p className="text-sm text-gray-500">Weekly detailed breakdown</p>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={BORROW_ACTIVITY_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="borrows"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart: Books per Category */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900">Books by Category</h3>
            <p className="text-sm text-gray-500">Distribution across genres</p>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={BOOKS_PER_CATEGORY_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: "#F3F4F6" }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart: Free vs Paid */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Catalog Distribution
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Ratio of free resources vs paid premium content.
            </p>
            <div className="flex gap-4">
              {FREE_VS_PAID_DATA.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: PIE_COLORS[index] }}
                  ></div>
                  <span className="text-sm font-medium text-gray-700">
                    {entry.name}: {entry.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="h-64 w-full md:w-1/2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={FREE_VS_PAID_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {FREE_VS_PAID_DATA.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}
