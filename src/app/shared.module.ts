import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/**
 * SharedModule bundles commonly used Angular modules (CommonModule, FormsModule)
 * for easy import across the app's feature modules/components.
 *
 * To use, simply import SharedModule in your standalone component or NgModule.
 */
@NgModule({
  imports: [CommonModule, FormsModule],
  exports: [CommonModule, FormsModule]
})
export class SharedModule {} 