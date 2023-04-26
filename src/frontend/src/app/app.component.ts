import { Component, ViewChild } from '@angular/core'
import { MatIconRegistry } from '@angular/material/icon'
import { MatSidenav } from '@angular/material/sidenav'
import { DomSanitizer } from '@angular/platform-browser'
import { CommonService } from '@shared/services/common.service'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  @ViewChild('mainSidenav', { static: true }) navigationSidenav!: MatSidenav
  menuMainItems: MenuItem[]

  constructor(
    private iconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer,
    public commonService: CommonService,
  ) {
    this.menuMainItems = this._menuMainItems

    this.registerIconsSocial()
  }

  private get _menuMainItems(): MenuItem[] {
    return [
      {
        label: 'Inicio',
        routerLink: '/',
        icon: 'home',
      },
    ]
  }

  /**
   * Agrega los iconos sociales a la coleccion de iconos
   */
  private registerIconsSocial(): void {
    const iconsList = [
      { name: 'facebook', location: '/assets/icons/social/facebook.svg' },
      { name: 'instagram', location: '/assets/icons/social/instagram.svg' },
      { name: 'linked_in', location: '/assets/icons/social/linked_in.svg' },
      { name: 'telegram', location: '/assets/icons/social/telegram.svg' },
      { name: 'twitter', location: '/assets/icons/social/twitter.svg' },
      { name: 'whatsapp', location: '/assets/icons/social/whatsapp.svg' },
      { name: 'github', location: '/assets/icons/social/github.svg' },

      { name: 'python', location: '/assets/icons/technologies/python.svg' },
      { name: 'java', location: '/assets/icons/technologies/java.svg' },
      { name: 'net', location: '/assets/icons/technologies/net.svg' },
      { name: 'javascript', location: '/assets/icons/technologies/javascript.svg' },
      { name: 'c_sharp', location: '/assets/icons/technologies/c_sharp.svg' },
      { name: 'php', location: '/assets/icons/technologies/php.svg' },
      { name: 'c_c_plusplus', location: '/assets/icons/technologies/c_c_plusplus.svg' },
      { name: 'typescript', location: '/assets/icons/technologies/typescript.svg' },
      { name: 'nodejs', location: '/assets/icons/technologies/nodejs.svg' },
      { name: 'dart', location: '/assets/icons/technologies/dart.svg' },
      { name: 'swift', location: '/assets/icons/technologies/swift.svg' },
      { name: 'objective_c', location: '/assets/icons/technologies/objective_c.svg' },
      { name: 'django', location: '/assets/icons/technologies/django.svg' },
      { name: 'spring', location: '/assets/icons/technologies/spring.svg' },
      { name: 'laravel', location: '/assets/icons/technologies/laravel.svg' },
      { name: 'react', location: '/assets/icons/technologies/react.svg' },
      { name: 'angular', location: '/assets/icons/technologies/angular.svg' },
      { name: 'blazor', location: '/assets/icons/technologies/blazor.svg' },
      { name: 'vuejs', location: '/assets/icons/technologies/vuejs.svg' },
      { name: 'nestjs', location: '/assets/icons/technologies/nestjs.svg' },
      { name: 'adonisjs', location: '/assets/icons/technologies/adonisjs.svg' },
      { name: 'flutter', location: '/assets/icons/technologies/flutter.svg' },
      { name: 'ionic', location: '/assets/icons/technologies/ionic.svg' },
      { name: 'a_frame', location: '/assets/icons/technologies/a_frame.svg' },
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
