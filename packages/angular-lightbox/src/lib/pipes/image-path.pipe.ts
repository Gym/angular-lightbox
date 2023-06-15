import { Pipe, PipeTransform } from '@angular/core';
import { ImageExtended } from '../interfaces';

@Pipe({ name: 'imagePath' })
export class ImagePathPipe implements PipeTransform {
  transform(images: ImageExtended[] | undefined, index: number): string | null {
    const image = images?.[index];
    let path = null;

    if (!image) {
      return null;
    }

    if (image.fullImage && image.fullImage.path) {
      path = image.fullImage.path;
    } else if (image.thumbnailImage && image.thumbnailImage.path) {
      path = image.thumbnailImage.path;
    } else if (image.path) {
      path = image.path;
    }

    return path;
  }
}
