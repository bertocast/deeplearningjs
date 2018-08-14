import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { UiModule } from './ui/ui.module';
import { CervantesComponent } from './cervantes/cervantes.component';
import { HomeComponent } from './home/home.component';
import {ScrollToModule} from '@nicky-lenaers/ngx-scroll-to';
import { RockPaperScissorsComponent } from './rock-paper-scissors/rock-paper-scissors.component';

@NgModule({
  declarations: [
    AppComponent,
    CervantesComponent,
    HomeComponent,
    RockPaperScissorsComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    UiModule,
    ScrollToModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
