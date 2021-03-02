(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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

myPeer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id);
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



},{}]},{},[1]);
