import { BreakpointObserver } from '@angular/cdk/layout';
import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  #isMobile = false
  #isTablet = false
  #isDark = false
  #isDarkObserver = new BehaviorSubject<boolean>(false)

  constructor(
    breakpointObserver: BreakpointObserver,
    @Inject(PLATFORM_ID) private platformId: string,
  ) {
    breakpointObserver.observe(['(max-width: 761.98px)'])
      .subscribe((state) => (this.#isMobile = state.matches ? true : false))

    breakpointObserver.observe(['(max-width: 991.98px)'])
      .subscribe((state) => (this.#isTablet = state.matches ? true : false))

    const brightness = this.getDataStorage<{ mode: 'light' | 'dark' }>('brightness')
    this.#isDark = brightness?.mode === 'dark' ? true : false
    this.#isDarkObserver.next(this.#isDark)
  }

  get isMobile(): boolean {
    return this.#isMobile
  }

  get isTablet(): boolean {
    return this.#isTablet && !this.#isMobile
  }

  get isTabletOrMobile(): boolean {
    return this.#isTablet || this.#isMobile
  }

  get isDark(): boolean {
    return this.#isDark
  }

  get isDarkObserver(): Observable<boolean> {
    return this.#isDarkObserver.asObservable()
  }

  changeBrightness(): void {
    const brightness = this.#isDark ? 'light' : 'dark'
    this.setDataStorage('brightness', { mode: brightness })
    this.#isDark = brightness === 'dark' ? true : false
    this.#isDarkObserver.next(this.#isDark)
  }


  setDataStorage(key: string, value: { [key: string]: any }): Promise<void> {
    return new Promise((resolve, reject) => {
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem(key, JSON.stringify(value))
        resolve()
      } else {
        reject()
      }
    })
  }

  getDataStorage<T>(key: string): T | null {
    if (isPlatformBrowser(this.platformId)) {
      const data = localStorage.getItem(key)
      return data ? JSON.parse(data) : null
    } else {
      return null
    }
  }

  removeDataStorage(key: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(key)
    }
  }

}
