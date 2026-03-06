// Admin Dashboard Page
import { useState, useEffect } from "react";
import { adminApi, type AdminUser, type AdminOrder, type AdminTransaction, type AdminStats } from "../services/api";

type TabType = "users" | "orders" | "transactions" | "stats";

export function Admin() {
  const [activeTab, setActiveTab] = useState<TabType>("users");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      switch (activeTab) {
        case "users":
          const usersRes = await adminApi.getUsers();
          if (usersRes.data) {
            setUsers(usersRes.data.users);
          } else if (usersRes.error) {
            setError(usersRes.error);
          }
          break;
          
        case "orders":
          const ordersRes = await adminApi.getOrders();
          if (ordersRes.data) {
            setOrders(ordersRes.data.orders);
          } else if (ordersRes.error) {
            setError(ordersRes.error);
          }
          break;
          
        case "transactions":
          const txRes = await adminApi.getTransactions();
          if (txRes.data) {
            setTransactions(txRes.data.transactions);
          } else if (txRes.error) {
            setError(txRes.error);
          }
          break;
          
        case "stats":
          const statsRes = await adminApi.getStats();
          if (statsRes.data) {
            setStats(statsRes.data);
          } else if (statsRes.error) {
            setError(statsRes.error);
          }
          break;
      }
    } catch (err) {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm(`Cancel order ${orderId}?`)) return;
    
    const res = await adminApi.cancelOrder(orderId);
    if (res.data) {
      alert("Order cancelled successfully");
      loadData();
    } else if (res.error) {
      alert(`Error: ${res.error}`);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const formatAmount = (amount: number) => {
    return amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-yellow-400">Admin Dashboard</h1>
          <p className="text-gray-400 mt-1">System Management Console</p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6 border-b border-gray-700">
          {(["users", "orders", "transactions", "stats"] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium capitalize transition-colors ${
                activeTab === tab
                  ? "text-yellow-400 border-b-2 border-yellow-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded text-red-200">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-8 text-gray-400">
            Loading...
          </div>
        )}

        {/* Stats Tab */}
        {activeTab === "stats" && stats && !loading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="text-gray-400 text-sm">Total Users</div>
              <div className="text-3xl font-bold text-blue-400">{stats.total_users}</div>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="text-gray-400 text-sm">Total Orders</div>
              <div className="text-3xl font-bold text-green-400">{stats.total_orders}</div>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="text-gray-400 text-sm">Total Transactions</div>
              <div className="text-3xl font-bold text-purple-400">{stats.total_transactions}</div>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="text-gray-400 text-sm">Total Volume</div>
              <div className="text-3xl font-bold text-yellow-400">${formatAmount(stats.total_volume)}</div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && !loading && (
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">ID</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Username</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">KYC Level</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-700/50">
                      <td className="px-4 py-3 text-sm font-mono">{user.id}</td>
                      <td className="px-4 py-3 text-sm">{user.username}</td>
                      <td className="px-4 py-3 text-sm">{user.email}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded text-xs ${
                          user.kyc_level > 0 ? "bg-green-900 text-green-200" : "bg-gray-600 text-gray-300"
                        }`}>
                          Level {user.kyc_level}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">{formatDate(user.created_at)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && !loading && (
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Order ID</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">User</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Symbol</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Side</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Price</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Qty</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Filled</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-8 text-center text-gray-400">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-700/50">
                      <td className="px-4 py-3 text-sm font-mono text-xs">{order.id}</td>
                      <td className="px-4 py-3 text-sm">{order.user_id}</td>
                      <td className="px-4 py-3 text-sm font-medium">{order.symbol}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={order.side === "buy" ? "text-green-400" : "text-red-400"}>
                          {order.side.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">{order.order_type}</td>
                      <td className="px-4 py-3 text-sm">${formatAmount(order.price)}</td>
                      <td className="px-4 py-3 text-sm">{formatAmount(order.quantity)}</td>
                      <td className="px-4 py-3 text-sm">{formatAmount(order.filled)}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded text-xs ${
                          order.status === "filled" ? "bg-green-900 text-green-200" :
                          order.status === "cancelled" ? "bg-red-900 text-red-200" :
                          "bg-yellow-900 text-yellow-200"
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {order.status !== "cancelled" && order.status !== "filled" && (
                          <button
                            onClick={() => handleCancelOrder(order.id)}
                            className="text-red-400 hover:text-red-300 text-xs"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === "transactions" && !loading && (
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">ID</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">User</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Currency</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Amount</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                      No transactions found
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-700/50">
                      <td className="px-4 py-3 text-sm font-mono text-xs">{tx.id}</td>
                      <td className="px-4 py-3 text-sm">{tx.user_id}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded text-xs ${
                          tx.tx_type === "deposit" ? "bg-green-900 text-green-200" :
                          tx.tx_type === "withdraw" ? "bg-red-900 text-red-200" :
                          "bg-blue-900 text-blue-200"
                        }`}>
                          {tx.tx_type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium">{tx.currency}</td>
                      <td className="px-4 py-3 text-sm">${formatAmount(tx.amount)}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded text-xs ${
                          tx.status === "completed" ? "bg-green-900 text-green-200" :
                          tx.status === "pending" ? "bg-yellow-900 text-yellow-200" :
                          "bg-red-900 text-red-200"
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">{formatDate(tx.created_at)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
