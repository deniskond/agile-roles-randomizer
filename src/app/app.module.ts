import 'hammerjs';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { AppMaterialModule } from './app.material.module';
import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
import { CdkTableModule } from '@angular/cdk/table';
import { CommonModule } from '@angular/common';
import { RandomizerComponent } from './components/randomizer/randomizer.component';
import { SettingsComponent } from './components/settings/settings.component';
import { RolesTableComponent } from './components/roles-table/roles-table.component';

@NgModule({
    imports: [
        BrowserModule,
        CommonModule,
        FormsModule,
        AppMaterialModule,
        CdkTableModule,
        BrowserAnimationsModule,
        RouterModule.forRoot([
            {
                path: '',
                component: RandomizerComponent,
            },
            {
                path: 'settings',
                component: SettingsComponent,
            },
        ]),
    ],
    declarations: [AppComponent, RandomizerComponent, SettingsComponent, RolesTableComponent],
    bootstrap: [AppComponent],
})
export class AppModule {}
