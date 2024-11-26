export interface Note {
  id: string;
  type: 'note';
  title: string;
  content: string;
  marked: boolean;
  trashed: boolean;
}

export interface DraftNote {
  type: 'note';
  title: string;
  content: string;
  marked: boolean;
  trashed: boolean;
}
