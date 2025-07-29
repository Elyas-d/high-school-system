export interface CreateClassDTO {
  subjectId: string;
  teacherId: string;
  schedule: string;
  roomNumber?: string;
}

export interface UpdateClassDTO {
  subjectId?: string;
  teacherId?: string;
  schedule?: string;
  roomNumber?: string;
}

export interface AssignTeacherDTO {
  classId: string;
  teacherId: string;
}

export interface AssignStudentsDTO {
  classId: string;
  studentIds: string[];
} 