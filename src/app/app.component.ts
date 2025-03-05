// src/app/app.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FlashcardService, Flashcard } from './services/flashcard.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div class="container mx-auto px-4 py-12 max-w-5xl">
        <!-- Header -->
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold text-indigo-900 mb-2">Anglické kartičky</h1>
          <p class="text-gray-600">Napište překlad a zkontrolujte svou odpověď</p>
        </div>

        <!-- Přidání nového slovíčka -->
        <div class="bg-white rounded-xl shadow-lg p-6 mb-12">
          <div class="flex flex-col md:flex-row gap-4">
            <div class="flex-1">
              <label class="block text-sm font-medium text-gray-700 mb-2">České slovo</label>
              <input
                [(ngModel)]="newCzech"
                placeholder="Zadejte české slovo..."
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
              />
            </div>
            <div class="flex-1">
              <label class="block text-sm font-medium text-gray-700 mb-2">Anglické slovo</label>
              <input
                [(ngModel)]="newEnglish"
                placeholder="Zadejte anglické slovo..."
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
              />
            </div>
            <div class="flex items-end">
              <button
                (click)="addCard()"
                class="w-full md:w-auto px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                </svg>
                Přidat
              </button>
            </div>
          </div>
        </div>
        <div class="flex flex-wrap gap-4 items-end">
  <div class="flex-1">
    <label class="block text-sm font-medium text-gray-700 mb-2">CSV Soubor</label>
    <input
      type="file"
      accept=".csv"
      (change)="importFromCsv($event)"
      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
    />
  </div>
  <button
    (click)="downloadCsvTemplate()"
    class="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 flex items-center gap-2"
  >
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
    </svg>
    Stáhnout vzor CSV
  </button>
</div>


        <!-- Kartičky -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div
            *ngFor="let card of flashcards; let i = index"
            class="relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
          >
            <div class="absolute top-2 right-2">
              <button
                (click)="deleteCard(i)"
                class="w-8 h-8 flex items-center justify-center bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200 shadow-lg"
              >
                ×
              </button>
            </div>
            <div class="p-6">
              <p class="text-2xl font-medium text-gray-800 mb-4 text-center">
                {{ card.czech }}
              </p>

              <div *ngIf="!card.isAnswered" class="space-y-4">
                <input
                  [(ngModel)]="card.userAnswer"
                  placeholder="Napište anglický překlad..."
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button
                  (click)="checkAnswer(i)"
                  class="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200"
                >
                  Zkontrolovat
                </button>
              </div>

              <div *ngIf="card.isAnswered" class="space-y-4">
                <p class="text-center" [ngClass]="card.isCorrect ? 'text-green-600' : 'text-red-600'">
                  {{ card.isCorrect ? 'Správně!' : 'Špatně!' }}
                </p>
                <p class="text-center text-gray-800">
                  Správná odpověď: {{ card.english }}
                </p>
                <button
                  (click)="resetCard(i)"
                  class="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
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
