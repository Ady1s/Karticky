import { Injectable } from '@angular/core';

export interface Flashcard {
  czech: string;
  english: string;
  isAnswered: boolean;
  userAnswer?: string;
  isCorrect?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class FlashcardService {
  private STORAGE_KEY = 'flashcards';

  constructor() {}

  getFlashcards(): Flashcard[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  saveFlashcards(flashcards: Flashcard[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(flashcards));
  }

  addFlashcard(flashcard: Flashcard): void {
    const flashcards = this.getFlashcards();
    flashcards.push({
      ...flashcard,
      isAnswered: false,
      userAnswer: '',
      isCorrect: false
    });
    this.saveFlashcards(flashcards);
  }

  deleteFlashcard(index: number): void {
    const flashcards = this.getFlashcards();
    flashcards.splice(index, 1);
    this.saveFlashcards(flashcards);
  }

  clearFlashcards(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}
