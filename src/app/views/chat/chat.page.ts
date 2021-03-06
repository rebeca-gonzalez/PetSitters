import { ChatsService } from './../../providers/chats/chats.service';
import { ImageService } from './../../services/image/image.service';
import { GlobalService } from './../../shared/global.service';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { Storage } from '@ionic/storage';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { Platform, ToastController, NavController, ActionSheetController, ModalController, AlertController } from '@ionic/angular';
import { File } from '@ionic-native/file/ngx';
import { Camera, CameraOptions, PictureSourceType } from '@ionic-native/camera/ngx';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthProviderService } from './../../providers/auth/auth-provider.service';
import { ImageCompressorService } from './../../services/compression.service';
import { ImagePicker } from '@ionic-native/image-picker/ngx';
import { ModalSolicitudPage } from './modal-solicitud/modal-solicitud.page';
import { throwError } from 'rxjs';
import { ContractsService } from 'src/app/providers/contracts/contracts.service';
import { SearchService } from 'src/app/providers/Search/search.service';

const STORAGE_KEY = 'my_images';
const PETSITTERS_DIRECTORY = 'PetSitters';


@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {
  ini: boolean = true;
  username: any;
  usernameCuidador: any;
  message = '';
  messages = [];
  id: any;
  cuidador: any;
  @ViewChild('content') content: any;
  public words: Array<string> = ["Write a message", 'Cancel contract', 'Are you sure you want to cancel the contract?',
  'Cancel', 'Confirm', 'You have cancelled the contract successfully!', 'Something went wrong, please try again']

  images = [];
  compression: ImageCompressorService = new ImageCompressorService();

  public contratado: boolean = false;

  constructor(private file: File, private platform: Platform, private webview: WebView,
    private toastController: ToastController, private storage: Storage,
    private ref: ChangeDetectorRef,  private router: Router,
    private auth: AuthProviderService , private actrout: ActivatedRoute,
    private nav: NavController, private actionSheetController: ActionSheetController,
    private camera: Camera, private imagePicker: ImagePicker, private imageService: ImageService,
    private chats: ChatsService, private modalController: ModalController, private alertController: AlertController, private contracts: ContractsService,
    private search: SearchService)
    {}

  actual_language:string;
  ngOnInit() {
    
	this.auth.getLanguage().then(lang => {
      this.actual_language = lang;
    }); 
	this.translate();

    // Carregar images guardades
    this.platform.ready().then(() => {
      this.loadStoredImages();
    });
    this.auth.getUsername().then(user =>{
      this.username = user;
    });
    this.usernameCuidador = this.actrout.snapshot.paramMap.get('username');
    console.log(this.usernameCuidador );

    this.auth.getToken().then(result => {
      const token = result;
      this.search.getUser(this.usernameCuidador, token).subscribe(res => {
        //console.log(res);
        this.cuidador = res;
        this.downloadImageData();
      });
  
    this.chats.hasContracted(this.usernameCuidador,token).subscribe(res =>{
      console.log(res);
      if(res!=null) this.contratado=true;
    });
  
    }).catch(err => {
      console.log(err);
     return throwError;
    });

    this.getMissatges();
    setTimeout(() => {
      this.content.scrollToBottom(0);
    });
  }

  goBack() {
    clearInterval(this.id);
    this.router.navigateByUrl('/tabs/chats');
  }
  abrirCamara() {
    console.log('Open Camera');
    this.selectImage();
  }
  goProfile() {
    clearInterval(this.id);
    this.nav.navigateRoot(`tabs/chats/perfil-cuidador/` + this.usernameCuidador);
  }
  contratar(){
    //console.log("contrato")
    this.openModal();
  }

  async openModal() {
    const modal = await this.modalController.create({
      component: ModalSolicitudPage,
      componentProps: {
          usernameCuidador: this.usernameCuidador
      },
      cssClass: 'my-contract-modal-css'
    });
    return await modal.present();
  }
  
  botonCancelar(){
    this.presentAlert_D();
  }


  async presentAlert_D() {
    const alert = await this.alertController.create({
      header: this.words[1],
      message: this.words[2],
      
      buttons: [
        {
        text: this.words[3],
        role: 'cancel'
        },
        {
          text: this.words[4],
          handler: cancelar => {
            this.auth.getToken().then(result => {
              this.contracts.rejectContract(this.usernameCuidador, result)
              .subscribe(res => {
                this.ngOnInit();
                this.presentToast(this.words[5]);
              }, err => {
                this.presentToast(this.words[6]);
                console.log(err);
              });
            });
          }
        }
      ]
    });

    await alert.present();
  }

  loadStoredImages() {
    this.storage.get(STORAGE_KEY).then(images => {
      if (images) {
        let arr = JSON.parse(images);
        this.images = [];
        for (let img of arr) {
          let filePath = this.file.externalRootDirectory + PETSITTERS_DIRECTORY + '/' + img;
          let resPath = this.pathForImage(filePath);
          this.images.push({ name: img, path: resPath, filePath: filePath });
        }
      }
    });
  }
  updateStoredImages(name, filePath) { // FilePath contains the complete path + name of the image
    return new Promise((resolve) => {
      this.storage.get(STORAGE_KEY).then(images => {
        let arr = JSON.parse(images);
        if (!arr) {
          let newImages = [name];
          this.storage.set(STORAGE_KEY, JSON.stringify(newImages));
        } else {
          arr.push(name);
          this.storage.set(STORAGE_KEY, JSON.stringify(arr));
        }

        let resPath = this.pathForImage(filePath);

        let newEntry = {
          name: name,
          path: resPath,
          filePath: filePath
        };

        this.images.push(newEntry);
        console.log(this.images.length);
        this.ref.detectChanges(); // trigger change detection cycle        
      }).then(() => resolve());
    });
  }

  deleteImage(imgEntry, position) {
    this.images.splice(position, 1);

    this.storage.get(STORAGE_KEY).then(images => {
      let arr = JSON.parse(images);
      let filtered = arr.filter(name => name != imgEntry.name);
      this.storage.set(STORAGE_KEY, JSON.stringify(filtered));

      let correctPath = imgEntry.filePath.substr(0, imgEntry.filePath.lastIndexOf('/') + 1);
      this.file.removeFile(correctPath, imgEntry.name).then(() => {
        this.presentToast('Image correctly removed');
      });
    });
  }
  async presentToast(text) {
    const toast = await this.toastController.create({
      message: text,
      position: 'bottom',
      duration: 2000
    });
    toast.present();
  }

  getMissatges() {
    console.log('demano missatges');
    setTimeout(() => {
      this.content.scrollToBottom(0);
    });
    this.id = setInterval(function() {
      this.auth.getToken().then(result => {
        const token = result;
        this.chats.getMessagesFromChat(this.usernameCuidador, token).subscribe(res => {
          console.log(JSON.stringify(res));
          let aux = res;
          while (aux.length > this.messages.length) {
            // En cas de rebre una imatge la descarrego
            // @TODO: evitar fer el loop pels missatges ja guardats
            let msg = aux[this.messages.length + 1];
            if (msg.multimedia === true) {
              let filename = msg.content;
              this.imageService.getImageData(filename, token)
                .then((response) => {
                  console.log('Imatge descarregada: ' + JSON.stringify(response));
                  //let dataDirectory = this.file.externalApplicationStorageDirectory;
                  //let url = dataDirectory + '/files/received/' + filename + '.jpg';

                  let imagePath = this.webview.convertFileSrc(response.nativeURL);
                  msg.url = imagePath;

                  console.log('missatge imatge: ' + JSON.stringify(msg));
                }).catch((err) => {
                  console.log('missatge imatge error: ' + JSON.stringify(err));
                });
            }
              this.messages.push(msg);
          }
            console.log('missatge imatges: ' + JSON.stringify(aux));
            setTimeout(() => {
              this.content.scrollToBottom(0);
            });
          });
      });
      if (this.ini && this.messages.length > 0) {
        this.ini = false;
        setTimeout(() => {
          this.content.scrollToBottom(0);
        });
      }
    }.bind(this), 2000);
  }

  enviaMissatge() {
    if (this.message !== '') {
      this.auth.getToken().then(result => {
        const token = result;
        console.log(token);
        let body = {
          content: this.message,
          isMultimedia: false,
          userWhoReceives: this.usernameCuidador
        };
        console.log('body missatge: ' + JSON.stringify(body));
        this.chats.sendMessage(body, token).subscribe(res => {}, err => {console.log(err)});
        this.messages.push({content: this.message,
                            multimedia: false,
                            userWhoReceives: this.usernameCuidador,
                            userWhoSends: this.username,
                            visible: true,
                            whenSent: ""});
      this.message = '';
      setTimeout(() => {
        this.content.scrollToBottom(0);
      });
      }, err =>{
        console.log(err);
      }).catch(err => {
        console.log(err);
      });
      console.log(this.messages);
      setTimeout(() => {
        this.content.scrollToBottom(0);
      });
    }
  }

  enviaImatge(filename, url) {
    this.auth.getToken().then(result => {
      const token = result;
      let body = {
        content: filename,
        isMultimedia: true,
        userWhoReceives: this.usernameCuidador
      };
      console.log('body missatge: ' + JSON.stringify(body));
      this.chats.sendMessage(body, token).subscribe(res => {}, err => {console.log(err)});

      let imagePath = this.webview.convertFileSrc(url);
      this.messages.push({content: filename,
        multimedia: true,
        userWhoReceives: this.usernameCuidador,
        userWhoSends: this.username,
        visible: true,
        url: imagePath,
        whenSent: ""});

      console.log('missatges: ' + JSON.stringify(this.messages));
      this.message = '';
      setTimeout(() => {
        this.content.scrollToBottom(0);
      });
    }, err => {
      console.log(err);
    }).catch(err => {
      console.log(err);
    });
    console.log(this.messages);
    setTimeout(() => {
      this.content.scrollToBottom(0);
    });
  }
  ionViewDidEnter() {
    this.content.scrollToBottom();
  }
  ionViewDidLeave(){
    clearInterval(this.id);
  }

  // FUNCIONALITATS DE CAMERA

  pathForImage(img) {
    if (img === null) {
      return '';
    } else {
      let converted = this.webview.convertFileSrc(img);
      return converted;
    }
  }

  async selectImage() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Select Image Source',
      buttons: [{
        text: 'Load from Library',
        handler: () => {
          this.openGallery();
        }
      },
      {
        text: 'Use Camera',
        icon: 'camera',
        handler: () => {
          this.takePicture(this.camera.PictureSourceType.CAMERA);
        }
      },
      {
        text: 'Cancel',
        role: 'cancel'
      }]
    });
    await actionSheet.present();
  }

  takePicture(sourceType: PictureSourceType) {
    if (this.platform.is('cordova')) {
      const options: CameraOptions = {
        quality: 100,
        sourceType: sourceType,
        destinationType: this.camera.DestinationType.FILE_URI,
        mediaType: this.camera.MediaType.PICTURE,
        encodingType: this.camera.EncodingType.JPEG,
        saveToPhotoAlbum: true,
        correctOrientation: true,
      };

      this.camera.getPicture(options).then(imagePath => {
        let currentName = imagePath.substr(imagePath.lastIndexOf('/') + 1);
        let correctPath = imagePath.substr(0, imagePath.lastIndexOf('/') + 1);
        let generatedName: string = this.createFileName();
        this.copyAndCompress(correctPath, currentName, generatedName)
          .then((OutputDir: String) => {
            console.log("UPLOADING IMAGE: " + OutputDir);
            this.imageService.getToken().then((token) => {
              return this.imageService.uploadImageData(OutputDir, token);
            }).then((data) => {
              this.presentToast('Image sent correctly');
              console.log('Response chat:' + JSON.stringify(data));
              //let string = OutputDir.split('//');
              //let path = string[1];
              this.enviaImatge(data.response, OutputDir);
            });
          });
      });
    } else {
      console.log(`I'm not in cordova`);
    }
  }

  openGallery() {
    let options = {
      maximumImagesCount: 8,
      width: 500,
      height: 500,
      quality: 100
    };
    this.imagePicker.hasReadPermission().then(res => {
      if (res === false) {
        this.requestReadPermission();
      } else {
        this.imagePicker.getPictures(options).then((results) => {
          for (let i = 0; i < results.length; i++) {
              console.log('Image URI: ' + results[i]);
              let currentName = results[i].substring(results[i].lastIndexOf('/') + 1);
              let correctPath = results[i].substring(0, results[i].lastIndexOf('/') + 1);
              let generatedName: string = this.createFileName();
              this.copyAndCompress(correctPath, currentName, generatedName).then((OutputDir:string) => {
                console.log("UPLOADING IMAGE: " + OutputDir);
                this.imageService.getToken().then((token) => {
                  return this.imageService.uploadImageData(OutputDir, token);
                }).then((data) => {
                  this.presentToast('Image sent correctly');
                  console.log('Response chat:' + JSON.stringify(data));
                  this.enviaImatge(data.response, OutputDir);
                });
              });
          }
        }, (err) => {
          this.presentToast('Error while opening the images');
        });
      }
    });
  }
  createFileName() {
    let d = new Date();
    let n = d.getTime();
    return (n + '.jpg');
  }


  async requestReadPermission() {
    this.imagePicker.requestReadPermission();
  }

  copyAndCompress(namePath, currentName, newFileName) {
    // Image Compression
    return new Promise((resolve, reject) => {
      let dataDirectory = this.file.externalRootDirectory + PETSITTERS_DIRECTORY + '/';
      let completePath: String = dataDirectory + newFileName;
      this.compression.compress(namePath + currentName).then((filePathOutput:string) => {
        let compressionDir = filePathOutput.substring(0, filePathOutput.lastIndexOf('/') + 1);
        let compressionFile = filePathOutput.substring(filePathOutput.lastIndexOf('/') + 1);
        this.file.removeFile(namePath, currentName).then(() => {this.file.removeFile(namePath, currentName)
          .catch(() => console.log('The temporal file has been successfully removed')); });
        this.file.moveFile(compressionDir, compressionFile, dataDirectory, newFileName).then(_ => {
        // Aquí s'ha de pujar les imatges a la memoria del telefon, amb la referencia del xat
        this.updateStoredImages(newFileName, completePath).then(() => resolve(completePath));
      }, error => {
        console.log('Error while storing the image: ' + error);
        this.presentToast('Error while storing the image');
        reject(error);
      });
    })
    .catch(() => {console.log('Failure when compressiong the image.'); });
    });
  }

translate(){
this.auth.getToken().then(result => {
    const token = result;
	this.auth.translate(this.words,this.actual_language,token).subscribe(res => {
			this.words = res;
		});
	}).catch(err => {
	  console.log(err);
	 return throwError;
	});
  
  return this.words;
}

downloadImageData() {
  console.log('downloadImage is called');
  this.imageService.getToken().then((token) => {
    this.imageService.getImageData(this.cuidador.profile_image, token)
    .then((response) => {
      console.log('Imatge descarregada: ' + JSON.stringify(response));
      //let dataDirectory = this.file.externalApplicationStorageDirectory;
      //let url = dataDirectory + '/files/received/' + filename + '.jpg';

      let imagePath = this.webview.convertFileSrc(response.nativeURL);
      this.cuidador.profile_image = imagePath;

      console.log('imatge perfil actualitzada');
    }).catch((err) => {
      console.log('missatge imatge error: ' + JSON.stringify(err));
    });
  });
}

}
