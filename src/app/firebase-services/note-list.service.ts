import { Injectable, inject } from '@angular/core';
import { DraftNote, Note } from '../interfaces/note.interface';
import {
  Firestore,
  collection,
  doc,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  limit,
  where,
  Unsubscribe,
  QueryConstraint,
} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class NoteListService {
  notes: Array<Note> = [];

  unsubscribe: Unsubscribe | undefined;

  firestore: Firestore = inject(Firestore);

  constructor() {
    this.unsubscribe = this.subscribeToNotes(false, undefined);
  }

  ngOnDestroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  async deleteNote(docId: string) {
    try {
      await deleteDoc(this.getSingleDocRef(docId));
    } catch (err) {
      console.error(err);
    }
  }

  async updateNote(note: Note) {
    const { id, ...data } = note;

    const docRef = this.getSingleDocRef(id);
    try {
      await updateDoc(docRef, data);
    } catch (err) {
      console.error(err);
    }
  }

  async addNote(item: DraftNote) {
    try {
      const docRef = await addDoc(this.getNotesRef(), item);
      console.log('Document written with ID:', docRef?.id);
    } catch (err) {
      console.error(err);
    }
  }

  updateFilters(trashed: boolean, isMarked: boolean | undefined) {
    if (this.unsubscribe) {
      this.unsubscribe();
    }

    this.unsubscribe = this.subscribeToNotes(trashed, isMarked);
  }

  private subscribeToNotes(trashed: boolean, isMarked: boolean | undefined) {
    const q = this.getQuery(trashed, isMarked);

    return onSnapshot(q, (list) => {
      this.notes = [];
      list.forEach((element) => {
        this.notes.push(this.setNoteObject(element.data(), element.id));
      });
    });
  }

  private getQuery(trashed: boolean, isMarked: boolean | undefined) {
    const ref = this.getNotesRef();
    let queryConstraints: Array<QueryConstraint> = [
      where('trashed', '==', trashed),
      limit(100),
    ];

    if (isMarked !== undefined) {
      queryConstraints.push(where('marked', '==', isMarked));
    }

    return query(ref, ...queryConstraints);
  }

  private setNoteObject(obj: Partial<Note>, id: string): Note {
    return {
      id: id,
      type: obj.type || 'note',
      title: obj.title || '',
      content: obj.content || '',
      marked: obj.marked || false,
      trashed: obj.trashed || false,
    };
  }

  private getNotesRef() {
    return collection(this.firestore, 'notes');
  }

  private getSingleDocRef(docId: string) {
    return doc(this.getNotesRef(), docId);
  }
}
