import {Component, OnInit} from '@angular/core';
import * as tf from '@tensorflow/tfjs';
import {Ng2ImgToolsService} from 'ng2-img-tools';

@Component({
  selector: 'app-style-transfer',
  templateUrl: './style-transfer.component.html',
  styleUrls: ['./style-transfer.component.css']
})
export class StyleTransferComponent implements OnInit {
  private cImg: any;
  context: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;

  constructor(private ng2ImgTools: Ng2ImgToolsService) {
  }

  async ngOnInit() {
    this.canvas = <HTMLCanvasElement> document.getElementById('content');
    this.context = this.canvas.getContext('2d');
    this.context.clearRect(0, 0, 256, 256);
    this.cImg = await this.createImg('../../assets/img/rose.jpg');
    this.drawImage();
  }


  private drawImage() {
    this.context.drawImage(this.cImg, 0, 0, this.cImg.width, this.cImg.width);
  }

  async createModel(path) {
    return await tf.loadModel(path);
  }

  async loadModel(path = 'style1/model.json') {
    const lbl = document.getElementById('status');
    lbl.innerText = 'Model Loading ...';
    const canvas = document.getElementById('combined');
    const cT = this.preProcess(this.cImg);
    const model = await this.createModel(path);
    const z = model.predict(cT);
    this.toPixels(this.deProcess(z), canvas);
    lbl.innerText = 'Model Created ...';
  }


  preProcess(imgData) {
    return tf.tidy(() => {
      const tensor = tf.fromPixels(imgData).toFloat();
      const offset = tf.scalar(127.5);
      // Normalize the image
      const normalized = tensor.sub(offset).div(offset);

      // We add a dimension to get a batch shape
      return normalized.expandDims(0);
    });
  }

  deProcess(x) {
    return tf.tidy(() => {
      const offset = tf.scalar(127.5);
      // Normalize the image
      const deNormalized = x.mul(offset).add(offset).toInt();
      return deNormalized.squeeze();
    });
  }

  toPixels(tensor, canvas) {
    const ctx = canvas.getContext('2d');
    const [height, width] = tensor.shape;
    const buffer = new Uint8ClampedArray(width * height * 4);
    const imageData = new ImageData(width, height);
    const data = tensor.dataSync();
    let cnt = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pos = (y * width + x) * 4; // position in buffer based on x and y
        buffer[pos] = data[cnt];           // some R value [0, 255]
        buffer[pos + 1] = data[cnt + 1];           // some G value
        buffer[pos + 2] = data[cnt + 2];           // some B value
        buffer[pos + 3] = 255;           // set alpha channel
        cnt += 3;
      }
    }
    imageData.data.set(buffer);
    ctx.putImageData(imageData, 0, 0);
  }


  async createImg(path) {
    return await new Promise((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.crossOrigin = 'anonymous';
      i.src = path;
      i.width = 256;
      i.height = 256;
    });
  }

  onFileChanged(e) {
    const canvas = this.canvas;
    const context = this.context;
    const reader = new FileReader();
    const self = this;
    reader.onload = function (event: any) {
      const img = new Image();
      img.onload = function () {
        canvas.width = 256;
        canvas.height = 256;
        context.drawImage(img,
          0,
          0,
          img.width,
          img.height,
          0,
          0,
          canvas.width,
          canvas.height
        );
        img.src = canvas.toDataURL();
      };
      img.src = event.target.result;
      self.cImg = img;
    };
    reader.readAsDataURL(e.target.files[0]);
  }
}
