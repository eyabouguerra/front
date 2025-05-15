import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-collapsible-inscrire',
  templateUrl: './collapsible-inscrire.component.html',
  styleUrls: ['./collapsible-inscrire.component.css']
})
export class CollapsibleInscrireComponent {
  isOpen: boolean = false;

  @Input() title: string = "";
  @Input() icon: string = ""; // Icône passée depuis le parent

  toggleOpen(event: Event) {
    event.stopPropagation(); // Empêche la fermeture due aux événements parents
    this.isOpen = !this.isOpen;
  }
}
