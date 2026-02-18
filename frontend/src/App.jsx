
import { useState } from 'react'
import ExpenseForm from './components/ExpenseForm'
import ExpenseList from './components/ExpenseList'

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleExpenseAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">Personal Expense Tracker</h1>
          <p className="mt-2 text-gray-600">Track your spending ensuring every penny counts.</p>
        </header>

        <ExpenseForm onExpenseAdded={handleExpenseAdded} />
        <ExpenseList refreshTrigger={refreshTrigger} />
      </div>
    </div>
  )
}

export default App
