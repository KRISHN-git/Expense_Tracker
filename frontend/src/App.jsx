
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

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const params = {};
      if (categoryFilter) params.category = categoryFilter;
      if (sortOrder === 'date_desc') params.sort = 'date_desc';

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
  }, [categoryFilter, sortOrder]);

  const handleExpenseAdded = (newExpense) => {
    setExpenses(prev => [newExpense, ...prev]);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Expense Tracker</h1>
          <p className="mt-2 text-lg text-gray-600">Simple, robust, and effective personal finance.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-1">
            <ExpenseForm onExpenseAdded={handleExpenseAdded} />
          </div>

          <div className="lg:col-span-2 h-full">
            <ExpenseList
              expenses={expenses}
              loading={loading}
              error={error}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              sortOrder={sortOrder}
              setSortOrder={setSortOrder}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
