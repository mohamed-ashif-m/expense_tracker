import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { PieChart, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { Expense } from './AddExpenseForm';

interface CategoryTotalsProps {
  expenses: Expense[];
}

const categoryColors: Record<string, string> = {
  food: 'category-food',
  transport: 'category-transport',
  entertainment: 'category-entertainment',
  shopping: 'category-shopping',
  health: 'category-health',
  bills: 'category-bills',
  other: 'category-other'
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

export const CategoryTotals: React.FC<CategoryTotalsProps> = ({ expenses }) => {
  const totalIncome = expenses
    .filter(expense => expense.type === 'income')
    .reduce((sum, expense) => sum + expense.amount, 0);

  const totalExpenses = expenses
    .filter(expense => expense.type === 'expense')
    .reduce((sum, expense) => sum + expense.amount, 0);

  const balance = totalIncome - totalExpenses;

  // Calculate category totals for expenses only
  const categoryTotals = expenses
    .filter(expense => expense.type === 'expense')
    .reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

  const sortedCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6); // Show top 6 categories

  const maxCategoryAmount = Math.max(...Object.values(categoryTotals), 1);

  return (
    <div className="space-y-6">
      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-soft border-0 bg-gradient-income">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-income-foreground/80">Total Income</p>
                <p className="text-2xl font-bold text-income-foreground">${totalIncome.toFixed(2)}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-income-foreground/20 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-income-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft border-0 bg-gradient-expense">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-expense-foreground/80">Total Expenses</p>
                <p className="text-2xl font-bold text-expense-foreground">${totalExpenses.toFixed(2)}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-expense-foreground/20 flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-expense-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`shadow-soft border-0 ${
          balance >= 0 ? 'bg-gradient-income' : 'bg-gradient-expense'
        }`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${
                  balance >= 0 ? 'text-income-foreground/80' : 'text-expense-foreground/80'
                }`}>
                  Balance
                </p>
                <p className={`text-2xl font-bold ${
                  balance >= 0 ? 'text-income-foreground' : 'text-expense-foreground'
                }`}>
                  ${Math.abs(balance).toFixed(2)}
                </p>
              </div>
              <div className={`h-12 w-12 rounded-full ${
                balance >= 0 ? 'bg-income-foreground/20' : 'bg-expense-foreground/20'
              } flex items-center justify-center`}>
                <DollarSign className={`h-6 w-6 ${
                  balance >= 0 ? 'text-income-foreground' : 'text-expense-foreground'
                }`} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      {sortedCategories.length > 0 && (
        <Card className="shadow-medium border-0 bg-card">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-foreground">
              <PieChart className="h-5 w-5 text-primary" />
              Spending by Category
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {sortedCategories.map(([category, amount]) => {
              const percentage = (amount / maxCategoryAmount) * 100;
              const color = categoryColors[category];
              
              return (
                <div key={category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">
                      {categoryLabels[category]}
                    </span>
                    <span className="text-sm font-semibold text-foreground">
                      ${amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="relative">
                    <Progress 
                      value={percentage} 
                      className="h-2 bg-secondary"
                    />
                    <div 
                      className="absolute top-0 left-0 h-2 rounded-full transition-smooth"
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: `hsl(var(--${color}))`
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{((amount / totalExpenses) * 100).toFixed(1)}% of total expenses</span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
};