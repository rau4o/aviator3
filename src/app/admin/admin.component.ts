import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {RoomService} from "../service/room.service";
import {exhaustMap, ReplaySubject, take, takeUntil, tap} from "rxjs";
import {Router} from "@angular/router";
import {CommonModule} from "@angular/common";
import {MatChipEditedEvent, MatChipInputEvent, MatChipsModule} from "@angular/material/chips";
import {LiveAnnouncer} from "@angular/cdk/a11y";
import {COMMA, ENTER} from "@angular/cdk/keycodes";
import {MatFormField} from "@angular/material/form-field";
import {MatIcon} from "@angular/material/icon";

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule, MatChipsModule, MatFormField, MatIcon],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent implements OnInit, OnDestroy{



  private roomService = inject(RoomService);
  private router = inject(Router);
  public coeffList: any[] = [];
  items = [1,2,3]

  public coefficient: number = 1.01;
  public balance: number = 10000;

  #destroyed$: ReplaySubject<boolean> = new ReplaySubject<boolean>();

  public setCoefficient(): void {
    this.roomService.addCoefficient({coefficient: this.fruits})
      .pipe(
        exhaustMap(res => this.roomService.getRoomsList()
          .pipe(
            tap(res => this.coeffList = [...res]),
            tap(_ => this.fruits = [])
          )
        ),
        take(2),
        takeUntil(this.#destroyed$)
      )
      .subscribe()
  }

  public setBalance(): void {
    this.roomService.setBalance({amount: this.balance})
      .pipe()
      .subscribe()
  }

  public cancel(): void {
    this.router.navigate(['/']);
  }

  public getRooms(): void {
    this.roomService.getRoomsList()
      .pipe(
        takeUntil(this.#destroyed$)
      )
      .subscribe(res => {
        this.coeffList = res;
      })
  }

  ngOnInit(): void {
    this.getRooms();
  }

  ngOnDestroy(): void {
    this.#destroyed$.next(true);
    this.#destroyed$.complete();
  }



  addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  fruits: any[] = [];

  announcer = inject(LiveAnnouncer);

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    // Add our fruit
    if (value) {
      this.fruits.push(+value);
    }

    // Clear the input value
    event.chipInput!.clear();
  }

  remove(fruit: any): void {
    const index = this.fruits.indexOf(fruit);

    if (index >= 0) {
      this.fruits.splice(index, 1);

      this.announcer.announce(`Removed ${fruit}`);
    }
  }

  edit(fruit: any, event: MatChipEditedEvent) {
    const value = event.value.trim();

    // Remove fruit if it no longer has a name
    if (!value) {
      this.remove(fruit);
      return;
    }

    // Edit existing fruit
    const index = this.fruits.indexOf(fruit);
    if (index >= 0) {
      this.fruits[index].name = value;
    }
  }
}
