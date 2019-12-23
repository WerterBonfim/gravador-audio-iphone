// import { Observable, from } from 'rxjs';
// import { map } from 'rxjs/operators';


// export class WebAudioTrack {

//     public AudioContext: any;

//     private context;// = window["currentAudioContext"];
//     private sampleRate;// = this.context.sampleRate;
//     private bufferSize = 4096;
//     private numberOfAudioChannels = 1;
//     private volume = 1;
//     private leftChannel = [];
//     private rightChannel = [];
//     private isRecording = false;
//     private isPlaying = false;
//     private recordingLength = 0;
//     private isPaused = false;
//     private isAudioProcessStarted = false;
//     private microphoneStream;// = config.microphoneStream;
//     private jsAudioNode: any;
//     private isCaptureInProgress = false;
//     private microphoneSource: any;
//     private source: AudioBufferSourceNode;
//     private gainNode: GainNode;
//     private audioData: AudioBuffer;

//     private initCallback(): void {
//     };

//     constructor() {

//         this.incluirScriptAdapter();

//         this.AudioContext = window["AudioContext"] || window["webkitAudioContext"];
//         if (!window["currentAudioContext"]) {
//             window["currentAudioContext"] = new AudioContext();
//         }

//         this.context = window["currentAudioContext"];
//         this.sampleRate = this.context.sampleRate;

//         this.bindPrototypeMethods();

//     }

//     private incluirScriptAdapter(): void {

//         var script = document.createElement("script");
//         script.src = "https://webrtchacks.github.io/adapter/adapter-latest.js";
//         document.head.appendChild(script);

//     }

//     private bindPrototypeMethods(): void {

//         for (var i in WebAudioTrack.prototype) {
//             var method = WebAudioTrack.prototype[i];
//             if (typeof method === "function") {
//                 this[i] = this[i].bind(this);
//             }
//         }
//     }

//     //#region [ Publico ]

//     public loadUrl(url: any): any {

//         var xhr = new XMLHttpRequest();
//         xhr.open("GET", url, true);
//         xhr.responseType = "arraybuffer";

//         return new Promise(function (resolve, reject) {
//             xhr.onload = function () {
//                 this._decodeAudio(xhr.response, function () {
//                     console.log("Audio data loaded: " + url);
//                     resolve();
//                     this.isAudioDataLoaded = true;

//                     if (this.onAudioDataLoaded) {
//                         this.onAudioDataLoaded();
//                     }
//                 });
//             }.bind(this);
//             xhr.send();
//         }.bind(this));
//     }


//     public play(): any {

//         this.stop();

//         console.log("Playing stream");

//         this.gainNode = this.context.createGain();
//         this.gainNode.connect(this.context.destination);

//         this.source = this.context.createBufferSource();
//         this.source.buffer = this.audioData;
//         this.source.connect(this.gainNode);
//         this.gainNode.gain.setValueAtTime(this.volume, window["currentAudioContext"].currentTime + 0.0001);

//         this.isPlaying = true;

//         return new Promise(function (resolve, reject) {
//             this.source.onended = function () {
//                 this.isPlaying = false;
//                 resolve();
//             }.bind(this);
//             this.source.start();
//         }.bind(this));
//     }

//     public stop(): void {
//         if (this.isPlaying) {
//             this.source.stop();
//             this.isPlaying = false;
//         }
//     }

//     public setVolume(volume: any): any {
//         this.volume = volume;
//         return this;
//     }

//     public startRecording(callback: any): void {

//         if (callback) {
//             this.initCallback = callback;
//         }

//         this.isCaptureInProgress = true;

//         if (this.microphoneStream) {
//             this._resetMicrophoneStream();
//             this._onMicrophoneCaptured();
//             //return this;
//         }

//         this._setMicrophoneStream()
//             .subscribe(
//                 () => this._onMicrophoneCaptured()
//                 , erro => console.log(erro)
//             );



//         // this._setMicrophoneStream()
//         //     .then(this._onMicrophoneCaptured)
//         //     .catch(console.log);

//         //return this;
//     }

//     public stopRecording(callback: any): any {

//         debugger;

//         if (this.isCaptureInProgress) {
//             this.isCaptureInProgress = false;
//             return;
//         }

//         this.isRecording = false;

//         // to make sure onaudioprocess stops firing
//         this.microphoneSource.disconnect();
//         this.jsAudioNode.disconnect();

//         this.mergeLeftRightBuffers({
//             sampleRate: this.sampleRate,
//             numberOfAudioChannels: this.numberOfAudioChannels,
//             internalInterleavedLength: this.recordingLength,
//             leftBuffers: this.leftChannel,
//             rightBuffers: this.numberOfAudioChannels === 1 ? [] : this.rightChannel
//         }, function (buffer, view) {
//             this.blob = new Blob([view], {
//                 type: 'audio/wav'
//             });

//             this.audioData = this._decodeAudio(buffer, function () {
//                 callback && callback();
//                 this._clearRecordedData();
//             }.bind(this));
//         }.bind(this));

//         return this;
//     }

//     public mergeLeftRightBuffers(config, callback) {

//         function mergeAudioBuffers(config, cb) {

//             var numberOfAudioChannels = config.numberOfAudioChannels;

//             // todo: "slice(0)" --- is it causes loop? Should be removed?
//             var leftBuffers = config.leftBuffers.slice(0);
//             var rightBuffers = config.rightBuffers.slice(0);
//             var sampleRate = config.sampleRate;
//             var internalInterleavedLength = config.internalInterleavedLength;
//             var desiredSampRate = config.desiredSampRate;

//             if (numberOfAudioChannels === 2) {
//                 leftBuffers = mergeBuffers(leftBuffers, internalInterleavedLength);
//                 rightBuffers = mergeBuffers(rightBuffers, internalInterleavedLength);
//                 if (desiredSampRate) {
//                     leftBuffers = interpolateArray(leftBuffers, desiredSampRate, sampleRate);
//                     rightBuffers = interpolateArray(rightBuffers, desiredSampRate, sampleRate);
//                 }
//             }

//             if (numberOfAudioChannels === 1) {
//                 leftBuffers = mergeBuffers(leftBuffers, internalInterleavedLength);
//                 if (desiredSampRate) {
//                     leftBuffers = interpolateArray(leftBuffers, desiredSampRate, sampleRate);
//                 }
//             }

//             // set sample rate as desired sample rate
//             if (desiredSampRate) {
//                 sampleRate = desiredSampRate;
//             }

//             // for changing the sampling rate, reference:
//             // http://stackoverflow.com/a/28977136/552182
//             function interpolateArray(data, newSampleRate, oldSampleRate) {
//                 var fitCount = Math.round(data.length * (newSampleRate / oldSampleRate));
//                 //var newData = new Array();
//                 var newData = [];
//                 //var springFactor = new Number((data.length - 1) / (fitCount - 1));
//                 var springFactor = Number((data.length - 1) / (fitCount - 1));
//                 newData[0] = data[0]; // for new allocation
//                 for (var i = 1; i < fitCount - 1; i++) {
//                     var tmp = i * springFactor;
//                     //var before = new Number(Math.floor(tmp)).toFixed();
//                     //var after = new Number(Math.ceil(tmp)).toFixed();
//                     var before = Number(Math.floor(tmp)).toFixed() as any;
//                     var after = Number(Math.ceil(tmp)).toFixed();
//                     var atPoint = tmp - before;
//                     newData[i] = linearInterpolate(data[before], data[after], atPoint);
//                 }
//                 newData[fitCount - 1] = data[data.length - 1]; // for new allocation
//                 return newData;
//             }

//             function linearInterpolate(before, after, atPoint) {
//                 return before + (after - before) * atPoint;
//             }

//             function mergeBuffers(channelBuffer, rLength) {
//                 var result = new Float64Array(rLength);
//                 var offset = 0;
//                 var lng = channelBuffer.length;

//                 for (var i = 0; i < lng; i++) {
//                     var buffer = channelBuffer[i];
//                     result.set(buffer, offset);
//                     offset += buffer.length;
//                 }

//                 return result;
//             }

//             function interleave(leftChannel, rightChannel) {
//                 var length = leftChannel.length + rightChannel.length;
//                 var result = new Float64Array(length);
//                 var inputIndex = 0;

//                 for (var index = 0; index < length;) {
//                     result[index++] = leftChannel[inputIndex];
//                     result[index++] = rightChannel[inputIndex];
//                     inputIndex++;
//                 }
//                 return result;
//             }

//             function writeUTFBytes(view, offset, string) {
//                 var lng = string.length;
//                 for (var i = 0; i < lng; i++) {
//                     view.setUint8(offset + i, string.charCodeAt(i));
//                 }
//             }

//             // interleave both channels together
//             var interleaved;

//             if (numberOfAudioChannels === 2) {
//                 interleaved = interleave(leftBuffers, rightBuffers);
//             }

//             if (numberOfAudioChannels === 1) {
//                 interleaved = leftBuffers;
//             }

//             var interleavedLength = interleaved.length;

//             // create wav file
//             var resultingBufferLength = 44 + interleavedLength * 2;

//             var buffer = new ArrayBuffer(resultingBufferLength);

//             var view = new DataView(buffer);

//             // RIFF chunk descriptor/identifier
//             writeUTFBytes(view, 0, 'RIFF');

//             // RIFF chunk length
//             view.setUint32(4, 44 + interleavedLength * 2, true);

//             // RIFF type
//             writeUTFBytes(view, 8, 'WAVE');

//             // format chunk identifier
//             // FMT sub-chunk
//             writeUTFBytes(view, 12, 'fmt ');

//             // format chunk length
//             view.setUint32(16, 16, true);

//             // sample format (raw)
//             view.setUint16(20, 1, true);

//             // stereo (2 channels)
//             view.setUint16(22, numberOfAudioChannels, true);

//             // sample rate
//             view.setUint32(24, sampleRate, true);

//             // byte rate (sample rate * block align)
//             view.setUint32(28, sampleRate * 2, true);

//             // block align (channel count * bytes per sample)
//             view.setUint16(32, numberOfAudioChannels * 2, true);

//             // bits per sample
//             view.setUint16(34, 16, true);

//             // data sub-chunk
//             // data chunk identifier
//             writeUTFBytes(view, 36, 'data');

//             // data chunk length
//             view.setUint32(40, interleavedLength * 2, true);

//             // write the PCM samples
//             var lng = interleavedLength;
//             var index = 44;
//             var volume = 1;
//             for (var i = 0; i < lng; i++) {
//                 view.setInt16(index, interleaved[i] * (0x7FFF * volume), true);
//                 index += 2;
//             }

//             if (cb) {
//                 return cb({
//                     buffer: buffer,
//                     view: view
//                 });
//             }


//             postMessage({
//                 buffer: buffer,
//                 view: view
//             });
//         }



//     }

//     public processInWebWorker(_function: any): any {

//         var workerURL = URL.createObjectURL(new Blob([_function.toString(),
//         ';this.onmessage =  function (e) {' + _function.name + '(e.data);}'
//         ], {
//                 type: 'application/javascript'
//             }));

//         var worker = new Worker(workerURL);
//         worker["workerURL"] = workerURL;
//         return worker;
//     }



//     //#endregion




//     //#region [ Privados ]




//     private _setupProcessor(): void {
//         var jsAudioNodeCreator = this.context.createJavaScriptNode ? "createJavaScriptNode" : "createScriptProcessor";
//         this.jsAudioNode = this.context[jsAudioNodeCreator](this.bufferSize, this.numberOfAudioChannels, this.numberOfAudioChannels);
//         this.jsAudioNode.connect(this.context.destination);
//     }

//     private _decodeAudio(arrayBuffer: any, callback: any): void {

//         this.context.decodeAudioData(arrayBuffer, function (buffer: any) {
//             this.audioData = buffer;
//             callback && callback();
//         }.bind(this));

//     }

//     private _onMicrophoneCaptured(): void {

//         debugger;

//         if (!this.isCaptureInProgress) {
//             return;
//         }

//         this.recordingLength = 0;

//         this._setupProcessor();

//         this.microphoneSource = this.context.createMediaStreamSource(this.microphoneStream);
//         this.microphoneSource.connect(this.jsAudioNode);
//         this.jsAudioNode.onaudioprocess = this._onAudioProcess.bind(this);

//         this.isRecording = true;
//         this.isCaptureInProgress = false;
//     }

//     private _onAudioProcess(e: any): void {

//         if (this.isPaused) {
//             return;
//         }

//         if (this._isMediaStreamActive() === false) {
//             console.log('MediaStream seems stopped.');
//         }

//         if (!this.isRecording) {
//             return;
//         }

//         if (!this.isAudioProcessStarted) {
//             this.isAudioProcessStarted = true;
//             this.initCallback();
//         }

//         var left = e.inputBuffer.getChannelData(0);

//         // we clone the samples
//         this.leftChannel.push(new Float32Array(left));

//         if (this.numberOfAudioChannels === 2) {
//             var right = e.inputBuffer.getChannelData(1);
//             this.rightChannel.push(new Float32Array(right));
//         }

//         // export raw PCM
//         this.recordingLength += this.bufferSize;
//     }

//     private _isMediaStreamActive(): any {
//         return this.microphoneStream.active;
//     }

//     private _clearRecordedData(): void {
//         this.leftChannel = [];
//         this.rightChannel = [];
//         this.isAudioProcessStarted = false;
//         this.isRecording = false;
//         this.isPaused = false;
//     }

//     private _setMicrophoneStream(): Observable<any> {

//         let promesa = navigator.mediaDevices.getUserMedia({ audio: true });
//         return from(promesa)
//             .pipe(
//                 map(mic => this.microphoneStream = mic)
//             )

//         // return navigator.mediaDevices.getUserMedia({ audio: true })
//         //     .then(function (microphone) {
//         //         this.microphoneStream = microphone;
//         //     }.bind(this))
//         //     .catch(console.log);

//     }

//     private _resetMicrophoneStream(): void {
//         this.microphoneStream = this.microphoneStream.clone();
//     }

//     //#endregion







// }