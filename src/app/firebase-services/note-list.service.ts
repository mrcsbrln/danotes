import { Injectable, inject } from '@angular/core';
import { Note } from '../interfaces/note.interface';
import {
  Firestore,
  collection,
  doc,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class NoteListService {
  trashNotes: Array<Note> = [];
  normalNotes: Array<Note> = [];

  unsubTrash;
  unsubNotes;

  firestore: Firestore = inject(Firestore);

  constructor() {
    this.unsubNotes = this.subNotesList(100);
    this.unsubTrash = this.subTrashList();
  }

  async deleteNote(colId: 'notes' | 'trash', docId: string) {
    try {
      await deleteDoc(this.getSingleDocRef(colId, docId));
    } catch (err) {
      console.error(err);
    }
  }

  async updateNote(note: Note) {
    if (note.id) {
      let docRef = this.getSingleDocRef(this.getColIdFromNote(note), note.id);
      try {
        await updateDoc(docRef, this.getCleanJson(note));
      } catch (err) {
        console.error(err);
      }
    }
  }

  getCleanJson(note: Note) {
    return {
      type: note.type,
      title: note.title,
      content: note.content,
      marked: note.marked,
    };
  }

  getColIdFromNote(note: Note) {
    if (note.type === 'note') {
      return 'notes';
    }
    return 'trash';
  }

  async addNote(item: Note, colId: 'notes' | 'trash') {
    try {
      const docRef = await addDoc(
        colId === 'notes' ? this.getNotesRef() : this.getTrashRef(),
        item
      );
      console.log('Document written with ID:', docRef?.id);
    } catch (err) {
      console.error(err);
    }
  }

  ngOnDestroy() {
    this.unsubNotes();
    this.unsubTrash();
  }

  subTrashList() {
    return onSnapshot(this.getTrashRef(), (list) => {
      this.trashNotes = [];
      list.forEach((element) => {
        this.trashNotes.push(this.setNoteObject(element.data(), element.id));
      });
    });
  }

  subNotesList(lim: number) {
    const q = query(this.getNotesRef(), orderBy('title'),limit(lim));
    return onSnapshot(q, (list) => {
      this.normalNotes = [];
      list.forEach((element) => {
        this.normalNotes.push(this.setNoteObject(element.data(), element.id));
      });
    });
  }

  setNoteObject(obj: Partial<Note>, id: string): Note {
    return {
      id: id,
      type: obj.type || 'note',
      title: obj.title || '',
      content: obj.content || '',
      marked: obj.marked || false,
    };
  }

  getNotesRef() {
    return collection(this.firestore, 'notes');
  }

  getTrashRef() {
    return collection(this.firestore, 'trash');
  }

  getSingleDocRef(colId: string, docId: string) {
    return doc(collection(this.firestore, colId), docId);
  }
}
