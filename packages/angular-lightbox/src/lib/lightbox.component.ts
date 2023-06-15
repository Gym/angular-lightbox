import {
  Component,
  EventEmitter,
  OnInit,
  HostBinding,
  HostListener,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
  AfterViewInit,
} from '@angular/core';
import { EventService } from './event.service';
import { LightboxCommonComponent } from './lightbox-common.component';

@Component({
  selector: 'crystal-lightbox',
  templateUrl: './lightbox.component.html',
  styleUrls: ['./css/lightbox.component.scss'],
})
export class LightboxComponent
  extends LightboxCommonComponent
  implements OnInit, AfterViewInit
{
  isZoomIn = false;
  minTimeout = 30;
  preloaderTimeout = 100;
  events = new EventEmitter();

  @HostBinding('class.lightbox-shown') hostShown = false;
  @HostBinding('class.lightbox-hide-controls') hideControls = false;
  @HostBinding('class.lightbox-animation') hostAnimation?: boolean;
  @HostBinding('class.lightbox-simple-mode')
  get simpleMode() {
    return this.properties.simpleMode;
  }

  @HostBinding('class.lightbox-light') get hostLightTheme() {
    return this.properties.backgroundColor === 'white';
  }

  @HostBinding('style.backgroundColor')
  override hostStyleBackgroundColor?: string;

  @ViewChild('prevImageElem', { static: true }) prevImageElem?: ElementRef;
  @ViewChild('lightboxContainer', { static: true })
  lightboxContainerElem?: ElementRef;

  get isHiddenPrevArrow(): boolean {
    return (this.isFirstImage && !this.properties.loop) || this.isZoomIn;
  }
  get isHiddenNextArrow(): boolean {
    return (this.isLastImage && !this.properties.loop) || this.isZoomIn;
  }

  get isPreloader(): boolean {
    return (
      this.animationMode === 'zoom-preloader' &&
      this.showState != 'animation-end' &&
      this.currImageLoadingState === 'loading'
    );
  }

  @HostListener('window:scroll') scrolling() {
    if (
      this.showState === 'initial-thumbnail-image' ||
      this.showState === 'initial-virtual-image' ||
      this.closingState === 'animation'
    ) {
      console.log('updateThumbnailPosition');
      this.updateThumbnailPosition();
    }
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: any) {
    switch (event.key) {
      case 'ArrowLeft':
        this.prev();
        break;
      case 'ArrowRight':
        this.next();
        break;
      case 'Escape':
        this.closeLightbox();
        break;
    }
  }

  @HostListener('mouseenter', ['$event'])
  onMouseEnter() {
    this.hideControls = false;
  }

  @HostListener('transitionend', ['$event'])
  transitionEnd(event: TransitionEvent) {
    if (event.propertyName === 'transform' && this.hostAnimation) {
      this.hostAnimation = false;
    }
  }

  constructor(
    private ref: ChangeDetectorRef,
    public override eventService: EventService
  ) {
    super(eventService);
  }

  ngOnInit() {
    this.currentImageIndex = this.properties.index ?? 0;
    this.initialLightbox();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.currImageLoadingState === 'not-loaded') {
        this.currImageLoadingState = 'loading';
      }
    }, this.preloaderTimeout);

    // Mode: default
    if (this.animationMode === 'default') {
      setTimeout(() => {
        this.showLightboxAnimation();
      }, this.minTimeout);
    }
  }

  onImageLoaded() {
    // When opening lightbox
    if (
      this.animationMode === 'zoom-preloader' &&
      this.showState === 'initial-thumbnail-image'
    ) {
      this.initialLightboxVirtualImage();
      setTimeout(() => {
        this.currImageLoadingState = 'uploaded';
        this.showLightboxAnimation();
        if (this.properties.hideThumbnail) {
          this.hideThumbnailImage();
        }
      }, this.minTimeout);
    }

    // When opening next / previous image
    if (this.showState === 'animation-end') {
      this.currImageLoadingState = 'uploaded';
      if (this.properties.hideThumbnail) {
        this.hideThumbnailImage();
      }
    }

    this.ref.detectChanges();
  }

  onImageError() {
    this.currImageLoadingState = 'error';
    this.initialLightboxDefault();

    setTimeout(() => {
      this.showLightboxAnimation();
    }, this.minTimeout);
  }

  onContainerClick(event: MouseEvent) {
    if (
      event.target === this.lightboxContainerElem?.nativeElement ||
      this.simpleMode
    ) {
      this.closeLightbox();
    }
  }

  initialLightbox() {
    this.setMaxDimensions();
    this.setAnimationDuration();

    switch (this.animationMode) {
      case 'zoom-preloader':
        this.initialLightboxThumbnailImage();
        break;
      case 'default':
        this.initialLightboxDefault();
        break;
    }
  }

  initialLightboxDefault() {
    this.showState = 'initial-default';
    this.containerStyles = {
      transform: 'translate3d(0, 0, 0)',
      height: '100%',
      width: '100%',
      opacity: '0',
    };
    // next step: AfterViewInit
  }

  initialLightboxVirtualImage() {
    this.setShowState('initial-virtual-image');
    this.containerStyles = {
      transform: this.containerInitialPosition,
      height: this.virtualImageDimension.height + 'px',
      width: this.virtualImageDimension.width + 'px',
    };
    // next step: onImageLoaded() -> showLightboxAnimation()
  }

  initialLightboxThumbnailImage() {
    this.setShowState('initial-thumbnail-image');
    this.containerStyles = {
      transform: this.containerInitialPosition,
      height: this.thumbnailImagePosition.height + 'px',
      width: this.thumbnailImagePosition.width + 'px',
    };
    // next step: onImageLoaded()
  }

  showLightboxAnimation() {
    this.hostAnimation = true;
    this.setShowState('animation');
    this.hostShown = true;
    this.setBackgroundColor();
    this.setAnimationDuration();

    // Mode: zoom preloader
    if (
      this.animationMode === 'zoom-preloader' &&
      this.currImageLoadingState !== 'error'
    ) {
      this.containerStyles.transform = this.containerFullscreenPosition;
    }

    // Mode: default
    if (this.animationMode === 'default') {
      this.containerStyles.opacity = '1';
    }
    // next step: handleLightboxTransitionEnd
  }

  showLightboxAnimationEnd() {
    this.setShowState('animation-end');
    this.containerStyles = {
      transform: 'translate3d(0, 0, 0)',
      height: '100%',
      width: '100%',
    };
  }

  closeLightbox() {
    this.setClosingState('initial');
    this.hostShown = false;
    this.closeLightboxInitial();
  }

  closeLightboxInitial() {
    this.setClosingState('initial-styles');

    // Mode: zoom preloader
    if (this.animationMode === 'zoom-preloader') {
      this.containerStyles = {
        transform: this.containerFullscreenPosition,
        height: this.virtualImageDimension.height + 'px',
        width: this.virtualImageDimension.width + 'px',
      };
    }

    // Mode: default
    if (this.animationMode === 'default') {
      this.containerStyles.opacity = '1';
    }

    setTimeout(() => {
      this.closeLightboxAnimation();
    }, this.minTimeout);
  }

  closeLightboxAnimation() {
    this.setClosingState('animation');

    // Mode: zoom preloader
    if (this.animationMode === 'zoom-preloader') {
      this.hostAnimation = true;
      this.containerStyles = {
        transform: this.containerInitialPosition,
        height: this.getContainerHeight(),
        width: this.getContainerWidth(),
      };

      this.hostStyleBackgroundColor = '';
    }

    // Mode: default
    if (this.animationMode === 'default') {
      this.hostAnimation = true;
      this.containerStyles.opacity = '0';
      this.hostStyleBackgroundColor = '';
    }

    this.setAnimationDuration();
    // next step: handleLightboxTransitionEnd

    if (this.animationDuration === 0) {
      // in the future, change to a type conversion getter
      this.closeLightboxAnimationEnd();
    }
  }

  closeLightboxAnimationEnd() {
    this.setClosingState('animation-end');
    this.events.emit({ type: 'close' });

    // Mode: zoom preloader
    if (this.animationMode === 'zoom-preloader') {
      this.showThumbnailImage();
    }
  }

  /*
   * Transition End
   */

  handleLightboxTransitionEnd() {
    if (this.showState === 'animation') {
      this.showLightboxAnimationEnd();
    }

    // Last close step
    if (this.closingState === 'animation') {
      this.closeLightboxAnimationEnd();
    }
  }

  next() {
    if (this.animationMode === 'zoom-preloader') {
      this.showThumbnailImage();
    }

    if (this.isLastImage) {
      if (this.properties.loop) {
        this.currentImageIndex = 0;
      } else {
        return;
      }
    } else {
      this.currentImageIndex++;
      this.currImageLoadingState = 'loading';
    }

    setTimeout(() => {
      if (this.currImageLoadingState !== 'uploaded') {
        this.currImageLoadingState = 'loading';
      }
    }, this.preloaderTimeout);
  }

  prev() {
    if (this.animationMode === 'zoom-preloader') {
      this.showThumbnailImage();
    }

    if (this.isFirstImage) {
      if (this.properties.loop) {
        this.currentImageIndex = this.latestImageIndex;
      } else {
        return;
      }
    } else {
      this.currentImageIndex--;
      this.currImageLoadingState = 'loading';
    }

    setTimeout(() => {
      if (this.currImageLoadingState !== 'uploaded') {
        this.currImageLoadingState = 'loading';
      }
    }, this.preloaderTimeout);
  }

  setMaxDimensions() {
    if (!this.lightboxImage) {
      throw new Error('lightboxImage is not found');
    }
    this.lightboxImage.nativeElement.style.maxHeight =
      'calc(' + this.properties.imageMaxHeight + ')';
    this.lightboxImage.nativeElement.style.maxWidth =
      this.properties.imageMaxWidth;
  }

  getContainerWidth(): string {
    return this.thumbnailImagePosition.width / this.containerScale + 'px';
  }
}
