import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from './sidebar.component';
import { SharedModule } from './shared.module';
import { WhatsNewDialogComponent } from './components/whats-new-dialog/whats-new-dialog.component';

export const WHATS_NEW_VERSION = '1.2.0';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [SharedModule, RouterModule, SidebarComponent, WhatsNewDialogComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  /**
   * Current theme mode: 'light' or 'dark'.
   */
  theme: 'light' | 'dark' = 'light';
  sidebarOpen = false;
  showWhatsNew = false;

  constructor() {
    // Load theme from localStorage or system preference
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light') {
      this.theme = saved;
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      this.theme = 'dark';
    }
    this.applyTheme();

    // Show What's New dialog once per app version
    const seenVersion = localStorage.getItem('whats-new-version');
    if (seenVersion !== WHATS_NEW_VERSION) {
      this.showWhatsNew = true;
    }
  }

  /**
   * Toggle between dark and light mode, persist choice, and apply to body.
   */
  toggleTheme() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', this.theme);
    this.applyTheme();
  }

  /**
   * Apply the current theme by setting a class on the body element.
   */
  applyTheme() {
    document.body.classList.remove('light-mode', 'dark-mode');
    document.body.classList.add(this.theme + '-mode');
  }

  openSidebar() {
    this.sidebarOpen = true;
  }
  closeSidebar() {
    this.sidebarOpen = false;
  }

  /**
   * Dismiss the What's New dialog and persist that this version was seen.
   */
  dismissWhatsNew() {
    localStorage.setItem('whats-new-version', WHATS_NEW_VERSION);
    this.showWhatsNew = false;
  }
}
