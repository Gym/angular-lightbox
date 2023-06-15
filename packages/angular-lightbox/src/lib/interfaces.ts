export interface LightboxData {
  images?: ImageExtended[]; // TODO
  image?: ImageExtended;
  properties: Properties;
  index?: number;
}

export interface Image {
  path: string;
  width?: number;
  height?: number;
}

export type ImageExtended = Omit<Image, 'path'> & {
  fullImage?: Image;
  thumbnailImage?: Image;
  nativeElement?: any;
  path: string | null;
};

export interface Properties {
  loop?: boolean;
  index?: number;
  counter?: boolean;
  imageMaxHeight?: string;
  imageMaxWidth?: string;
  animationDuration?: number;
  animationMode?:
    | 'default'
    | 'zoom'
    | 'zoom-blur'
    | 'zoom-preloader'
    | 'opacity'
    | 'none';
  animationTimingFunction?: string;
  closeButtonText?: string;
  counterSeparator?: string;
  disable?: boolean;
  simpleMode?: boolean;
  backgroundColor?: 'black' | 'white';
  backgroundOpacity?: number;
  hideThumbnail?: boolean;
  imagePathError?: string;
  gestureEnable?: boolean;
}
