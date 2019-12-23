import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
//import { WebAudioTrack } from './web-audio-track';


@Component({
  selector: 'app-root',
  templateUrl: './app-component.html'
})
export class AppComponent implements OnInit {

  @ViewChild("audio", { static: true })
  public audio: ElementRef

  public desabilitarBtnGravacao = false;
  public desabilitarBtnPlay = true;
  public desabilitarBtnStop = true;
  public jaGravou = false;

  private recorder: any;


  //private webAudioTrack = new WebAudioTrack();

  ngOnInit(): void {

    console.log('carreguei')

    this.audio.nativeElement.addEventListener('ended', () => this.finalizou());



  }

  public gravar(): void {

    this.desabilitarBtnGravacao = true;
    this.desabilitarBtnPlay = true;
    this.desabilitarBtnStop = false;

    this.jaGravou = false;

    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      this.recorder = new MediaRecorder(stream)

      // Set record to <audio> when recording will be finished
      this.recorder.addEventListener('dataavailable', e => {

        console.log('audio', e)
        console.log('audio eleme', this.audio)

        this.audio.nativeElement.src = URL.createObjectURL(e.data)
      })

      // Start recording
      this.recorder.start()
    })

    // this.webAudioTrack.startRecording(() => {

    //   console.log('começou gravação');


    // })

  }

  public parar(): void {

    this.desabilitarBtnGravacao = false;
    this.desabilitarBtnPlay = false;
    this.desabilitarBtnStop = true;

    if (!this.jaGravou) {

      this.recorder.stop();
      // Remove “recording” icon from browser tab
      this.recorder.stream.getTracks().forEach(i => i.stop())
      this.jaGravou = true;

    }

    this.audio.nativeElement.pause();
    this.audio.nativeElement.currentTime = 0;


  }

  public play(): void {

    console.log('play');
    //this.webAudioTrack.play();

    this.desabilitarBtnStop = false;
    this.desabilitarBtnGravacao = true;
    this.desabilitarBtnPlay = true;

    this.audio.nativeElement.play();

  }

  public finalizou(): void {

    console.log("finalizou");

    this.desabilitarBtnGravacao = false;
    this.desabilitarBtnPlay = false;
    this.desabilitarBtnStop = true;

  }



}
