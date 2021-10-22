import { Component, ViewChild } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { MatSidenav } from '@angular/material/sidenav';
import { DomSanitizer } from '@angular/platform-browser';
import { CommonService } from '@services/common.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  @ViewChild('mainSidenav', { static: true }) navigationSidenav!: MatSidenav
  menuMainItems: MenuItem[]

  constructor (
    public commonService: CommonService,
    private iconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer,
  ) {
    this.menuMainItems = this._menuMainItems

    this.registerIconsSocial()
  }

  private get _menuMainItems (): MenuItem[] {
    return [
      {
        label: 'Inicio',
        routerLink: '/home',
        icon: 'home',
      },
    ]
  }

  /**
   * Agrega los iconos sociales a la coleccion de iconos
   */
  private registerIconsSocial (): void {
    const iconsList = [
      { name: 'facebook', location: '/assets/icons/social/facebook.svg' },
      { name: 'instagram', location: '/assets/icons/social/instagram.svg' },
      { name: 'linked_in', location: '/assets/icons/social/linked_in.svg' },
      { name: 'telegram', location: '/assets/icons/social/telegram.svg' },
      { name: 'twitter', location: '/assets/icons/social/twitter.svg' },
      { name: 'whatsapp', location: '/assets/icons/social/whatsapp.svg' },
      { name: 'github', location: '/assets/icons/social/github.svg' },
    ]

    for (let i = 0; i < iconsList.length; i++) {
      const icon = iconsList[i]
      this.iconRegistry.addSvgIcon(icon.name, this.sanitizer.bypassSecurityTrustResourceUrl(icon.location))
    }
  }

}

interface MenuItem {
  label: string
  routerLink: string
  icon: string
}
