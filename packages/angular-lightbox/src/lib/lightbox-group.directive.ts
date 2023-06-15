import {
  Directive,
  HostBinding,
  ContentChildren,
  QueryList,
} from '@angular/core';
import { EventService, LightboxEvent } from './event.service';
import { LightboxDirective } from './lightbox.directive';
import { CrystalLightbox } from './lightbox.service';
import { Properties, ImageExtended } from './interfaces';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Directive({
  selector: '[lightbox-group]',
})
export class LightboxGroupDirective {
  thumbnailImageElement: Element | undefined;
  thumbnailLightboxDirective?: LightboxDirective;
  thumbnailImageIndex?: number;
  thumbnailImages: Element[] = [];
  images: ImageExtended[] = [];
  properties: Properties = {};

  get lightboxDirectiveList() {
    if (this._lightboxDirectiveList) {
      return this._lightboxDirectiveList.toArray();
    } else {
      return [];
    }
  }

  @HostBinding('class.lightbox-group') hostLightboxGroup = true;
  @ContentChildren(LightboxDirective, { descendants: true })
  _lightboxDirectiveList!: QueryList<LightboxDirective>;
  constructor(
    private eventService: EventService,
    private lightbox: CrystalLightbox
  ) {
    this.eventService.emitter.pipe(takeUntilDestroyed()).subscribe((event) => {
      this.handleGlobalEvents(event);
    });
  }

  handleGlobalEvents(event: LightboxEvent) {
    if (event.type === 'thumbnail:click') {
      // TODO: fix types here
      this.thumbnailImageElement = (event as any).elementRef.nativeElement;
      this.thumbnailImages = this.getThumbnailImages();
      const thumbnailImageIndex = this.getThumbnailImageIndex(
        this.thumbnailImageElement
      );

      if (thumbnailImageIndex == undefined) {
        return;
      }

      this.thumbnailImageIndex = thumbnailImageIndex;

      this.thumbnailLightboxDirective = this.getThumbnailLightboxDirective(
        this.thumbnailImageIndex
      );
      this.images = this.getImages();
      // TODO: fix types here
      this.properties = (event as any).properties;
      this.properties.index = this.thumbnailImageIndex;

      this.lightbox.open({
        images: this.images,
        //index: this.thumbnailImageIndex,
        properties: this.properties,
      });
    }
  }

  getThumbnailImageIndex(element: Element | undefined): number | undefined {
    const images = this.thumbnailImages;
    for (let i = 0; i < images.length; i++) {
      if (element === images[i]) {
        return i;
      }
    }
    return undefined;
  }

  getThumbnailLightboxDirective(index: number) {
    return this.lightboxDirectiveList[index];
  }

  getThumbnailImages() {
    const thumbnailImages: Element[] = [];
    this.lightboxDirectiveList.forEach((el) => {
      thumbnailImages.push(el['elementRef'].nativeElement);
    });
    return thumbnailImages;
  }

  getImages() {
    const images: ImageExtended[] = [];
    this.lightboxDirectiveList.forEach((el) => {
      const nativeElement = el['elementRef'].nativeElement;

      const image: ImageExtended = {
        fullImage: el.fullImage,
        path: null,
        nativeElement,
        thumbnailImage: {
          path: nativeElement.src,
          height: nativeElement.naturalHeight,
          width: nativeElement.naturalWidth,
        },
      };
      images.push(image);
    });

    return images;
  }
}
