"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

interface Sale {
  id: number;
  product_title: string;
  amount: number;
  commission: number;
  transaction_date: string;
  type: string;
}

export default function ClickBankDashboard() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const res = await fetch("/api/clickbank/sales");
        if (!res.ok) throw new Error("Failed to fetch sales");
        const data = await res.json();
        setSales(data.sales || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSales();
  }, []);

  if (loading) return <p>Loading sales...</p>;

  // Transform data for charts
  const chartData = sales.map((s) => ({
    date: new Date(s.transaction_date).toLocaleDateString(),
    amount: s.amount,
    commission: s.commission,
  }));

  return (
    <div className="p-6 bg-white rounded-2xl shadow-md space-y-8">
      <h2 className="text-xl font-bold">ClickBank Sales Dashboard</h2>

      {/* Sales Table */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Recent Transactions</h3>
        {sales.length === 0 ? (
          <p>No sales found yet.</p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b">
                <th className="p-2">Date</th>
                <th className="p-2">Product</th>
                <th className="p-2">Amount</th>
                <th className="p-2">Commission</th>
                <th className="p-2">Type</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((s) => (
                <tr key={s.id} className="border-b hover:bg-gray-50">
                  <td className="p-2">
                    {new Date(s.transaction_date).toLocaleDateString()}
                  </td>
                  <td className="p-2">{s.product_title}</td>
                  <td className="p-2">${s.amount.toFixed(2)}</td>
                  <td className="p-2">${s.commission.toFixed(2)}</td>
                  <td className="p-2">{s.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Revenue Trend Line Chart */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Revenue Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="amount"
              stroke="#3b82f6"
              name="Revenue"
            />
            <Line
              type="monotone"
              dataKey="commission"
              stroke="#10b981"
              name="Commission"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Commission Distribution Bar Chart */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Commission Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="commission" fill="#10b981" name="Commission" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
