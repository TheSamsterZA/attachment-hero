import { Injectable } from '@angular/core';
import bowser from 'bowser';

import { AhDiagnostics } from '../models/diagnostics.model';

@Injectable({ providedIn: 'any' })
export class DiagnosticService {

  public ahDiagnostics: AhDiagnostics = {};

  constructor() {
    // Get browser info
    const { browser, engine, os } = bowser.parse(window.navigator.userAgent);
    this.ahDiagnostics.browser = {
      name: browser.name,
      version: browser.version,
      engine: {
        name: engine.name,
        version: engine.version
      }
    };
    this.ahDiagnostics.os = {
      name: os.name,
      version: os.version,
      versionName: os.versionName
    };
  }

  init(officeInfo: { host: Office.HostType, platform: Office.PlatformType }) {
    const { host, platform } = officeInfo;
    this.ahDiagnostics = { ...this.ahDiagnostics, host, platform };
  }
}
