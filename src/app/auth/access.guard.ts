import { inject } from "@angular/core"
import { AuthService } from "./auth.service"
import { Router } from "@angular/router"

export const canActivateAuth = () => {
    const isLoggedIn = inject(AuthService).isAuth //запрашиваем сервис

    if (isLoggedIn) {
        return true
    } 
    return inject(Router).createUrlTree(['/login']) //переход на логин 
}