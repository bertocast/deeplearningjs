import {Component, OnInit} from '@angular/core';
import * as dicts from './cervantesConfig';
import * as tf from '@tensorflow/tfjs';

const charIndexs = dicts.charIndexs;
const indexChars = dicts.indexChars;

const INPUT_LENGTH = 40;
const CHARS_TO_GENERATE = 3000;
const DIVERSITY = 0.7;

@Component({
  selector: 'app-cervantes',
  templateUrl: './cervantes.component.html',
  styleUrls: ['./cervantes.component.css']
})


export class CervantesComponent implements OnInit {

  cervantesModel: tf.Model;
  generatedSentence: HTMLElement | null;
  generateButton: HTMLElement | null;
  checked: boolean;

  ngOnInit() {
    this.generatedSentence = document.getElementById('generated-text');
    this.generatedSentence.innerText = '';
    this.generateButton = document.getElementById('generate-button');
    console.log('Loading model...');
    tf.loadModel('assets/char_rnn/model.json').then((model) => {
      this.cervantesModel = model;
      console.log('Model load.');
      this.enableGeneration();
    });
  }

  enableGeneration() {
    this.generateButton.innerText = 'Lets write a new chapter!';
    this.checked = false;
  }


  async cervantesTalk(seed) {

    this.generatedSentence = seed;
    this.checked = true;
    this.generateButton.innerText = 'Pay attention to Cervantes words';

    for (let i = 0; i < CHARS_TO_GENERATE; i++) {
      const indexTensor = tf.tidy(() => {
        const input = this.convert(seed);
        const prediction = this.cervantesModel.predict(input);
        return this.sample(prediction);
      });
      const index_pred = await indexTensor.data();
      indexTensor.dispose();
      seed += indexChars[index_pred];
      this.generatedSentence.innerText = seed;
      await tf.nextFrame();
    }
    this.enableGeneration();
  }

  /**
   * Randomly samples next character weighted by model prediction.
   */
  sample(prediction) {
    return tf.tidy(() => {
      prediction = prediction.log();
      const diversity = tf.scalar(DIVERSITY);
      prediction = prediction.div(diversity);
      prediction = prediction.exp();
      prediction = prediction.div(prediction.sum());
      prediction = prediction.mul(tf.randomUniform(prediction.shape));
      return prediction.argMax(1);
    });
  }

  convert(sentence) {
    sentence = sentence.toLowerCase();
    sentence = sentence.split('').filter(x => x in charIndexs).join('');
    if (sentence.length < INPUT_LENGTH) {
      sentence = sentence.padStart(INPUT_LENGTH);
    } else if (sentence.length > INPUT_LENGTH) {
      sentence = sentence.substring(sentence.length - INPUT_LENGTH);
    }
    const buffer = tf.buffer([1, INPUT_LENGTH, Object.keys(indexChars).length]);
    for (let i = 0; i < INPUT_LENGTH; i++) {
      const char = sentence.charAt(i);
      buffer.set(1, 0, i, charIndexs[char]);
    }
    const input = buffer.toTensor();
    return input;
  }


}
