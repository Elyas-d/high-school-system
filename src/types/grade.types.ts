export interface AssignGradeDTO {
  studentId: string;
  classId: string;
  subjectId: string;
  term: string;
  score: number;
}

export interface UpdateGradeDTO {
  score?: number;
  term?: string;
} 