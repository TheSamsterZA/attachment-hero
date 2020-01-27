import { Component, OnInit, OnDestroy, AfterViewInit, NgZone } from '@angular/core';
import { ActivatedRoute, Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { Subject } from 'rxjs';
import { filter, map, take, takeUntil } from 'rxjs/operators';

import { NavigationService } from './navigation/services/navigation.service';
import { DiagnosticService } from './diagnostics/services/diagnostic.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy, AfterViewInit {

  // Use this to gracefully clean up all other subscriptions via .takeUntil(this.ngUnsubscribe)
  private ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(
    private ngZone: NgZone,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private navigationService: NavigationService,
    private diagnosticService: DiagnosticService) { }

  ngOnInit(): void {

    this.routingLogging();

    if (!Office.context.mailbox.addHandlerAsync) {
      console.warn(`[AppComponent] [INIT] Office.context.mailbox.addHandlerAsync() not available, unable to setup ItemChanged event handler!`);
    }
    else {
      const { platform } = this.diagnosticService.ahDiagnostics;
      if (platform === Office.PlatformType.PC || platform === Office.PlatformType.OfficeOnline || platform === Office.PlatformType.Mac) {
        console.log(`[AppComponent] [INIT] Setup ItemChanged event handler`);

        Office.context.mailbox.addHandlerAsync(Office.EventType.ItemChanged,
          (eventArgs: Office.EventType) => {
            this.onItemChanged(eventArgs);
          },
          {},
          (result: Office.AsyncResult<any>) => {
            if (result.status == Office.AsyncResultStatus.Failed) {
              console.log(`[AppComponent] [INIT] Failed to setup ItemChanged event handler: ${JSON.stringify(result.error)}`);
            }
            else {
              console.log(`[AppComponent] [INIT] Successfully setup ItemChanged event handler`);
            }
          });
      }
      else {
        console.log(`[AppComponent] [INIT] SKIP setup of ItemChanged event handler since we're on ${platform}`);
      }
    }
  }

  ngOnDestroy() {
    // Cleans up all subscriptions chained to this one via takeUntil(this.ngUnsubscribe)
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  ngAfterViewInit() {
    if (!this.router.navigated) {
      console.warn(`[AppComponent] App has not navigated to '${this.router.url}'`);
      this.navigationService.navigate({ route: `home` });
    }
  }

  onItemChanged(eventArgs: Office.EventType) {

    this.ngZone.run(() => {

      console.log('[ItemChanged] Event fired');

      try {

        var item: any = Office.context.mailbox.item;
        if (!item || item == null) {
          console.warn(`[ItemChanged] Office.context.mailbox.item is NULL!`);

          let route: string = '/error';
          this.navigationService.navigate({ route, navigationExtras: { queryParams: { errorCode: '1' } } }, 'ItemChanged');
        }
        else {
          let itemType = Office.context.mailbox.item.itemType;
          switch (itemType) {
            case Office.MailboxEnums.ItemType.Message:
              var subject = item.subject;
              console.log(`[ItemChanged] Subject: ${subject}`);
              break;

            case Office.MailboxEnums.ItemType.Appointment:
              break;
          }

          let route: string = '/home';
          this.navigationService.navigate({ route }, 'ItemChanged');
        }
      }
      catch (error) {
        console.error(error, `[ItemChanged] Error proccessing event`);
      }
    });
  }

  private routingLogging(): void {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationStart),
        take(1),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe((event) => {
        //console.log(`[Initial NavigationStart]`);
        //console.log(event);
      });

    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationCancel),
        take(1),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe((event: NavigationCancel) => {
        //console.log(`[NavigationCancel] Force change the browser URL to route to ${event.url}`);
        const message = `(id: ${event.id} | url: ${event.url} | reason: ${event.reason})`
        console.error(new Error(message), `Router NavigationCancel event fired`);

        /*
        On iOS and Mac, it looks like the Safari browser is not allowing the redirect route to
        complete successfully. We get a NavigationCancel every time. So, try to force the navigation here.
        */
        //this.navigationService.navigate({ route: `/home` });
      });

    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationError),
        take(1),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe((event) => {
        console.log(`[NavigationError]`);
        console.log(event);
      });

    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationStart),
        map(() => this.activatedRoute),
        map((route) => {
          while (route.firstChild) route = route.firstChild;
          return route;
        }),
        filter((route) => route.outlet === 'primary'),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe((event) => {
        //console.log(`[NavigationStart]`);
        //console.log(event);
      });

    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        map(() => this.activatedRoute),
        map((route) => {
          while (route.firstChild) route = route.firstChild;
          return route;
        }),
        filter((route) => route.outlet === 'primary'),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe((event) => {
        //console.log(`[NavigationEnd]`);
        //console.log(event);
      });
  }
}
