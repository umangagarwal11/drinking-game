const myVideo = document.createElement("video");
myVideo.muted = true;
const peers = {}
const socket = io('/')

const videoGrid = document.getElementById('video-grid');

var peer = new Peer();
const backup = ['Eat something and then talk with your mouth full','Drink a glass of wine in less than 15 seconds','Brush the teeth of the person sitting next to you',
              'Stuff ice inside your bra and leave it there for 60 seconds','Sit on the lap of a guy for 10 minutes','Shave the legs of a man',
              'Apply peanut butter to your face','Fill your mouth with water and try singing a song','Call up your crush and declare your love for him',
              'Striptease for thirty whole seconds','Make an obscene phone call to a random number','Remove the socks of a person sitting next to you with your teeth',
              'Eat a raw egg with chocolate',' Bark like a dog'];
var dares = [...backup];

let myVideoStream;
let user;

navigator.mediaDevices.getUserMedia({
  video: true,
  audio:true
}).then(stream => {
  myVideoStream = stream;
  addVideoStream(myVideo, myVideoStream);

  peer.on('call', call =>{
    call.answer(stream);
    const video = document.createElement("video");
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream);
    });
  });

  socket.on('user-connected', (userId) => {
    connectToNewUser(userId, stream);
  });

  let text = $('.card_flip');

  text.on('click',(e) => {
    socket.emit('message', Math.floor(Math.random() * dares.length), user);
  });

  socket.on('createMessage', (message, sender) => {
    if(dares.length === 0){
      dares = [...backup];
    }
    document.querySelector('.messages').innerHTML=`<div class = "message">
                                                        <b>${sender} has to:</b><br>
                                                        <div class="card" style="background:#000; color:#cc00cc; height:80%; margin:10% 0; text-align:justify; padding:40% 5%;">
                                                            ${dares[message]} or take a shot!
                                                        </div>
                                                   </div>`;
    dares.splice(message,1);
  });

  let leave = $('.exit');
  leave.on('click',(e) => {
    socket.disconnect(0);
    window.location.href="../../";
  })

});

socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close()
})

peer.on('open', id => {
  user=prompt("Please enter a nickname","Example: Jon Doe");
  if(user == null || user == "Example: Jon Doe"){
    user=id;
  }
  socket.emit('join-room', ROOM_ID, id);
});

const connectToNewUser = (userId, stream) => {
  const call = peer.call(userId, stream);
  const video = document.createElement("video");
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream);
  });
  call.on('close', () => {
    video.remove()
  })

  peers[userId] = call
};

const addVideoStream = (video,stream) => {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.append(video);
}

const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
}

const setMuteButton = () => {
  const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
  `
  document.querySelector('.main__mute_button').innerHTML = html;
}

const setUnmuteButton = () => {
  const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
  `
  document.querySelector('.main__mute_button').innerHTML = html;
}

const playStop = () => {
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo()
  } else {
    setStopVideo()
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
}

const setStopVideo = () => {
  const html = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>
  `
  document.querySelector('.main__video_button').innerHTML = html;
}

const setPlayVideo = () => {
  const html = `
  <i class="stop fas fa-video-slash"></i>
    <span>Start Video</span>
  `
  document.querySelector('.main__video_button').innerHTML = html;
}
