import { Component, OnInit } from '@angular/core';
import { Actas, Orden } from 'src/app/models/actas';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts'
import {FormBuilder} from '@angular/forms';
import {DatePipe} from '@angular/common'
import { ServicioService } from 'src/app/servicio.service';
import { HttpErrorResponse, HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { UserData } from 'src/app/models/userData';
import Swal from 'sweetalert2/dist/sweetalert2.js';
declare let alertify: any;
pdfMake.vfs=pdfFonts.pdfMake.vfs
@Component({
  selector: 'app-actas',
  templateUrl: './actas.component.html',
  styleUrls: ['./actas.component.css']
})
export class ActasComponent implements OnInit {
  
  acta = new Actas();
  fecha:any;
  dateS:any;
  date: any;
  fechaS:any;
  usuario:UserData;
  dialog: any;
  actaCodigoUsuario:string;
  codigoGet:string;
  numeroActual:number;
  numeroSiguiente:number;
  listaDocumentos:any[]=[];
  n: number;
  carreraxUser;
  codigoDoc;
  m;
  invitado;
  loading: boolean;
  InstitutoPertenciciente:string
  logoYav: string | ArrayBuffer;
  logoBj: string | ArrayBuffer;
  logo24M: string | ArrayBuffer;
  logoGrc: string | ArrayBuffer;
  constructor(private formBuilder:FormBuilder,
    public datepipe:DatePipe,
    public service: ServicioService,
    public router:Router,
    public http:HttpClient) {
    
    this.acta = JSON.parse(sessionStorage.getItem('acta')) || new Actas();
    if (!this.acta.ordenDelDia || this.acta.ordenDelDia.length === 0) {
      this.acta.ordenDelDia = [];
      this.acta.ordenDelDia.push(new Orden());
    }
  }
  imagenUriYav() {
    //logoYav
    this.http.get('/assets/logoYav.png', { responseType: 'blob' })
      .subscribe(res => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const x = reader.result;
          this.logoYav = x;
          this.acta.logoPic=this.logoYav;
          console.log('ImagenEnBase64_LogoYav_: ', this.logoYav);
        }
        reader.readAsDataURL(res);
        //console.log('RES_: ',res);
      })
    }
    imagenUriBj(){
    //logBj
    this.http.get('/assets/logoBj.jpg', { responseType: 'blob' })
      .subscribe(res => {
        const reader = new FileReader();
        reader.onloadend = () => {
          this.logoBj = reader.result;
          this.acta.logoPic=this.logoBj;
          //console.log('ImagenEnBase64_: ', this.logoBj);
        }
        reader.readAsDataURL(res);
        //console.log('RES_: ',res);
      })
    }
    imagenUriGrc(){
    //logoGrc
    this.http.get('/assets/logoGrc.png', { responseType: 'blob' })
      .subscribe(res => {
        const reader = new FileReader();
        reader.onloadend = () => {
          this.logoGrc = reader.result;
          this.acta.logoPic=this.logoGrc;
          //console.log('ImagenEnBase64_: ', this.logoGrc);
        }
        reader.readAsDataURL(res);
        //console.log('RES_: ',res);
      })
     }
     imagenUri24M(){
     //logo24M
    this.http.get('/assets/logo24m.jpg', { responseType: 'blob' })
      .subscribe(res => {
        const reader = new FileReader();
        reader.onloadend = () => {
          this.logo24M = reader.result;
          this.acta.logoPic=this.logo24M;
          //console.log('ImagenEnBase64_: ', this.logo24M);
        }
        reader.readAsDataURL(res);
        //console.log('RES_: ',res);
      })
    }
  ngOnInit(){
    this.loading = true;
    this.n = 0;
    this.service.getUsers().subscribe(
      (getdatos:any[])=>this.listaDocumentos=getdatos,
      (error: HttpErrorResponse  )=>{console.log(error.message)})
     this.obtenerFechaS()
     this.acta.codigoDocumento='ACT-';
     this.actaCodigoUsuario='ACT-'
     this.getLocalStorageData();
     this.constaEnCarrera();
    }

    getLocalStorageData() {
      /*localStorage*/
      let user_string = localStorage.getItem("currentUser");
      let user = JSON.parse(user_string);
      var x = user;
      //var id_usuario:number = x.id;
      this.usuario = user;
      this.usuario.codigoUser = x.codigo_user;
      this.acta.idUsuario = this.usuario.id;
      this.acta.codigoUsuario = this.usuario.codigoUser;
      //console.log(this.usuario.id, this.usuario.codigoUser);
      //console.log('user_string_:', user_string);
      console.log('usuario.id_:', this.usuario);
  
    }
    obtenerFecha() {
      this.date = new Date()
      this.date = this.datepipe.transform(this.date, 'yyyy-MM-dd')
    }
    constaEnCarrera() {
      this.service.findById(this.usuario).subscribe(data => {
        this.carreraxUser = data[0].carrera_id;
        for (const key in data) {
          if (data.hasOwnProperty(key))
            this.n++
        }
        //console.log('variable n1_:', this.n);
        console.log('El usuario consta en la tabla CarrerasxUser!!');
        this.invitado = 'no';
        this.generarCodigo();
      },
        error => {
          //console.log('variable n2_:', this.n);
          console.log('El usuario NO consta en la tabla CarrerasxUser!!')
          this.invitado = 'si';
          this.generarCodigoInvitado();
        }
      )
    }
    generarCodigo() {
      var carrera_id = this.carreraxUser;
      if (this.n > 1) {
        console.log('generarCodigo()_:',this.actaCodigoUsuario, this.acta.codigoDocumento)
        this.actaCodigoUsuario = this.acta.codigoDocumento + 'ITSYAV-' + this.dateS + '-';
        this.imagenUriYav();
        this.acta.InstitutoPertenciciente='Instituto Tecnologico Superior Yavirac'
      } else
        if (this.n == 1) {
          if (carrera_id == 1) {
            this.actaCodigoUsuario = this.actaCodigoUsuario + 'ITSBJ-' + this.dateS + '-';
            this.imagenUriBj();
          this.acta.InstitutoPertenciciente='Instituto Tecnologico Superior "Benito Juárez"'
          }
          if (carrera_id == 2) {
            this.actaCodigoUsuario = this.actaCodigoUsuario + 'ITS24M-' + this.date + '-';
           this.imagenUri24M()
            this.acta.InstitutoPertenciciente='Instituto Tecnologico Superior "24 de Mayo"'
          }
          if (carrera_id == 3) {
            this.actaCodigoUsuario = this.actaCodigoUsuario + 'ITSGC-' + this.dateS + '-';
            this.imagenUriGrc            
            this.acta.InstitutoPertenciciente='Instituto Tecnologico Superior "Gran Colombia"'
          }
          if (carrera_id == 4) {
            this.actaCodigoUsuario = this.actaCodigoUsuario + 'ITSYAV-' + this.dateS + '-';
            this.imagenUriYav()
            this.acta.InstitutoPertenciciente='Instituto Tecnologico Superior "Yavirac"'
          }
          if (carrera_id == 5) {
            this.actaCodigoUsuario = this.actaCodigoUsuario + 'ITSYAV-' + this.dateS + '-';
            this.imagenUriYav()
            this.acta.InstitutoPertenciciente='Instituto Tecnologico Superior "Yavirac"'
          }
          if (carrera_id == 6) {
            this.actaCodigoUsuario = this.actaCodigoUsuario + 'ITSYAV-' + this.dateS + '-';
            this.imagenUriYav()
            this.acta.InstitutoPertenciciente='Instituto Tecnologico Superior "Yavirac"'
          }
          if (carrera_id == 7) {
            this.actaCodigoUsuario = this.actaCodigoUsuario + 'ITSYAV-' + this.dateS + '-';
            this.imagenUriYav()
            this.acta.InstitutoPertenciciente='Instituto Tecnologico Superior "Yavirac"'
          }
          if (carrera_id == 8) {
            this.actaCodigoUsuario = this.actaCodigoUsuario + 'ITSYAV-' + this.dateS + '-';
            this.imagenUriYav();
            this.acta.InstitutoPertenciciente='Instituto Tecnologico Superior "Yavirac"'
          }
          if (carrera_id == 9) {
            this.actaCodigoUsuario = this.actaCodigoUsuario + 'ITSBJ-' + this.date + '-';
            this.imagenUriBj()
            this.acta.InstitutoPertenciciente='Instituto Tecnologico Superior "Benito Juárez"'
          }
          if (carrera_id == 10) {
            this.actaCodigoUsuario = this.actaCodigoUsuario + 'ITSYAV-' + this.dateS + '-';
            this.imagenUriYav()
            this.acta.InstitutoPertenciciente='Instituto Tecnologico Superior "Yavirac"'
          }
          if (carrera_id == 11) {
            this.actaCodigoUsuario = this.actaCodigoUsuario + 'ITSYAV-' + this.dateS + '-';
            this.imagenUriYav();
            this.acta.InstitutoPertenciciente='Instituto Tecnologico Superior "Yavirac"'
          }
          if (carrera_id == 12) {
            this.actaCodigoUsuario = this.actaCodigoUsuario + 'ITSGC-' + this.dateS + '-';
            this.imagenUriGrc();
            this.acta.InstitutoPertenciciente='Instituto Tecnologico Superior "Gran Colombia"'
          }
        }
      this.comprobarDocumentosExistentes();
    }
    generarCodigoInvitado() {
      this.actaCodigoUsuario = 'GEDI-';
      this.acta.codigoDocumento = 'GEDI-'
      console.log(this.acta.codigoDocumento);
      this.actaCodigoUsuario = this.actaCodigoUsuario + 'INVITADO-' + this.dateS + '-';
      this.acta.logoPic=this.logoYav;
      this.comprobarDocumentosExistentes();
    }
    comprobarDocumentosExistentes() {
      this.service.getDocumentos().subscribe(data => {
        //Actualización 17/4/2020
        this.codigoDoc = data;
        let array = [];
        //array.push(data);
        //console.log('Nueva Consulta_:', this.codigoDoc)
        var element;
        for (const key in data) {
          if (data.hasOwnProperty(key)) {
            element = data[key];
            array.push(element);
            //console.log('ELEMENT_2_:',array[key]);
          }
        }
        if (Array.isArray(array) && array.length) {
          console.log('Hay Documentos existentes!!', data);
          if (this.invitado.includes('no')) {
            console.log('No es invitado');
            this.generarNumeracionDocumento();
            this.loading = false;
          }
          if (this.invitado.includes('si')) {
            console.log('Si es invitado');
            this.generarNumeracionDocumentoInvitado();
            this.loading = false;
          }
        } else {
          //console.log('NO Existen Documentos!!');
          this.actaCodigoUsuario = this.actaCodigoUsuario + 1;
          this.acta.codigoDocumento = this.actaCodigoUsuario;
  
        }
      },
        error => {
          console.log('error_comprobarDocumentosExistentes()_:')
        }
      )
    }
    generarNumeracionDocumento() {
      //console.log('this.codigoDoc_:', this.codigoDoc);
      //if (this.codigoDoc) {
      var n;
      var existe: boolean = false;
      for (let i = 0; i < this.codigoDoc.length; i++) {
        var t = this.codigoDoc[i].codigo_documento;
        var elemento = this.codigoDoc[i];
        n = t.includes('ACT');
        //console.log(n);
        if (n) {
          console.log('Variable_t_:', t)
  
          this.listaDocumentos.push(elemento);
          existe = true
          //codigoDoc.push(n);
        }
      }
      if (!existe) {
        console.log('No hay Documentos ACTs');
        this.actaCodigoUsuario = this.actaCodigoUsuario + 1;
      } else {
        for (let m = 0; m < this.listaDocumentos.length; m++) {
          const element = this.listaDocumentos[m];
          //console.log('listaDocumentos_:', element);
        }
        this.listaDocumentos.forEach(element => {
          //console.log('ELEMENT_:',element);
          this.m = element.codigo_documento;
          this.codigoGet = this.m;
        });
        //var long = this.codigoGet.length;
        //console.log('long_:', long);
        var cad2 = this.m.slice(-1);
        var cad3 = this.m.slice(-2);
        var cad4 = this.m.slice(-3);
        if (cad3 > 10 && cad3 < 100) {
          //console.log('cad3_:', cad3)
          cad2 = this.m.slice(-2);
          //console.log('cad2_:', cad2);
        }
        if (cad4 > 100 && cad3 < 1000) {
          cad2 = this.m.slice(-3);
        }
        //console.log('antes_del_if_:', cad2);
        //cad2 = +cad2;
        if (cad2 == 0) {
          cad2 = this.m.slice(-2);
          //console.log('if_cad2_:', cad2);
        }
        if (cad3 == 0) {
          cad2 = this.m.slice(-3);
          //console.log('if_cad2_:', cad2);
        }
        this.numeroActual = cad2;
        // parseInt(cad2);
        //console.log('Códigos_Tabla_Documentos()_:', this.codigoGet);
        //console.log(cad2, this.numeroActual);
        var x;
        for (var y = 1; y <= 1000; y++) {
          x = y;
          if (this.numeroActual == x) {
            x++
            var k = x;
            //console.log('k_:', k)
            this.actaCodigoUsuario = this.actaCodigoUsuario + k;
            this.acta.codigoDocumento = this.actaCodigoUsuario;
  
          }
        }
        //
  
      }
      console.log('codigo_documento_generado:', this.actaCodigoUsuario, this.acta.codigoDocumento)
    }
    generarNumeracionDocumentoInvitado() {
      //console.log('this.codigoDoc_:', this.codigoDoc);
      //if (this.codigoDoc) {
      var n;
      var existe: boolean = false;
      for (let i = 0; i < this.codigoDoc.length; i++) {
        var t = this.codigoDoc[i].codigo_documento;
        var elemento = this.codigoDoc[i];
        //console.log(t)
        n = t.includes('INVITADO');
        //console.log(n);
        if (n) {
          this.listaDocumentos.push(elemento);
          //codigoDoc.push(n);
          existe = true;
        }
      }
      if (!existe) {
        //console.log('No hay Documentos INVITADO');
        this.actaCodigoUsuario = this.actaCodigoUsuario + 1;
      } else {
        for (let m = 0; m < this.listaDocumentos.length; m++) {
          const element = this.listaDocumentos[m];
          //console.log('listaDocumentos_:', element);
        }
        this.listaDocumentos.forEach(element => {
          //console.log('ELEMENT_:',element);
          this.m = element.codigo_documento;
          this.codigoGet = this.m;
        });
        //var long = this.codigoGet.length;
        //console.log('long_:', long);
        var cad2 = this.m.slice(-1);
        var cad3 = this.m.slice(-2);
        var cad4 = this.m.slice(-3);
        if (cad3 > 10 && cad3 < 100) {
          //console.log('cad3_:', cad3)
          cad2 = this.m.slice(-2);
          //console.log('cad2_:', cad2);
        }
        if (cad4 > 100 && cad3 < 1000) {
          cad2 = this.m.slice(-3);
        }
        //console.log('antes_del_if_:', cad2);
        //cad2 = +cad2;
        if (cad2 == 0) {
          cad2 = this.m.slice(-2);
          //console.log('if_cad2_:', cad2);
        }
        if (cad3 == 0) {
          cad2 = this.m.slice(-3);
          //console.log('if_cad2_:', cad2);
        }
        this.numeroActual = cad2;
        // parseInt(cad2);
        //console.log('Códigos_Tabla_Documentos()_:', this.codigoGet);
        //console.log(cad2, this.numeroActual);
        var x;
        for (var y = 1; y <= 1000; y++) {
          x = y;
          if (this.numeroActual == x) {
            x++
            var k = x;
            //console.log('k_:', k)
            this.actaCodigoUsuario = this.actaCodigoUsuario + k;
            this.acta.codigoDocumento = this.actaCodigoUsuario;
  
          }
        }
        //
  
      }
      console.log('codigo_documento_generado:', this.actaCodigoUsuario, this.acta.codigoDocumento)
    }
  
    ///////////////////////Fin de métodos escenciales////////////////////////
    ///////////////////////Comienza generación de PDF////////////////////////
    guardarBorrador(){
      sessionStorage.setItem('solicitud-titulacion', JSON.stringify(this.acta));
    }
    publicarEnGedi() {
      /////PUBLICAR COMO INVITADO/////
      if (this.invitado.includes('si')) {
        Swal.fire({
          title: this.usuario.name + ' publicarás como invitado',
          text: "Este documento solo lo podrás visualizar tú y los cargos administrativos",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Si, Publicar!',
          cancelButtonText: 'Cancelar!',
          timer: 5000,
          timerProgressBar: true,
        }).then((result) => {
          if (result.value) {
            this.publicar();
            //console.log('VALUE_DATA_Invitado:',a,c);
            Swal.fire(
              'Publicado!',
              'Tu documento ha sido publicado en GEDI como invitado.',
              'success'
            )
          }
        })
  
      }
      /////PUBLICAR COMO USUARIO GEDI/////
      if (this.invitado.includes('no')) {
        //alert('ERES USUARIO DE GEDI!');
        Swal.fire({
          title: this.usuario.name + ' vas a publicar en GEDI',
          html: "Si publicas tu documento estará disponible para ti y otros usuarios en la pestaña <b>Visualizador</b>",
          icon: 'info',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Si, Publicar!',
          cancelButtonText: 'Cancelar!',
          timer: 5000,
          timerProgressBar: true,
        }).then((result) => {
          if (result.value) {
            this.publicar();
            Swal.fire(
              'EXCELENTE!',
              this.usuario.name + ' Tu documento ha sido publicado en GEDI.',
              'success'
            )
            alertify.notify('Publicado con éxito!', 'success', 2);
          } else {
            alertify.notify('Cancelado!', 'error', 2);
          }
        })
      }
    }
    visualizarPdf(){
      const defenicionSolicitud = this.getDocumentDefinition();
      const pdf:Object = pdfMake.createPdf(defenicionSolicitud).open();
      console.log('visualizarPdf()_: ',pdf);
    }
    publicar() {
      const formData = new FormData();
      const defenicionSolicitud = this.getDocumentDefinition();
      const pdf = pdfMake.createPdf(defenicionSolicitud);
      const blob = new Blob([pdf], { type: 'application/octet-stream' });
      //console.log('metodo_obtenerPdf()_:', blob);
      formData.append("upload", blob);
      formData.append("codDoc", this.actaCodigoUsuario);
      formData.append("codUser", this.usuario.codigoUser);
      formData.append("idUser", this.usuario.id.toString());
  
      this.service.setDocumento(formData);
      console.log('ANTES_DE_:', this.actaCodigoUsuario)
      this.actaCodigoUsuario = '';
      console.log('ANTES_DE_:', this.acta.codigoDocumento)
      this.acta.codigoDocumento = '';
      setTimeout(() => {
        this.ngOnInit();
        //console.log('Page reload!!');
      }, 3000);//1000ms=1Sec
    }
obtenerFechaS(){
  this.dateS=new Date()
  this.dateS=this.datepipe.transform(this.dateS,'yyyy')
}
  agregarOrden () {
    this.acta.ordenDelDia.push(new Orden())
  }

  resetForm() {
    this.acta = new Actas();
    sessionStorage.removeItem('acta');
  }

  getDocumentDefinition() {
    sessionStorage.setItem('acta', JSON.stringify(this.acta));
    return {
      content: [
        {
          columns:[
            [{
             image: this.acta.logoPic, 
             width:100,
             height:75,
             style:'img',
             alignment:'left'
            }]
          ]
         },
         {
          canvas: [{ type: 'line', x1: 0, y1: 3, x2: 590-2*30, y2: 3, lineWidth: 3 }]
         },
        {
          text: this.acta.InstitutoPertenciciente,
          style : 'titulo'
        },
    
        {
          text: this.acta.titulo,
          style : 'titulo'
        },
        {
          text: this.actaCodigoUsuario,
          style : 'titulo'
        },
        {
          text: this.acta.inicio,
          style: 'body'
        },
        {
          text: 'Orden del Dia',
          style: 'subTitulo'
        },
        {
          ul : [
            ...this.acta.ordenDelDia.filter((orden, index) => index % 3 === 0).map(o => o.orden)
          ]
        },
        {
          ul : [
            ...this.acta.ordenDelDia.filter((orden, index) => index % 3 === 1).map(o => o.orden)
          ]
        },
        {
          ul : [
            ...this.acta.ordenDelDia.filter((orden, index) => index % 3 === 2).map(o => o.orden)
          ]
        },
        {
          text: 'Desarrollo',
          style: 'subTitulo'
        },
        {
          text: this.acta.desarrollo,
          style: 'body'
        },
        
        {
          text: this.acta.despedida,
          fontSize: 12,
          margin : [5 , 20 , 5 ,60]
        },
        {
          text:this.usuario.name,
          style: 'pie'
        },
        {
          text: this.acta.InstitutoPertenciciente,
          style: 'pie'
        }
      ],
        styles: {
          titulo: {
            fontSize: 14,
            bold: true,
            margin: [0, 20, 0, 20],
            alignment: 'center',
            textAlign: 'justify'
          },
          subTitulo: {
            fontSize: 13,
            bold: true,
            margin: [5, 10, 5, 10]
          },
          cabecera: {
            fontSize: 12,
            margin: [5, 10, 5, 10],
            textAlign: 'justify'
          },
          body: {
            fontSize: 12,
            fontFamily : 'times new roman',
            margin : [5, 10,5,10],
            textAlign: 'justify'
          },
          pie : {
            fontSize: 12,
            fontFamily : 'times new roman',
            margin : [5, 10,5,10],
            bold: true,
            alignment : 'center',
            textAlign: 'justify'
          }
        }
    };
  }

  generatePdf(action = 'open') {
    const documentDefinition = this.getDocumentDefinition();
    switch (action) {
      case 'open': pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': pdfMake.createPdf(documentDefinition).download(); break;
      default: pdfMake.createPdf(documentDefinition).open(); break;
    }
  }

}