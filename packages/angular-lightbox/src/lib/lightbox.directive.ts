import {
  Directive,
  ElementRef,
  Input,
  Output,
  HostListener,
  HostBinding,
  EventEmitter,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EventService, LightboxEvent } from './event.service';
import { CrystalLightbox } from './lightbox.service';
import { Properties, ImageExtended, Image } from './interfaces';

@Directive({
  selector: '[lightbox]',
})
export class LightboxDirective {
  image: ImageExtended | undefined;
  @Input() fullImage?: Image;
  @Input() properties: Properties = {};
  @Input() loop?: boolean;
  @Input() backgroundOpacity?: number;
  @Input() counter?: boolean;
  @Input() imageMaxHeight?: string;
  @Input() imageMaxWidth?: string;
  @Input() animationDuration?: number;
  @Input() animationMode?:
    | 'default'
    | 'zoom'
    | 'zoom-blur'
    | 'zoom-preloader'
    | 'opacity'
    | 'none';
  @Input() animationTimingFunction?: string;
  @Input() closeButtonText?: string;
  @Input() counterSeparator?: string;
  @Input() disable?: boolean;
  @Input() simpleMode?: boolean;
  @Input() backgroundColor?: 'black' | 'white';
  @Input() hideThumbnail?: boolean;
  @Input() gestureEnable?: boolean;

  @Output() events: EventEmitter<any> = new EventEmitter<any>();

  @HostBinding('class.lightbox-single') hostLightboxGroup = true;
  @HostBinding('class.lightbox-simple-mode')
  get hostSimpleMode() {
    return this.simpleMode;
  }

  get isGroupImage(): boolean {
    return this.elementRef.nativeElement.closest('.lightbox-group');
  }

  constructor(
    private lightbox: CrystalLightbox,
    private eventService: EventService,
    private elementRef: ElementRef
  ) {
    this.eventService.emitter.pipe(takeUntilDestroyed()).subscribe((event) => {
      this.handleGlobalEvents(event);
    });
  }

  @HostListener('click', ['$event'])
  onClick() {
    if (this.disable) {
      return;
    }

    if (this.isGroupImage) {
      this.eventService.emitChangeEvent({
        type: 'thumbnail:click',
        elementRef: this.elementRef,
        properties: this.getNormalizedProperties(),
      });
    } else {
      this.image = this.getImage();

      this.lightbox.open({
        images: [this.image],
        properties: this.getNormalizedProperties(),
        index: 0,
      });
    }
  }

  handleGlobalEvents(event: LightboxEvent) {
    this.events.emit(event);
  }

  getImage() {
    const nativeElement = this.elementRef.nativeElement;
    const image: ImageExtended = {
      fullImage: this.fullImage,
      path: null,
      nativeElement,
      thumbnailImage: {
        path: nativeElement.src,
        height: nativeElement.naturalHeight,
        width: nativeElement.naturalWidth,
      },
    };
    return image;
  }

  getNormalizedProperties(): Properties {
    return {
      ...this.properties,
      loop: this.loop,
      backgroundOpacity: this.backgroundOpacity,
      counter: this.counter,
      imageMaxHeight: this.imageMaxHeight,
      imageMaxWidth: this.imageMaxWidth,
      animationDuration: this.animationDuration,
      animationMode: this.animationMode,
      animationTimingFunction: this.animationTimingFunction,
      closeButtonText: this.closeButtonText,
      counterSeparator: this.counterSeparator,
      disable: this.disable,
      simpleMode: this.simpleMode,
      backgroundColor: this.backgroundColor,
      hideThumbnail: this.hideThumbnail,
      gestureEnable: this.gestureEnable,
    };
  }
}
