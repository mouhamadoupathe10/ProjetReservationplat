import { Component, OnInit, NgModule } from '@angular/core';
import { Plugins } from '@capacitor/core';

import { map } from "rxjs/operators";
import { HttpClient } from "@angular/common/http";
import { GOOGLE_API_KEY } from "../../environments/environment";
import { ToastController } from "@ionic/angular";
import { RestaurantService } from '../service/restaurant.service';
import { Restaurant } from '../Models/restaurant';
import { UtilsService } from '../utils.service';




@Component({
  selector: 'app-menu',
  templateUrl: 'menu.page.html',
  styleUrls: ['menu.page.scss']
})
export class MenuPage {

  lat: number;
  lng: number;
  address: string;

  resto : Restaurant[];


  constructor(private http: HttpClient, public toastController: ToastController, private restaurantService: RestaurantService,private utils: UtilsService) {
    this.getRestaurants();    
  }

  ngOnInit() {
    // call get current location function on initializing

    this.getCurrentLocation();
  }

  getRestaurants():void 
  {
    this.restaurantService.getRestaurants().subscribe(restaurants =>{
        this.resto = restaurants;
    }, 
    error=>
    { 
      this.utils.presentToast('Erreur survenue','danger');

    });
  }

  getCurrentLocation() {
    Plugins.Geolocation.getCurrentPosition().then(result => {
      this.lat = result.coords.latitude;
      this.lng = result.coords.longitude;

      // calling getAddress function to decode the address
      this.resto.forEach(element => {
        this.getAddress(element.Latitude,element.Longitude).subscribe(decodedAddress => {
          this.address = decodedAddress;
          console.log(this.address);
        });
        
      });

      this.getAddress(this.lat, this.lng).subscribe(decodedAddress => {
        this.address = decodedAddress;
        console.log(this.address);
      });
    });
  }

  // This function makes an http call to google api to decode the cordinates

  private getAddress(lat: number, lan: number) {
    return this.http
      .get<any>(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lan}&key=${
          GOOGLE_API_KEY
        }`
      )
      .pipe(
        map(geoData => {
          if (!geoData || !geoData.results || geoData.results === 0) {
            return null;
          }
          return geoData.results[0].formatted_address;
        })
      );
  }

  async presentToast() {
    const toast = await this.toastController.create({
      message: this.address,

      position: "middle",
      buttons: [
        {
          icon: "close-circle",
          role: "cancel"
        }
      ]
    });
    toast.present();
  }

  onMarkerClick() {
    this.presentToast();
  }

}
