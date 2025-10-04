import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { SEOService } from '../services/seo.service';

@Injectable({
  providedIn: 'root'
})
export class SEOGuard implements CanActivate {
  constructor(private seoService: SEOService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    // Extract route path from the URL
    const routePath = state.url.split('/')[1] || 'dashboard';
    
    // Get SEO data for the current route
    const seoData = this.seoService.getRouteSEOData(routePath);
    
    // Update SEO meta tags
    this.seoService.updateSEO(seoData);
    
    return true;
  }
}
