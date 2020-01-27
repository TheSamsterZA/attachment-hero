import { Component } from '@angular/core';
import { DiagnosticService } from './diagnostics/services/diagnostic.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'attachment-hero';

  constructor(private diag: DiagnosticService) {
    console.log(`AppComponent: `, this.diag.ahDiagnostics)
  }
}
