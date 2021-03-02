const socket = io();
const videoGrid = document.getElementById('video-grid');
//peerjs --port 1338, npm run watch
const myPeer = new Peer(undefined, {
    host: '/',
    port: '1338'
});
const myVideo = document.createElement('video');
//Mute our self
myVideo.muted = true;
const peers = {};

myPeer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id);
});

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: false
}).then(stream => {
    addVideoStream(myVideo, stream);

    // Recieve call & respond
    myPeer.on('call', call => {
        console.log('call answering....');
        call.answer(stream);
        const video = document.createElement('video');
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream);
        });
    });

    //New user connect
    socket.on('user-connected', userId => {
        console.log('new user connecting....');
        connectToNewUser(userId, stream);
    });
});

socket.on('user-disconnected', userId => {
    console.log('disconnecting....');
    if(peers[userId]){
        peers[userId].close();
    }
});

// Add video on DOM
function addVideoStream(video, stream){
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    });
    videoGrid.append(video);
}


// Making call when new user connect
function connectToNewUser(userId, stream){
    console.log('calling......');
    const call = myPeer.call(userId, stream);
    const video = document.createElement('video');
    call.on('stream', userVideoStream => {        
        addVideoStream(video, userVideoStream);
    });
    call.on('close', () => {
        video.remove();
    });
    peers[userId]= call;
}


