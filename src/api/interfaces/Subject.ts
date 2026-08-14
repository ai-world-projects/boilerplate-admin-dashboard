export interface Subject {
  _id: string;
  name: string;
  code: string;
  description: string;
  instructor: string;
  enrolledCount: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Payload for creating a subject. */
export interface SubjectFormRequest {
  name: string;
  code: string;
  description: string;
  instructor: string;
  isPublished: boolean;
}

export type PartialSubjectFormRequest = Partial<SubjectFormRequest>;
