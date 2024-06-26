import { RecaptchaService } from './../../../components/recaptcha/recaptcha.service';
import { NewUser } from './new-user';
import { Component, OnInit } from '@angular/core';
import {  FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SigninService } from './signin.service';
import { UserExistsService } from './user-exists.service';
import { MensageService } from '../../../components/mensage/mensage.service';
import { EqualsPasswordValidator, NumberValidator, SpecialCharValidator, UperCharValidator, UserEqualPasswordValidator } from './password-validator';
import { MensageComponent } from '../../../components/mensage/mensage.component';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { RecaptchaComponent } from '../../../components/recaptcha/recaptcha.component';


@Component({
  standalone: true,
  imports: [ReactiveFormsModule,MensageComponent,RouterLink,CommonModule, RecaptchaComponent],
  providers: [FormBuilder],
  selector: 'app-novo-usuario',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss'],

})
export class SigninComponent implements OnInit {
  newUserForm!: FormGroup;
  loading = false;
  captchaStatus:any = '';

  captchaConfig:any = {
    type:2,
    length:6,
    cssClass:'custom',
    back: {
     stroke:"#2F9688",
     solid:"#f2efd2"
    } ,
    font:{
      color:"#000000",
      size:"35px"
    }
  };

  constructor(
    private mensageService: MensageService,
    private formBuilder: FormBuilder,
    private signinService: SigninService,
    private router: Router,
    private recaptchaService:RecaptchaService) {
      this.recaptchaService.captchStatus.subscribe((status)=>{
        this.captchaStatus = status;
         if (status == true) {
            this.newUserForm.get('captcha')!.updateValueAndValidity();
        }
      });
    }

  ngOnInit(): void {
    this.newUserForm = this.formBuilder.group(
      {
        userName: [
          '', [Validators.required],
        ],
        email: ['', [Validators.required, Validators.email]],
        password: ['',[Validators.required,Validators.minLength(6),Validators.maxLength(20),
        ,SpecialCharValidator.bind(this),UperCharValidator.bind(this),NumberValidator.bind(this)]],
        repassword: ['',[Validators.required, EqualsPasswordValidator.bind(this)]]
      },
      {
        validators: [UserEqualPasswordValidator],
      }
    );
  }

  signin() {
    console.log(this.newUserForm.valid)
    if (this.newUserForm.valid) {
      const novoUsuario = this.newUserForm.getRawValue() as NewUser;
      this.signinService.SigninNewUser(novoUsuario).subscribe(
        () => {
          this.router.navigate(['home/ativeemail']);
        },
        (e) => {
          this.loading = false;
          var erros = e.error.reasons

          switch(erros[0].message){
            case "Failed : DuplicateUserName":
                this.mensageService.ErrorMensage("Usúario já cadastrado");
              break;
              default:
                this.mensageService.SuccessMensage(erros[0].message);
              break;
          }
        }
      );
    }
  }
}
