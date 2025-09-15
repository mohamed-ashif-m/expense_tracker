import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, DollarSign } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export interface Expense {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  type: 'income' | 'expense';
}

interface AddExpenseFormProps {
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  categories?: Array<{ id: number; name: string; }>;
}

const defaultCategories = [
  { id: 1, name: 'Food & Dining' },
  { id: 2, name: 'Transportation' },
  { id: 3, name: 'Entertainment' },
  { id: 4, name: 'Shopping' },
  { id: 5, name: 'Health & Fitness' },
  { id: 6, name: 'Bills & Utilities' },
  { id: 7, name: 'Other' }
];

export const AddExpenseForm: React.FC<AddExpenseFormProps> = ({ onAddExpense, categories = defaultCategories }) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !description || !category) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    onAddExpense({
      amount: parseFloat(amount),
      description,
      category,
      date: new Date().toISOString().split('T')[0],
      type
    });

    // Reset form
    setAmount('');
    setDescription('');
    setCategory('');
    
    toast({
      title: type === 'income' ? "Income added!" : "Expense added!",
      description: `${type === 'income' ? 'Income' : 'Expense'} of $${amount} has been recorded.`,
    });
  };

  return (
    <Card className="shadow-medium border-0 bg-card">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-foreground">
          <PlusCircle className="h-5 w-5 text-primary" />
          Add New {type === 'income' ? 'Income' : 'Expense'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type" className="text-foreground font-medium">Type</Label>
              <Select value={type} onValueChange={(value: 'income' | 'expense') => setType(value)}>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense" className="text-expense">Expense</SelectItem>
                  <SelectItem value="income" className="text-income">Income</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-foreground font-medium">Amount</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-9 bg-background border-border"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-foreground font-medium">Description</Label>
            <Input
              id="description"
              placeholder="What was this for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-background border-border"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-foreground font-medium">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.name}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            type="submit" 
            className={`w-full ${
              type === 'income' 
                ? 'bg-gradient-income hover:bg-income' 
                : 'bg-gradient-expense hover:bg-expense'
            } text-white border-0 shadow-soft transition-smooth`}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add {type === 'income' ? 'Income' : 'Expense'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};