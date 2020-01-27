import { Injectable, ApplicationRef } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';

@Injectable({providedIn: 'root'})
export class NavigationService {

  constructor(
    private appRef: ApplicationRef,
    private router: Router) { }

  navigate(routeInfo: { route: string, navigationExtras?: NavigationExtras }, context?: string, force: boolean = true) {
    console.log(`[NavigationService] Navigating to ${routeInfo.route} ${context != null ? `(${context})` : ''}`);
    setTimeout(() => {
      // Don't save to browser history
      //routeInfo.navigationExtras = { ...routeInfo.navigationExtras, skipLocationChange: true };
      this.router.navigate([routeInfo.route], routeInfo.navigationExtras)
        .then((success: boolean) => {
          this.appRef.tick();
          if (success !== true && force === true) {
            this.forceNavigation(routeInfo.route);
          }
        })
        .catch((error) => {
          console.error(error, `[NavigationService] Failed to navigate to ${routeInfo.route}`);
          if (force === true) {
            this.forceNavigation(routeInfo.route);
          }
        });
    }, 250);
  }

  private forceNavigation(route: string) {
    console.warn(`[NavigationService] Forcing navigation to ${route} (not really)`);
    const origin = window.location.origin;
    const pathName = window.location.pathname;
    //window.location.assign(`${origin}${pathName}#${route}`);
  }
}
