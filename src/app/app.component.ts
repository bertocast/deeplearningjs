import {Component, ViewChild, OnInit} from '@angular/core';
import * as dicts from './cervantes/cervantesConfig';

import * as tf from '@tensorflow/tfjs';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  ngOnInit(): void {
  }
}

