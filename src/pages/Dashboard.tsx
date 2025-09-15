import React, { useState, useEffect } from 'react';
import { AddExpenseForm, Expense } from '@/components/AddExpenseForm';
import { ExpenseList } from '@/components/ExpenseList';
import { CategoryTotals } from '@/components/CategoryTotals';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LogOut, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/api';
import { toast } from '@/hooks/use-toast';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);

  // Load expenses and categories from API on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load categories first
        const categoriesData = await api.categories.getAll();
        setCategories(categoriesData);
        
        // Then load expenses
        const expensesData = await api.expenses.getAll();
        
        // Map backend data to frontend format
        const mappedExpenses: Expense[] = expensesData.map((expense: any) => ({
          id: expense.id.toString(),
          amount: expense.amount,
          description: expense.description,
          category: expense.category_name || 'other',
          date: expense.date,
          type: expense.amount >= 0 ? 'income' : 'expense'
        }));
        
        setExpenses(mappedExpenses);
      } catch (error: any) {
        console.error('Error loading data:', error);
        toast({
          title: "Error loading data",
          description: "Failed to load expenses. Using offline mode.",
          variant: "destructive"
        });
        
        // Fallback to demo data if API fails
        const demoExpenses: Expense[] = [
          {
            id: '1',
            amount: 3500,
            description: 'Monthly Salary',
            category: 'other',
            date: '2024-01-15',
            type: 'income'
          },
          {
            id: '2',
            amount: 85.50,
            description: 'Grocery Shopping',
            category: 'food',
            date: '2024-01-14',
            type: 'expense'
          }
        ];
        setExpenses(demoExpenses);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Save expenses to localStorage whenever expenses change (keeping as backup)
  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);

  const addExpense = async (newExpense: Omit<Expense, 'id'>) => {
    try {
      // Find category_id from categories array
      const category = categories.find(cat => cat.name === newExpense.category);
      const category_id = category ? category.id : 1; // default to first category
      
      const expenseData = {
        amount: newExpense.type === 'expense' ? -Math.abs(newExpense.amount) : Math.abs(newExpense.amount),
        category_id,
        date: newExpense.date,
        description: newExpense.description
      };
      
      const result = await api.expenses.create(expenseData);
      
      // Add to local state
      const expense: Expense = {
        id: result.id.toString(),
        amount: newExpense.amount,
        description: newExpense.description,
        category: newExpense.category,
        date: newExpense.date,
        type: newExpense.type
      };
      
      setExpenses(prev => [...prev, expense]);
      
      toast({
        title: "Expense added",
        description: "Your expense has been successfully added.",
      });
    } catch (error: any) {
      toast({
        title: "Error adding expense",
        description: error.message || "Failed to add expense. Please try again.",
        variant: "destructive"
      });
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      await api.expenses.delete(id);
      setExpenses(prev => prev.filter(expense => expense.id !== id));
      
      toast({
        title: "Expense deleted",
        description: "Your expense has been successfully deleted.",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting expense",
        description: error.message || "Failed to delete expense. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleLogout = async () => {
    try {
      await api.auth.logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Logout anyway
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-background">
      {/* Header */}
      <header className="bg-card shadow-soft border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
                <Wallet className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">ExpenseTracker</h1>
                <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Manage your finances with ease</p>
              </div>
            </div>
            
            <Button 
              variant="ghost" 
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground hover:bg-secondary flex-shrink-0"
              size="sm"
            >
              <LogOut className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {loading ? (
          <div className="flex items-center justify-center min-h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading your expenses...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
              {/* Left Column - Form and Summary */}
              <div className="xl:col-span-1 space-y-6">
                <AddExpenseForm onAddExpense={addExpense} categories={categories} />
                <div className="hidden sm:block">
                  <CategoryTotals expenses={expenses} />
                </div>
              </div>

              {/* Right Column - Expenses List */}
              <div className="xl:col-span-2">
                <ExpenseList 
                  expenses={expenses} 
                  onDeleteExpense={deleteExpense} 
                />
              </div>
              
              {/* Category Totals for mobile - show below expenses list */}
              <div className="sm:hidden xl:hidden">
                <CategoryTotals expenses={expenses} />
              </div>
            </div>

            {/* Welcome Message for New Users */}
            {expenses.length === 0 && (
              <Card className="mt-6 sm:mt-8 shadow-medium border-0 bg-card">
                <CardContent className="p-6 sm:p-8 text-center">
                  <Wallet className="mx-auto h-12 sm:h-16 w-12 sm:w-16 text-primary mb-4" />
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Welcome to ExpenseTracker!</h2>
                  <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                    Start by adding your first income or expense using the form above.
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Track your spending, monitor your income, and see where your money goes with beautiful visual insights.
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;