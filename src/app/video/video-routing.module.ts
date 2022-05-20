import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ManageComponent } from './manage/manage.component';
import { UploadComponent } from './upload/upload.component';
import {
  AngularFireAuthGuard,
  redirectUnauthorizedTo,
} from '@angular/fire/compat/auth-guard';

const redirectunauthorizedToHome = () => redirectUnauthorizedTo('/');

const routes: Routes = [
  {
    path: 'manage',
    component: ManageComponent,
    data: {
      authOnly: true,
      // if try to access route that should be authorized then authguard run this pipe after rejection
      // angular look for this specific property in data to run pipe function
      authGuardPipe: redirectunauthorizedToHome
    },
    canActivate: [AngularFireAuthGuard],
  },
  {
    path: 'upload',
    component: UploadComponent,
    data: {
      authOnly: true,
      authGuardPipe: redirectunauthorizedToHome
    },
    canActivate: [AngularFireAuthGuard]
  },
  // if we change some url we want to redirect the user to new path if they try to visit old path
  {
    path: 'manage-clip',
    redirectTo: 'manage',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VideoRoutingModule {}
