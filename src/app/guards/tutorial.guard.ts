import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router, CanActivate } from '@angular/router';
import { Storage } from '@ionic/storage';
@Injectable({
  providedIn: 'root'
})
export class TutorialGuard implements CanActivate {
  constructor(private storage: Storage, private router: Router) {}

  async canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {

    const isComplete = await this.storage.get('tutorialComplete');

    if (!isComplete) {
      this.router.navigateByUrl('/tutorial');
    }

    return isComplete;
  }
}
