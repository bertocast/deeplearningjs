import {Component, OnInit, ViewChild, ElementRef} from '@angular/core';
import * as tf from '@tensorflow/tfjs';
import * as knnClassifier from '@tensorflow-models/knn-classifier';
import * as mobilenetModule from '@tensorflow-models/mobilenet';

import CountDownTimer from './countdown';

// Number of classes to classify
const NUM_CLASSES = 3;
const IMAGE_SIZE = 227;

// K value for KNN
const TOPK = 3;

const MOVES = [
  'Rock',
  'Paper',
  'Scissors',
];

const trainButtonIds = [
  'train-rock-button',
  'train-paper-button',
  'train-scissors-button',
];

const trainSpanIds = [
  'train-rock-span',
  'train-paper-span',
  'train-scissors-span',
];

const winnerMatrix = [
  [0, 1, -1],
  [-1, 0, 1],
  [1, -1, 0],
];

const gestureYouIds = [
  'rock-you',
  'paper-you',
  'scissors-you',
];

const gestureCpuIds = [
  'rock-cpu',
  'paper-cpu',
  'scissors-cpu',
];


@Component({
  selector: 'app-rock-paper-scissors',
  templateUrl: './rock-paper-scissors.component.html',
  styleUrls: ['./rock-paper-scissors.component.css']
})
export class RockPaperScissorsComponent implements OnInit {
  @ViewChild('video')
  public videoElement: ElementRef;
  private training: number;
  private infoTexts: HTMLElement[];
  private videoPlaying: boolean;
  private currentMove: number;
  private firstExampleTrained: boolean;
  private gaming: boolean;
  private knn: knnClassifier.KNNClassifier;
  private startButton: HTMLInputElement;
  private countDownTimer: CountDownTimer;
  private gameStatus: any;
  private gestureCpuImages: any;
  private hiddenCanvas: any;
  private youImg: any;
  private gestureYouImages: HTMLElement[];
  private timer: number;
  private mobilenet: any;
  private video: HTMLVideoElement;
  private webCam: any;

  constructor() {

  }

  async ngOnInit() {
    this.training = -1; // -1 when no class is being trained
    this.infoTexts = [];
    this.videoPlaying = false;
    this.currentMove = -1;
    this.firstExampleTrained = false;
    this.gaming = false;

    this.knn = knnClassifier.create();
    this.mobilenet = await mobilenetModule.load();


    // Create video element that will contain the webcam image


    for (let i = 0; i < NUM_CLASSES; i++) {
      const button = document.getElementById(trainButtonIds[i]);
      button.addEventListener('mousedown', () => {
        this.training = i;
        button.innerText = `Training ${MOVES[i]}...`;
      });
      button.addEventListener('mouseup', () => {
        this.training = -1;
        button.innerText = `Train ${MOVES[i]}`;
      });
      this.infoTexts.push(document.getElementById(trainSpanIds[i]));
    }

    // Create button for starting a game
    this.startButton = <HTMLInputElement> document.getElementById('start-game-button');
    this.startButton.onclick = () => {
      this.startGame();
    };

    this.gameStatus = document.getElementById('game-status');

    this.gestureYouImages = gestureYouIds.map((val) => {
      return document.getElementById(val);
    });

    this.gestureCpuImages = gestureCpuIds.map((val) => {
      return document.getElementById(val);
    });

    this.youImg = document.getElementById('you');
    this.hiddenCanvas = document.createElement('canvas');
    this.hiddenCanvas.width = IMAGE_SIZE;
    this.hiddenCanvas.height = IMAGE_SIZE;

    function isAndroid() {
      return /Android/i.test(navigator.userAgent);
    }

    function isiOS() {
      return /iPhone|iPad|iPod/i.test(navigator.userAgent);
    }

    function isMobile() {
      return isAndroid() || isiOS();
    }

    const mobile = isMobile();
    this.video = this.videoElement.nativeElement;
    navigator.mediaDevices.getUserMedia({
      'audio': false,
      'video': {
        facingMode: 'user',
        width: mobile ? undefined : IMAGE_SIZE,
        height: mobile ? undefined : IMAGE_SIZE,
      },
    }).then(stream => {
      this.video.srcObject = stream;
      this.video.height = IMAGE_SIZE;
      this.video.width = IMAGE_SIZE;
      this.video.addEventListener('playing', () => this.videoPlaying = true);
      this.video.addEventListener('paused', () => this.videoPlaying = false);
    });
    this.start();
  }


  /**
   * Start a game of rock-paper-scissors
   */
  private startGame() {
    if (this.startButton.disabled) {
      return;
    }
    this.gaming = true;
    this.startButton.disabled = true;
    this.countDownTimer = new CountDownTimer(5000, 20);
    this.countDownTimer.addTickFn((msLeft) => {
      this.gameStatus.innerText = (msLeft / 1000).toFixed(1) +
        ' seconds left. Prepare your move!';
      const computerMove = Math.floor(Math.random() * 3);
      for (let i = 0; i < 3; i++) {
        this.gestureCpuImages[i].hidden = (i !== computerMove);
      }
      if (msLeft === 0) {
        this.resolveGame();
      }
    });
    this.countDownTimer.start();
  }

  private resolveGame() {
    this.gaming = false;
    const computerMove = Math.floor(Math.random() * 3);
    const result = winnerMatrix[computerMove][this.currentMove];
    switch (result) {
      case -1:
        this.gameStatus.innerText = 'You lose. Try again!';
        break;
      case 0:
        this.gameStatus.innerText = `It's a draw! Try again.`;
        break;
      case 1:
        this.gameStatus.innerText = 'You win. Yay!';
    }
    for (let i = 0; i < 3; i++) {
      this.gestureCpuImages[i].hidden = (i !== computerMove);
    }
    this.startButton.disabled = false;
    this.hiddenCanvas.getContext('2d').drawImage(
      this.video, 0, 0, IMAGE_SIZE, IMAGE_SIZE);
    this.youImg.src = this.hiddenCanvas.toDataURL();
    this.youImg.onload = () => {
      for (let i = 0; i < 3; i++) {
        this.gestureYouImages[i].hidden = true;
      }
      this.youImg.hidden = false;
    };
  }

  /**
   * Start the main  loop
   */
  start() {
    this.video.play();
    // this.timer = requestAnimationFrame(this.animate.bind(this));
    this.timer = requestAnimationFrame(this.animate.bind(this));
  }

  animate() {
    // Get image data from video element
    let image;
    try {
      image = tf.fromPixels(this.video);
    } catch (e) {
      requestAnimationFrame(this.animate.bind(this));
      return;
    }
    let logits;
    const infer = () => this.mobilenet.infer(image, 'conv_preds');

    // Train class if one of the buttons is held down
    if (this.training !== -1) {
      logits = infer();
      // Add current image to classifier
      this.knn.addExample(logits, this.training);
    }

    // If any examples have been added, run predict
    const numClasses = this.knn.getNumClasses();
    if (numClasses > 0) {
      logits = infer();
      this.knn.predictClass(logits, TOPK)
        .then((res) => {
          this.currentMove = res.classIndex;
          for (let i = 0; i < NUM_CLASSES; i++) {
            // Make the predicted class bold
            if (res.classIndex === i) {
              this.infoTexts[i].style.fontWeight = 'bold';
            } else {
              this.infoTexts[i].style.fontWeight = 'normal';
            }

            const exampleCount = this.knn.getClassExampleCount();
            // Update img if in game
            if (this.gaming) {
              this.youImg.hidden = true;
              this.gestureYouImages[i].hidden = res.classIndex !== i;
            }

            // Update info text
            if (exampleCount[i] > 0) {
              this.infoTexts[i].innerText =
                ` ${exampleCount[i]} examples - ${res.confidences[i] * 100}%`;
              if (exampleCount[i] > 10) {
                const button = document.getElementById(trainButtonIds[i]);
                button.classList.remove('btn-outline-danger');
                button.classList.add('btn-outline-success');
              }
            }
          }
          if (!this.firstExampleTrained) {
            this.firstExampleTrained = true;
            this.startButton.disabled = false;
          }
        });
    }
    image.dispose();
    if (logits != null) {
      logits.dispose();
    }
    this.timer = requestAnimationFrame(this.animate.bind(this));
  }
}
