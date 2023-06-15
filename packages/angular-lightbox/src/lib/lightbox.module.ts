import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LightboxComponent } from './lightbox.component';
import { CrystalLightbox } from './lightbox.service';
import { EventService } from './event.service';
import { LightboxDirective } from './lightbox.directive';
import { LightboxGroupDirective } from './lightbox-group.directive';
import { ImagePathPipe } from './pipes/image-path.pipe';

@NgModule({
  declarations: [
    LightboxComponent,
    LightboxDirective,
    LightboxGroupDirective,
    ImagePathPipe,
  ],
  imports: [CommonModule],
  exports: [LightboxDirective, LightboxGroupDirective],
  providers: [CrystalLightbox, EventService],
})
export class CrystalLightboxModule {}
