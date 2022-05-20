import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  credentials = {
    email: '',
    password: '',
  };

  showAlert = false;
  alertMsg = 'Please wait! We are loggin you in.';
  alertColor = 'blue';
  inSubmission = false;

  constructor(private auth: AngularFireAuth) {}

  ngOnInit(): void {}

  async login() {
    this.showAlert = true;
    this.alertMsg = 'Please wait! We are loggin you in.';
    this.alertColor = 'blue';
    this.inSubmission = true;
    try {
      await this.auth.signInWithEmailAndPassword(
        this.credentials.email,
        this.credentials.password
      );
    } catch (e) {
      this.inSubmission = false;
      this.alertMsg = 'Invalid E-mail or Password';
      this.alertColor = 'red';
      return;
    }

    this.alertMsg = 'Success! You are now logged in.';
    this.alertColor = 'green';
  }
}
