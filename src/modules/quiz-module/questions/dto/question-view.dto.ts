export class QuestionViewDto {
  id: string;
  body: string;
  correctAnswers: string[];
  published: boolean;
  createdAt: string;
  updatedAt: string;

  static mapToView(question: any) {
    const dto = new QuestionViewDto();

    dto.id = String(question.id);
    dto.body = question.body;
    dto.correctAnswers = question.correctAnswers;
    dto.published = question.published;
    dto.createdAt = question.createdAt;
    dto.updatedAt = question.updatedAt;
    return dto;
  }
}
