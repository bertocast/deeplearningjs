import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {CervantesComponent} from './cervantes/cervantes.component';
import {HomeComponent} from './home/home.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  {path: 'home', component: HomeComponent},
  {path: 'cervantes', component: CervantesComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
