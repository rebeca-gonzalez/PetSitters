
import { PopoverController, ModalController } from '@ionic/angular';
import * as moment from 'moment';
import { Component, ViewChild } from '@angular/core';
import { PopoverPage } from './popover/popover.page';
import { AuthProviderService } from 'src/app/providers/auth/auth-provider.service';
import { throwError } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { SearchService } from 'src/app/providers/Search/search.service';
import { HttpErrorResponse } from '@angular/common/http';
import { GlobalService } from './../../shared/global.service';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-profile',
  templateUrl: 'profile.page.html',
  styleUrls: ['profile.page.scss']
})
export class ProfilePage {
  eventSource = [];
  viewTitle: string;
  selectedDay = new Date();
  
  calendar = {
    mode: 'month',
    currentDate: this.selectedDay
  }


  commentsProfile: any =[
    {
      avatar: '../../../assets/default_avatar.png',
      name: 'David Garcia',
      rating: 5,
      date: '23/03/2016',
      text: 'Very good experience with this petsitter.'

    },
    {
      avatar: '../../../assets/default_avatar.png',
      name: 'Pere Bruy',
      rating: 1,
      date: '23/03/2019',
      text: 'Very bad experience with this petsitter.'

    }
  ]

  cuidador: any = {
    availability: null,
    commentaries: null,
    description: null,
    localization: null,
    name: null,
    profile_image: null,
    stars: 0,
    username: null,
    expert: null,
  };

  editable: boolean = false;
  availabilityEditable: boolean = false;
  expertEditable: boolean = false;
  @ViewChild('description') desc;
  @ViewChild('availability') av;
  @ViewChild('expert') exp;

  constructor(private popoverCtrl: PopoverController, private auth: AuthProviderService, private actrout: ActivatedRoute,
    private search: SearchService,private modalCtrl:ModalController , private global: GlobalService,
     private storage: Storage) {}


  EditText() {
    this.editable = true;
  }

  NoEditText() {
    this.editable = false;
  }

  EditAvailability() {
    this.availabilityEditable = true;
  }

  NoEditAvailability() {
    this.availabilityEditable = false;
  }

  EditExpert(){
    this.expertEditable = true;
  }

  NoEditExpert(){
    this.expertEditable = false;
  }
  TakeText() {
    // Coger el valor nuevo y enviar a backend
    console.log(this.desc.value);

    const body: any = this.desc.value;
    const atr: string = "description";
    console.log(body);
    this.auth.getToken().then(result => {
      const token = result;
      this.auth.modify(token,atr,body)
        .subscribe(res => {
          // When the result is okay
          //this.editable = false;
          },
          err => {
            const error: HttpErrorResponse = err;
            console.log(error);
        });
      });
      // Para que vuelva apparecer el lapis
      this.editable = false;
  }

  TakeAvailability() {
    // Coger el valor nuevo y enviar a backend
    console.log(this.av.value);

    const body: any = this.av.value;
    const atr: string = "availability";
    console.log(body);
    this.auth.getToken().then(result => {
      const token = result;
      this.auth.modify(token,atr,body)
        .subscribe(res => {
          // When the result is okay
          //this.editable = false;
          },
          err => {
            const error: HttpErrorResponse = err;
            console.log(error);
        });
      });
      // Para que vuelva apparecer el lapis
      this.availabilityEditable = false;
    }
  TakeTextExpert() {
    // Coger el valor nuevo y enviar a backend
    console.log(this.exp.value);

    const body: any = this.exp.value;
    const atr: string = "expert";
    console.log(body);
    this.auth.getToken().then(result => {
      const token = result;
      this.auth.modify(token,atr,body)
        .subscribe(res => {
          // When the result is okay
          //this.editable = false;
          },
          err => {
            const error: HttpErrorResponse = err;
            console.log(error);
        });
      });
      // Para que vuelva apparecer el lapis
      this.expertEditable = false;
  }


  ngOnInit() {
    // obtener username mio
    this.auth.getUsername().then(uname => {
    const username = uname;
    console.log(username);
    

   // this.actrout.snapshot.paramMap.get('username');
    this.auth.getToken().then(result => {
      const token = result;
      // De momento usa el provider de search!!
      this.search.getUser(username, token).subscribe(res => {
        this.cuidador = res;
      });
    }).catch(err => {
      console.log(err);
      return throwError;
    });
  });
  }


  async OpenPopover(ev: Event) {
    const popover = await this.popoverCtrl.create({
      component: PopoverPage,
      componentProps: {
        ev: ev,
      },
    });
    return await popover.present();
  }

  addEvent(){
  
  }

  onEventSelected(event){
    let start =moment(event.startTime).format('LLLL');
    let end =moment(event.startTime).format('LLLL');

    let alert = this
  }

  onTimeSelected(event){
    this.selectedDay=event.selectedDay;
  }
  onViewTitleChanged(title){
    this.viewTitle=title;
  }
}
