
import { PopoverController, ModalController } from '@ionic/angular';
import { Component, ViewChild, OnInit } from '@angular/core';
import { AuthProviderService } from 'src/app/providers/auth/auth-provider.service';
import { Router } from '@angular/router';
import { ChatsService } from './../../providers/chats/chats.service';
import { PopoverPage } from './popover/popover.page';
import { throwError } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { SearchService } from 'src/app/providers/Search/search.service';
import { CameraService } from 'src/app/services/camera.service.ts';
import { HttpErrorResponse } from '@angular/common/http';
import { GlobalService } from './../../shared/global.service';
import { Storage } from '@ionic/storage';
import { FormControl, FormGroup, FormBuilder, Validators} from '@angular/forms';

@Component({
  selector: 'app-profile',
  templateUrl: 'profile.page.html',
  styleUrls: ['profile.page.scss']
})
export class ProfilePage implements OnInit {

    
 monday: any ={from: '', to: ''}
 tuesday: any ={from: '', to: ''}
 wednesday: any ={from: '', to: ''}
 thursday: any ={from: '', to: ''}
 friday: any ={from: '', to: ''}
 saturday: any ={from: '', to: ''}
 sunday: any ={from: '', to: ''}

  horasForm: FormGroup;
  diaActual: any = this.monday;



  disableSegmentBool:boolean = false;
  botonEditar:boolean = true;
  readonlyBool: boolean = true;
  day: string = "Mon";
  
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
  expertEditable: boolean = false;

  @ViewChild('description') desc;
  @ViewChild('expert') exp;
  @ViewChild('from') f;
  @ViewChild('to') t;

  constructor(private popoverCtrl: PopoverController, private auth: AuthProviderService, private actrout: ActivatedRoute,
    private search: SearchService,private modalCtrl:ModalController , private global: GlobalService,private chatsService: ChatsService,
    private router: Router,
     private storage: Storage, public formBuilder: FormBuilder, private cameraService: CameraService) {
      this.horasForm = this.formBuilder.group({
        fromfcn: new FormControl('', Validators.compose([
          Validators.required,
          Validators.pattern('^([0-1][0-9]|2[0-3]):[0-5][0-9]$') 
        ])),
        tofcn: new FormControl('', Validators.compose([
          Validators.required,
          Validators.pattern('^([0-1][0-9]|2[0-3]):[0-5][0-9]$') 
        ]))
      });
     }


  EditText() {
    this.editable = true;
  }

  NoEditText() {
    this.editable = false;
  }


  EditExpert(){
    this.expertEditable = true;
  }

  NoEditExpert(){
    this.expertEditable = false;
  }
  TakeTextDescription() {
    // Coger el valor nuevo y enviar a backend

    const body: any = this.desc.value;
    const atr: string = "description";
    // Aqui hauriem de enviar el user al login si no te token
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

    const body: any = this.monday.from + ',' + this.monday.to + ',' 
    + this.tuesday.from + ',' + this.tuesday.to + ',' 
    + this.wednesday.from + ',' + this.wednesday.to + ',' 
    + this.thursday.from + ',' + this.thursday.to + ',' 
    + this.friday.from + ',' + this.friday.to + ',' 
    + this.saturday.from + ',' + this.saturday.to + ',' 
    + this.sunday.from + ',' + this.sunday.to + ',';

    const atr: string = "availability";
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
      //this.availabilityEditable = false;
    }
  TakeTextExpert() {
    // Coger el valor nuevo y enviar a backend

    const body: any = this.exp.value;
    const atr: string = "expert";
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
    

   // this.actrout.snapshot.paramMap.get('username');
    this.auth.getToken().then(result => {
      const token = result;
      // De momento usa el provider de search!!
      this.search.getUser(username, token).subscribe(res => {
        this.cuidador = res;
        if (this.cuidador.availability != "None") {
          let horasdias: string[]=this.cuidador.availability.split(','); 
           this.monday.from=horasdias[0];
           this.monday.to=horasdias[1];
           this.tuesday.from=horasdias[2];
           this.tuesday.to=horasdias[3];
           this.wednesday.from=horasdias[4];
           this.wednesday.to=horasdias[5];
           this.thursday.from=horasdias[6];
           this.thursday.to=horasdias[7];
           this.friday.from=horasdias[8];
           this.friday.to=horasdias[9];
           this.saturday.from=horasdias[10];
           this.saturday.to=horasdias[11];
           this.sunday.from=horasdias[12];
           this.sunday.to=horasdias[13];
        }
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



  editButton(){
    this.disableSegmentBool=true;
    this.readonlyBool=false;
    this.botonEditar=false;
    this.f.value=this.diaActual.from;
    this.t.value=this.diaActual.to;
  }

  guardarButton(){
    if(this.day=="Mon") {
      this.monday.from=this.f.value;
      this.monday.to=this.t.value;
    }
    else if(this.day=="Tue") {
      this.tuesday.from=this.f.value;
      this.tuesday.to=this.t.value;
    }
    else if(this.day=="Wed") {
      this.wednesday.from=this.f.value;
      this.wednesday.to=this.t.value;
    }
    else if(this.day=="Thu") {
      this.thursday.from=this.f.value;
      this.thursday.to=this.t.value;
    }
    else if(this.day=="Fri") {
      this.friday.from=this.f.value;
      this.friday.to=this.t.value;
    }
    else if(this.day=="Sat") {
      this.saturday.from=this.f.value;
      this.saturday.to=this.t.value;
    }
    else if(this.day=="Sun") {
      this.saturday.from=this.f.value;
      this.saturday.to=this.t.value;
    }

    this.TakeAvailability();

    this.f.value="";
    this.t.value="";

    this.readonlyBool=true;
    this.botonEditar=true;
    
    this.disableSegmentBool=false;
  }

  segmentChanged(event){
    if(this.day=="Mon"){
      this.diaActual=this.monday;
    }
    else if(this.day=="Tue"){
      this.diaActual=this.tuesday;
    }
    else if(this.day=="Wed"){
      this.diaActual=this.wednesday;
    }
    else if(this.day=="Thu"){
      this.diaActual=this.thursday;
    }
    else if(this.day=="Fri"){
      this.diaActual=this.friday;
    }
    else if(this.day=="Sat"){
      this.diaActual=this.saturday;
    }
    else if(this.day=="Sun"){
      this.diaActual=this.sunday;
    }
  }

}
