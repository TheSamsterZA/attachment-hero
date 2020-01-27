import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { environment } from '../environments/environment';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { DiagnosticService } from './diagnostics/services/diagnostic.service';

export function appInitializerFactory(diagnosticService: DiagnosticService) {
  const officeJsLoadFailedErrorMessage = `[INIT] OfficeJS load failed`;
  return () => Office.onReady()
    .then(({ host, platform }) => {
      if (host != null && platform != null) {
        // We are in an Office host (Word, Desktop / Mac / Online / Mobile),
        console.log(`[INIT] OfficeJS load complete`, host, platform);

        diagnosticService.init({ host, platform });

        if (platform === Office.PlatformType.PC) {
          handleOffice2016Msi();
        }

        if (!environment.production) {
          // TODO: figure out why OfficeExtensionis undefined at runtime
          // console.log(`[INIT] Switch on OfficeJS extended error logging`);
          // OfficeExtension.config.extendedErrorLogging = true;
        }
      } else {
        throw new Error(officeJsLoadFailedErrorMessage);
      }
    })
    .catch((error: Error) => {
      if (error.message === officeJsLoadFailedErrorMessage) {
        console.warn(officeJsLoadFailedErrorMessage);
      } else {
        console.error(error);
      }
    });
}

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: appInitializerFactory,
      deps: [DiagnosticService],
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

export function handleOffice2016Msi() {
  if (isOffice16OrHigher()) {
    // For Office 2016 MSI, need to have a build that supports the "GetHostInfo" API.
    try {
      (window.external as any).GetHostInfo();
    } catch (error) {
      // The app won't run properly, so we need to show a message here
      /* tslint:disable */
      const message = `Office Update Required

    Your Office version is missing important updates, and this app won't run properly until you install those updates.
    To install, please follow the instructions at
    https://docs.microsoft.com/en-us/officeupdates/office-updates-msi`;
      /* tslint:enable */
      console.error(message);
    }
  }

  function isOffice16OrHigher(): boolean {
    const hasVersion =
      Office
      && Office.context
      && Office.context.diagnostics
      && Office.context.diagnostics.version;

    if (hasVersion) {
      const versionString = Office.context.diagnostics.version;
      const num = Number.parseInt(
        versionString.substr(0, versionString.indexOf('.')),
        10,
      );
      return num >= 16;
    }

    /*
    The only hosts that don't support Office.context.diagnostics.version are the 2016 hosts that
    still use the non-updated "16.00" files (by contrast, 15.XX files do support it)
    So it's actually a giveaway that they *are* O16.
    */
    return true;
  }
}
