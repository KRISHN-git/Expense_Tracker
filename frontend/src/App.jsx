
import { useState, useEffect } from 'react'
import ExpenseForm from './components/ExpenseForm'
import ExpenseList from './components/ExpenseList'
import { getExpenses } from './services/api'

function App() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('date_desc');
  const [dateFilter, setDateFilter] = useState('');

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const params = {};
      if (categoryFilter) params.category = categoryFilter;
      if (dateFilter) params.date = dateFilter;

      // Handle sort
      params.sort = sortOrder;

      const data = await getExpenses(params);
      setExpenses(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch expenses.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [categoryFilter, sortOrder, dateFilter]);

  const handleExpenseAdded = (newExpense) => {
    setExpenses(prev => [newExpense, ...prev]);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden font-sans text-gray-900">
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center shadow-sm z-10 shrink-0">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            Expense Tracker
          </h1>
        </div>
        <div className="text-sm text-gray-500 font-medium">Dashboard</div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 max-w-7xl mx-auto w-full p-4 grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
          {/* Left Sidebar: Form */}
          <div className="lg:col-span-4 h-full overflow-y-auto pr-1">
            <ExpenseForm onExpenseAdded={handleExpenseAdded} />
          </div>

          {/* Right Content: List & Summary */}
          <div className="lg:col-span-8 h-full flex flex-col overflow-hidden">
            <ExpenseList
              expenses={expenses}
              loading={loading}
              error={error}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              sortOrder={sortOrder}
              setSortOrder={setSortOrder}
              dateFilter={dateFilter}
              setDateFilter={setDateFilter}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
