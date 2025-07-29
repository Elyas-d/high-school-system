export interface AssignSubjectsAndClassesDTO {
  teacherId: string;
  subjectIds: string[];
  classIds: string[];
}

export interface CreateTeacherDTO {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string;
}

export interface UpdateTeacherDTO {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  phoneNumber?: string;
} 