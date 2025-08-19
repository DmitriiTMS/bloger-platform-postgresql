export type QuestionResponseDB = {
  id: number;
  body: string;
  correctAnswers: string[];
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export type QuestionResponseView = {
  id: string;
  body: string;
  correctAnswers: string[];
  published: boolean;
  createdAt: string;
  updatedAt: string;
};
