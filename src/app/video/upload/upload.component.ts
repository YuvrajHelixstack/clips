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

  title = new FormControl('', [Validators.required, Validators.minLength(3)]);
  
  uploadForm = new FormGroup({
    title: this.title,
  });

  constructor(
    private storage: AngularFireStorage,
    private auth: AngularFireAuth,
    private clipsService: ClipService,
    private router: Router
  ) {
    auth.user.subscribe((user) => (this.user = user));
  }

  // to cancel request when we navigate away during file upload
  ngOnDestroy(): void {
    this.task?.cancel();
  }

  storeFile($event: Event) {
    // console.log($event);     to see to select file we use drag and drop or input field
    this.isDragover = false;

    this.file = ($event as DragEvent).dataTransfer
      ? ($event as DragEvent).dataTransfer?.files.item(0) ?? null
      : ($event.target as HTMLInputElement).files?.item(0) ?? null;

    if (!this.file || this.file.type !== 'video/mp4') {
      return;
    }

    console.log(this.file);
    this.title.setValue(this.file.name.replace(/\.[^/.]+$/, ''));
    this.nextStep = true;
  }

  uploadFile() {
    this.uploadForm.disable();
    console.log('File Uploaded');
    const clipFileName = uuid();
    const clipPath = `clips/${clipFileName}.mp4`;

    this.showAlert = true;
    this.alertMsg = 'Please wait! Your clip is being uploaded';
    this.alertColor = 'blue';
    this.inSubmission = true;
    this.showProgress = true;

    // upload takes 2 args, 1st is path and second is actual file
    // NOTE: edit rule to true for access storage
    this.task = this.storage.upload(clipPath, this.file);
    // to get url we need to use below syntax
    const clipRef = this.storage.ref(clipPath);
    this.task
      .percentageChanges()
      .subscribe(
        (progress) => (this.progressPerc = (progress as number) / 100)
      );

    this.task
      .snapshotChanges()
      .pipe(
        last(),
        switchMap(() => clipRef.getDownloadURL())
      )
      .subscribe({
        next: async (url) => {
          const clip = {
            uid: this.user?.uid as string,
            displayName: this.user?.displayName as string,
            title: this.title.value,
            fileName: `${clipFileName}.mp4`,
            url,
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