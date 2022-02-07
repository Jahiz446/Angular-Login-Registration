import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { User } from '../models/User';
import { BehaviorSubject, catchError, first, Observable ,tap } from 'rxjs';
import { ErrorHandlerService } from './error-handler.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private url= "http://localhost:3000/api";
  isUserLoggedIn$ = new BehaviorSubject<boolean>(false);
  userId: Pick<User, "id"> | undefined;

  httpOptions: {headers: HttpHeaders} = {
    headers:new HttpHeaders({"Content-Type": "application/json"}),
  };

  constructor(
    private http: HttpClient , 
    private errorHandlerService: ErrorHandlerService,
    private router: Router) { }

  register(user: Omit<User, "id">) : Observable<User>{
    console.log(user);
    return  this.http.post<User>(`${this.url}/user/register`, JSON.stringify(user), this.httpOptions)
    .pipe(
      first(), 
      tap((tokenObject: any) => {
        this.router.navigate(["login"]);
      }),
      catchError(this.errorHandlerService.handleError<User>("register") )
    )
  };

  profile() {
    const token = localStorage.getItem('Token');
    console.log(token, "Token");
    return this.http.get(`${this.url}/user/profile`, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      }),
    })

    // --
  }

  update(): Observable<User[]> {
    return this.http.get<User[]>(`${this.url}/user/update`)
      .pipe(
        tap((tokenObject: any) => {
          console.log("update service");
        }),
       // catchError(this.errorHandlerService.handleError<User>('profile'))
      );
  }

  
  login(
    email: Pick<User, "email">,
    password: Pick<User, "password">
  ): Observable<{
    token: string;
    userId: Pick<User, "id">;
    
  }> { 
    return this.http
      .post(`${this.url}/user/login`, { email, password }, this.httpOptions)
      .pipe(
        first(),
        tap((tokenObject: any) => {
          this.userId = tokenObject.userId;
          localStorage.setItem("token", tokenObject.token);
          this.isUserLoggedIn$.next(true);
          this.router.navigate([""]);
          console.log("success");
          console.log(tokenObject)
          localStorage.setItem("Token", tokenObject.token);
          
        }),
        catchError(
          this.errorHandlerService.handleError<{
            token: string;
            userId: Pick<User, "id">;
          }>("login")
        )
      );
  }
  
}
