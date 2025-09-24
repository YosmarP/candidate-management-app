import { Directive, ElementRef, Input, OnChanges, SimpleChanges, AfterViewInit } from '@angular/core';

@Directive({
  selector: '[appAutoFocus]',
  standalone: true
})
export class AutoFocusDirective implements AfterViewInit, OnChanges {
  
  @Input('appAutoFocus') 
  autoFocus: boolean | string = true;

  @Input()
  focusTrigger: any;

  @Input()
  focusDelay: number = 100;

  constructor(private el: ElementRef) {}

  ngAfterViewInit() {
    this.applyFocus();
  }

  ngOnChanges(changes: SimpleChanges) {
    // Reacciona cuando cambia focusTrigger
    if (changes['focusTrigger'] && !changes['focusTrigger'].firstChange) {
      this.applyFocus();
    }
  }

  private applyFocus(): void {
    if (this.shouldFocus()) {
      setTimeout(() => {
        this.focusElement();
      }, this.focusDelay);
    }
  }

  private shouldFocus(): boolean {
    if (typeof this.autoFocus === 'boolean') return this.autoFocus;
    if (typeof this.autoFocus === 'string') {
      return this.autoFocus === 'true' || this.autoFocus === '';
    }
    return true;
  }

  private focusElement(): void {
    try {
      this.el.nativeElement.focus();
    } catch (error) {
      console.warn('No se pudo enfocar el elemento:', error);
    }
  }
}