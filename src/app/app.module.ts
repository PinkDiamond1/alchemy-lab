import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { NgxUIModule } from '@swimlane/ngx-ui';
import { NgxDnDModule } from '@swimlane/ngx-dnd';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { NgxChartsDagModule } from '@swimlane/ngx-charts-dag';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    NgxUIModule,
    NgxDnDModule,
    BrowserAnimationsModule,
    NgxChartsModule,
    NgxChartsDagModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
