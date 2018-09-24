import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {CervantesComponent} from './cervantes/cervantes.component';
import {HomeComponent} from './home/home.component';
import {RockPaperScissorsComponent} from './rock-paper-scissors/rock-paper-scissors.component';
import {StyleTransferComponent} from './style-transfer/style-transfer.component';

const routes: Routes = [
  {path: 'home', component: HomeComponent},
  {path: '', redirectTo: '/home', pathMatch: 'full'},
  {path: 'cervantes', component: CervantesComponent},
  {path: 'rps', component: RockPaperScissorsComponent},
  {path: 'style-transfer', component: StyleTransferComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
