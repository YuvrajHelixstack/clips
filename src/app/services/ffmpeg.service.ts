import { Injectable } from '@angular/core';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

@Injectable({
  providedIn: 'root',
})
export class FfmpegService {
  isRunning = false;
  isReady = false;
  private ffmpeg;

  constructor() {
    this.ffmpeg = createFFmpeg({ log: true });
  }

  async init() {
    if (this.isReady) {
      return;
    }
    // loads webassembly file
    await this.ffmpeg.load();
    this.isReady = true;
  }

  async getScreenShots(file: File) {
    this.isRunning = true;
    // converts file into binary data
    const data = await fetchFile(file);

    // store in the package independent memory to generate screenshot
    this.ffmpeg.FS('writeFile', file.name, data);

    const seconds = [2, 5, 8]; // screenshot taken and listed seconds
    const commands: string[] = [];

    seconds.forEach((second, index) => {
      commands.push(
        // input
        '-i',
        file.name,
        // output options
        '-ss',
        `00:00:0${second}`,
        // `${second < 10 ? `0${second}` : second}`,
        '-frames:v',
        '1',
        '-filter:v',
        'scale=510:-1',
        // output
        `output_0${index + 1}.png`
      );
    });

    await this.ffmpeg.run(...commands);

    const screenshots: string[] = [];

    seconds.forEach((second, index) => {
      // read from the package independant memory with ffmpeg package
      const screenshotFile = this.ffmpeg.FS(
        'readFile',
        `output_0${index + 1}.png`
      );

      // creating blob
      const screenshotBlob = new Blob([screenshotFile.buffer], {
        type: 'image/png',
      });

      // converts blob into url to render image
      // and that image URL is pointing to users memory
      const screenshotURL = URL.createObjectURL(screenshotBlob);

      screenshots.push(screenshotURL);
    });

    this.isRunning = false;
    return screenshots;
  }

  async blobFromURL(url: string) {
    const response = await fetch(url);
    const blob = await response.blob();

    return blob;
  }
}
