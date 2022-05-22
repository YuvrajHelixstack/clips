import { Component, OnDestroy } from '@angular/core';
import {
  AngularFireStorage,
  AngularFireUploadTask,
} from '@angular/fire/compat/storage';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { v4 as uuid } from 'uuid';
import { last, switchMap } from 'rxjs/operators';
import firebase from 'firebase/compat/app';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ClipService } from './../../services/clip.service';
import { Router } from '@angular/router';
import { FfmpegService } from './../../services/ffmpeg.service';
import { combineLatest, forkJoin } from 'rxjs';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css'],
})
export class UploadComponent implements OnDestroy {
  isDragover = false;
  file: File | null = null;
  nextStep = false;
  showAlert = false;
  alertMsg = 'Please wait! Your clip is being uploaded';
  alertColor = 'blue';
  inSubmission = false;
  progressPerc = 0;
  showProgress = false;
  user: firebase.User | null = null;
  task?: AngularFireUploadTask;
  screenshots: string[] = [];
  selectedScreenShot: string = '';
  screenshotTask?: AngularFireUploadTask;

  title = new FormControl('', [Validators.required, Validators.minLength(3)]);

  uploadForm = new FormGroup({
    title: this.title,
  });

  constructor(
    private storage: AngularFireStorage,
    private auth: AngularFireAuth,
    private clipsService: ClipService,
    private router: Router,
    public ffmpegService: FfmpegService
  ) {
    auth.user.subscribe((user) => (this.user = user));
    ffmpegService.init();
  }

  // to cancel request when we navigate away during file upload
  ngOnDestroy(): void {
    this.task?.cancel();
  }

  async storeFile($event: Event) {
    // console.log($event);     to see to select file we use drag and drop or input field
    if (this.ffmpegService.isRunning) {
      return;
    }
    this.isDragover = false;

    this.file = ($event as DragEvent).dataTransfer
      ? ($event as DragEvent).dataTransfer?.files.item(0) ?? null
      : ($event.target as HTMLInputElement).files?.item(0) ?? null;

    if (!this.file || this.file.type !== 'video/mp4') {
      return;
    }

    this.screenshots = await this.ffmpegService.getScreenShots(this.file);

    this.selectedScreenShot = this.screenshots[0];

    console.log(this.file);
    this.title.setValue(this.file.name.replace(/\.[^/.]+$/, ''));
    this.nextStep = true;
  }

  async uploadFile() {
    this.uploadForm.disable();
    console.log('File Uploaded');

    this.showAlert = true;
    this.alertMsg = 'Please wait! Your clip is being uploaded';
    this.alertColor = 'blue';
    this.inSubmission = true;
    this.showProgress = true;

    const clipFileName = uuid();
    const clipPath = `clips/${clipFileName}.mp4`;

    const screenshotBlob = await this.ffmpegService.blobFromURL(
      this.selectedScreenShot
    );

    const screenshotPath = `screenshots/${clipFileName}.png`;

    // upload takes 2 args, 1st is path and second is actual file
    // NOTE: edit rule to true for access storage
    this.task = this.storage.upload(clipPath, this.file);
    // to get url we need to use below syntax
    const clipRef = this.storage.ref(clipPath);
    // uploading screenshot
    this.screenshotTask = this.storage.upload(screenshotPath, screenshotBlob);
    const screenshotRef = this.storage.ref(screenshotPath);

    combineLatest([
      this.task.percentageChanges(),
      this.screenshotTask.percentageChanges(),
    ]).subscribe((progress) => {
      const [clipProgress, screenshotProgress] = progress;
      if (!clipProgress || !screenshotProgress) {
        return;
      }

      const total = clipProgress + screenshotProgress;

      this.progressPerc = (total as number) / 200;
    });

    forkJoin([this.task.snapshotChanges(), this.screenshotTask.snapshotChanges()])
      .pipe(
        switchMap(() =>
          forkJoin([clipRef.getDownloadURL(), screenshotRef.getDownloadURL()])
        )
      )
      .subscribe({
        next: async (urls) => {
          const [clipURL, screenshotURL] = urls;

          const clip = {
            uid: this.user?.uid as string,
            displayName: this.user?.displayName as string,
            title: this.title.value,
            fileName: `${clipFileName}.mp4`,
            screenshotFileName: `${clipFileName}.png`,
            clipURL,
            screenshotURL,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),

          };

          console.log(clip);
          const clipDocRef = await this.clipsService.createClip(clip);

          this.alertColor = 'green';
          this.alertMsg =
            'Success! Your clip is now ready to share with the world.';
          this.showProgress = false;

          setTimeout(() => this.router.navigate(['clip', clipDocRef.id]), 1000);
        },
        error: (err) => {
          this.uploadForm.enable();
          this.alertColor = 'red';
          this.alertMsg = 'Upload failed! Please try again later.';
          this.inSubmission = true;
          this.showProgress = false;
          console.error(err);
        },
      });
  }
}
