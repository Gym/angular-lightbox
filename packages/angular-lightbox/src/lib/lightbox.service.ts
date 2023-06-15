import { Injectable, Injector } from '@angular/core';
import { LightboxComponent } from './lightbox.component';
import { Properties, LightboxData } from './interfaces';
import { Overlay } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { LIGHTBOX_DATA } from './tokens';

@Injectable()
export class CrystalLightbox {
  constructor(private overlay: Overlay, private injector: Injector) {}

  appendComponentToBody(lightboxData: LightboxData) {
    const overlayRef = this.overlay.create();
    const portalInjector = Injector.create({
      parent: this.injector,
      providers: [{ provide: LIGHTBOX_DATA, useValue: lightboxData }],
    });

    const portal = new ComponentPortal(LightboxComponent, null, portalInjector);

    const overlay = overlayRef.attach(portal);
    overlay.instance.events.subscribe((event) => {
      if (event.type === 'close') {
        overlay.destroy();
      }
    });
  }

  open(lightboxData: LightboxData) {
    lightboxData.properties = this.applyPropertieDefaults(
      lightboxData.properties
    );
    this.appendComponentToBody(lightboxData);
  }

  getLightboxComponent() {
    return LightboxComponent;
  }

  applyPropertieDefaults(properties?: Partial<Properties>): Properties {
    const defaultProperties: Properties = {
      loop: false,
      index: 0,
      counter: false,
      imageMaxHeight: '100%',
      imageMaxWidth: '100%',
      animationDuration: 350,
      animationMode: 'zoom-preloader',
      animationTimingFunction: 'cubic-bezier(0.475, 0.105, 0.445, 0.945)',
      closeButtonText: 'Close',
      counterSeparator: '/',
      disable: false,
      simpleMode: false,
      backgroundColor: 'black',
      backgroundOpacity: 1,
      hideThumbnail: true,
      gestureEnable: false,
    };

    if (!properties) {
      properties = {};
    }

    if (!properties.index) {
      properties.index = 0;
    }

    return Object.assign(defaultProperties, properties);
  }
}
