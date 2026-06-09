export type Category = {
  id: string;
  name: string;
  color: string;
};

export type Todo = {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
  completedAt: string | null;
  category: Category;
};
