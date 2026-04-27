export type QuestionAnswer = {
  id: string;
  type: string;
  content: string;
  position: number;
};

export type Question = {
  id: string;
  title: string;
  prompt: string;
  difficulty: 'junior' | 'mid' | 'senior' | 'staff';
  source: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  topics: Array<{ id: string; name: string }>;
  tags: Array<{ id: string; name: string }>;
  answers: QuestionAnswer[];
};
