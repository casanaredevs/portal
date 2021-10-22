import { Injectable } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { AbstractControl, ValidatorFn } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { map } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class CommonService {

  private _isMobile = false

  constructor (
    private breakpointObserver: BreakpointObserver,
    private snackBar: MatSnackBar,
  ) {
    breakpointObserver.observe(['(max-width: 991.98px)'])
      .subscribe((state) => (this._isMobile = state.matches ? true : false))
  }

  get isMobile (): boolean {
    return this._isMobile
  }

  get isDarkObserver (): Observable<boolean> {
    return this.breakpointObserver.observe(['(prefers-color-scheme: dark)'])
      .pipe(map((state) => state.matches))
  }

  presentSnackBar (message: string, data?: { duration?: number }): void {
    this.snackBar.open(message, 'Ok', {
      duration: data?.duration ?? 3500
    })
  }

  setDataStorage (key: string, value: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        localStorage.setItem(key, value)
        resolve(true)
      } catch (error) {
        reject(error)
      }
    })
  }

  getDataStorage (key: string): Promise<string | null> {
    return new Promise((resolve, reject) => {
      try {
        const data = localStorage.getItem(key)
        resolve(data)
      } catch (error) {
        reject(error)
      }
    })
  }

  deleteDataStorage (key: string): void {
    return localStorage.removeItem(key)
  }

  patternValidator (regex: RegExp, error: { [key: string]: boolean }): ValidatorFn | null {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      if (!control.value) {
        // if control is empty return no error
        return null
      }

      // test the value of the control against the regexp supplied
      const valid = regex.test(control.value);

      // if true, return no error (no error), else return error passed in the second parameter
      return valid ? null : error
    }
  }

  matchValidator (controlName: string, matchingControlName: string): ValidatorFn | null {
    return (abstractControl: AbstractControl): { [key: string]: boolean } | null => {
      const _control = abstractControl.get(controlName)
      const _controlConfirmation = abstractControl.get(matchingControlName)

      if (!_control || !_controlConfirmation) { return null }

      if (_control.value === _controlConfirmation.value) {
        _controlConfirmation.setErrors(null)
      } else {
        _controlConfirmation.setErrors({ confirmed: true })
      }

      return null
    }
  }

  /**
   * Toma el error y obtiene el mensaje a mostrar
   * @param err Respuesta de error de petición HTTP
   * @param message Mensaje a mostrar en algunos casos
   * @returns Mensaje
   */
  getMessageErrorHttp (err: any, message?: string): string {
    let _message = ''

    if (err.error && typeof err.error === 'string') {

      _message = err.error

    } else if (err.error.errors && Array.isArray(err.error.errors)) {

      _message = Array.from(<[]>err.error.errors).map((error: { message: string }) =>
        error.message).join(' <br /> ')

    } else if (message) {

      _message = message

    }

    if (!_message) {
      _message = err.statusText
    }

    return _message
  }

  /**
   * Convierte un objecto en HttpParams
   * @param paramsObject Objecto - parámetros
   * @returns HttpParmas
   */
  getHttpParams (paramsObject?: { [key: string]: string | boolean | number | string[] }): HttpParams {
    let params = new HttpParams()

    if (paramsObject) {
      Object.keys(paramsObject).forEach((key) => {
        const value = paramsObject[key]

        if (value && Array.isArray(value)) {
          value.forEach((value) => {
            params = params.append(`${key}[]`, value)
          })
        } else {
          params = params.append(key, value)
        }

      })
    }

    return params
  }

  isNumber (value: string): boolean {

    if ((/\D/).test(value)) {
      return false
    } else {
      return true
    }

  }


  /**
   * Crea un nuevo identificador aleatorio de longitud fija.
   * @param len Logitud para el uid, por defecto 11
   * @returns uid
   */
  uid (len?: number): string {
    let IDX = 256, HEX = [], SIZE = 256, BUFFER;
    while (IDX--) HEX[IDX] = (IDX + 256).toString(16).substring(1);

    let i = 0, tmp = (len || 11);

    if (!BUFFER || ((IDX + tmp) > SIZE * 2)) {
      for (BUFFER = '', IDX = 0; i < SIZE; i++) {
        BUFFER += HEX[Math.random() * 256 | 0];
      }
    }

    return BUFFER.substring(IDX, IDX++ + tmp);
  }

}


export interface RequestParams {
  paramsObject?: { [key: string]: string | boolean | number | string[] }
}
