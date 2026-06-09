export interface Tutoria {
  id: string;
  title: string;
  subject: string;
  description?: string;
  date: string;
  time: string;
  duration: number;
  location?: string;
  maxStudents: number;
  enrolledCount: number;
  status: 'programada' | 'en_curso' | 'finalizada' | 'cancelada';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface TutoriaEnrollment {
  id: string;
  tutoriaId: string;
  studentId: string;
  createdAt: string;
}
