// src/app/app.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FlashcardService, Flashcard } from './services/flashcard.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrls: ['./app.component.css'],
  template: `
    <div class="app-container">
      <div class="container">
        <!-- Header -->
        <div class="header">
          <h1>Anglické kartičky</h1>
          <p>Napište překlad a zkontrolujte svou odpověď</p>
        </div>

        <!-- Přidání nového slovíčka -->
        <div class="new-card-container">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">České slovo</label>
              <input
                [(ngModel)]="newCzech"
                placeholder="Zadejte české slovo..."
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label class="form-label">Anglické slovo</label>
              <input
                [(ngModel)]="newEnglish"
                placeholder="Zadejte anglické slovo..."
                class="form-input"
              />
            </div>
            <div class="button-container">
              <button
                (click)="addCard()"
                class="btn btn-primary btn-normal"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                </svg>
                Přidat
              </button>
            </div>
          </div>
        </div>

        <!-- CSV Import -->
        <div class="csv-container">
          <div class="csv-form-group">
            <label class="form-label">CSV Soubor</label>
            <input
              type="file"
              accept=".csv"
              (change)="importFromCsv($event)"
              class="form-input"
            />
          </div>
          <button
            (click)="downloadCsvTemplate()"
            class="btn btn-gray"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
            Stáhnout vzor CSV
          </button>
        </div>

        <!-- Kartičky -->
        <div class="cards-grid">
          <div
            *ngFor="let card of flashcards; let i = index"
            class="card"
          >
            <div class="card-delete-btn">
              <button
                (click)="deleteCard(i)"
                class="btn btn-danger"
              >
                ×
              </button>
            </div>
            <div class="card-body">
              <p class="card-title">
                {{ card.czech }}
              </p>

              <div *ngIf="!card.isAnswered" class="card-actions">
                <input
                  [(ngModel)]="card.userAnswer"
                  placeholder="Napište anglický překlad..."
                  class="form-input"
                />
                <button
                  (click)="checkAnswer(i)"
                  class="btn btn-green btn-full"
                >
                  Zkontrolovat
                </button>
              </div>

              <div *ngIf="card.isAnswered" class="card-actions">
                <p class="text-center" [ngClass]="card.isCorrect ? 'text-correct' : 'text-incorrect'">
                  {{ card.isCorrect ? 'Správně!' : 'Špatně!' }}
                </p>
                <p class="text-center">
                  Správná odpověď: {{ card.english }}
                </p>
                <button
                  (click)="resetCard(i)"
                  class="btn btn-blue btn-full"
                >
                  Zkusit znovu
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AppComponent implements OnInit {
  flashcards: Flashcard[] = [];
  newCzech: string = '';
  newEnglish: string = '';

  constructor(private flashcardService: FlashcardService) {}

  ngOnInit() {
    this.loadFlashcards();
  }

  loadFlashcards() {
    this.flashcards = this.flashcardService.getFlashcards();
  }

  addCard(): void {
    if (this.newCzech && this.newEnglish) {
      const newCard: Flashcard = {
        czech: this.newCzech,
        english: this.newEnglish.toLowerCase(),
        isAnswered: false,
        userAnswer: '',
        isCorrect: false
      };

      this.flashcardService.addFlashcard(newCard);
      this.loadFlashcards();

      this.newCzech = '';
      this.newEnglish = '';
    }
  }

  checkAnswer(index: number): void {
    const card = this.flashcards[index];
    if (!card.userAnswer) return;

    card.isAnswered = true;
    card.isCorrect = card.userAnswer.toLowerCase().trim() === card.english.toLowerCase().trim();
    this.flashcardService.saveFlashcards(this.flashcards);
  }

  resetCard(index: number): void {
    this.flashcards[index].isAnswered = false;
    this.flashcards[index].userAnswer = '';
    this.flashcards[index].isCorrect = false;
    this.flashcardService.saveFlashcards(this.flashcards);
  }

  deleteCard(index: number): void {
    this.flashcardService.deleteFlashcard(index);
    this.loadFlashcards();
  }

  importFromCsv(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const lines = text.split('\n');

        // Přeskočit hlavičku
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (line) {
            const [czech, english] = line.split(',').map(item => item.trim());
            if (czech && english) {
              const newCard: Flashcard = {
                czech,
                english: english.toLowerCase(),
                isAnswered: false,
                userAnswer: '',
                isCorrect: false
              };
              this.flashcardService.addFlashcard(newCard);
            }
          }
        }
        this.loadFlashcards();
        alert('Slovíčka byla úspěšně importována!');
      };
      reader.readAsText(file);
    }
  }

  downloadCsvTemplate(): void {
    const template = 'České slovo,Anglické slovo\npes,dog\nkočka,cat';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'slovicka_vzor.csv');
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
