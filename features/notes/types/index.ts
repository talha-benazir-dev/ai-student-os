export type Note = {
  id: string;
  user_id: string;
  title: string;
  content: string;
  subject: string;
  created_at: string;
  updated_at: string;
};

export type NoteInsert = {
  user_id: string;
  title?: string;
  content?: string;
  subject?: string;
};

export type NoteUpdate = {
  title?: string;
  content?: string;
  subject?: string;
  updated_at?: string;
};
