import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Expense } from './AddExpenseForm';

interface ExpenseListProps {
  expenses: Expense[];
  onDeleteExpense: (id: string) => void;
}

const categoryColors: Record<string, string> = {
  food: 'bg-category-food text-white',
  transport: 'bg-category-transport text-white',
  entertainment: 'bg-category-entertainment text-white',
  shopping: 'bg-category-shopping text-white',
  health: 'bg-category-health text-white',
  bills: 'bg-category-bills text-white',
  other: 'bg-category-other text-white'
};

const categoryLabels: Record<string, string> = {
  food: 'Food & Dining',
  transport: 'Transportation',
  entertainment: 'Entertainment',
  shopping: 'Shopping',
  health: 'Health & Fitness',
  bills: 'Bills & Utilities',
  other: 'Other'
};

export const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, onDeleteExpense }) => {
  const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (expenses.length === 0) {
    return (
      <Card className="shadow-medium border-0 bg-card">
        <CardContent className="p-8 text-center">
          <div className="text-muted-foreground">
            <TrendingDown className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p className="text-lg mb-2">No transactions yet</p>
            <p className="text-sm">Add your first income or expense to get started!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-medium border-0 bg-card">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Calendar className="h-5 w-5 text-primary" />
          Recent Transactions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {sortedExpenses.map((expense) => (
          <div 
            key={expense.id}
            className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-smooth group"
          >
            <div className="flex items-center gap-3 flex-1">
              <div className={`flex-shrink-0 p-2 rounded-full ${
                expense.type === 'income' ? 'bg-income-light' : 'bg-expense-light'
              }`}>
                {expense.type === 'income' ? (
                  <TrendingUp className="h-4 w-4 text-income" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-expense" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-foreground truncate">{expense.description}</h3>
                  <Badge 
                    variant="secondary" 
                    className={`${categoryColors[expense.category]} text-xs px-2 py-0.5 rounded-full`}
                  >
                    {categoryLabels[expense.category]}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{formatDate(expense.date)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className={`font-bold text-lg ${
                expense.type === 'income' ? 'text-income' : 'text-expense'
              }`}>
                {expense.type === 'income' ? '+' : '-'}${expense.amount.toFixed(2)}
              </span>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDeleteExpense(expense.id)}
                className="opacity-0 group-hover:opacity-100 transition-smooth text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};