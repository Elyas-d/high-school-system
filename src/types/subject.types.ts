export interface CreateSubjectDTO {
  name: string;
  description?: string;
  gradeLevelId: string;
}

export interface UpdateSubjectDTO {
  name?: string;
  description?: string;
  gradeLevelId?: string;
}

export interface AssignToGradeLevelDTO {
  subjectId: string;
  gradeLevelId: string;
} 