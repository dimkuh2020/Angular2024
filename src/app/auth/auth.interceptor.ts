import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from "@angular/common/http";
import { inject } from "@angular/core";
import { AuthService } from "./auth.service";
import { catchError, switchMap, throwError } from "rxjs";
//в app.config.ts    ->  provideHttpClient(withInterceptors([authTokenInterceptor]))

let isRefreshing = false;

export const authTokenInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
                                                        //перехв запрос       //отпускаем

    const authService = inject(AuthService); // тащим из AuthService
    const token = authService.token

    if (!token) {
        return next(req)       
    } 
    
    if (isRefreshing) {
        return refreshAndProceed(authService, req, next)
    }

    return next(addToken(req, token)).pipe( 
        catchError(error => { //если токен помер
            if (error.status == 403) {
              return refreshAndProceed(authService, req, next)  
            }
            return throwError(error)
        })
    )    
}

const refreshAndProceed = (authService: AuthService, req: HttpRequest<any>, next: HttpHandlerFn) => {
    if (!isRefreshing) {
        isRefreshing = true
        return authService.refreshAuthToken().pipe(  
            switchMap((res) => {  //переходим в другой стрим 
                isRefreshing = false
                return next(addToken(req, res.access_token))
            })
        )
    }
    return next(addToken(req, authService.token!))
}

const addToken = (req: HttpRequest<any>, token: string) => {
    return req.clone({
        setHeaders: {
            Authorization: `Bearer ${token}`
        }
    })
}

