const socket = io("/");

var peer = new Peer(undefined, {
    path: "/peerjs",
    host: "/",
    port: location.protocol==='https'?443:3030,
});

const user = prompt("Enter your name");
const my_video = document.createElement("video")
my_video.muted = true
let my_stream;
navigator.mediaDevices.getUserMedia({
    audio:true,
    video:true
})
.then((stream)=>{
    my_stream = stream
    addVideoStream(my_video,stream)
    socket.on("user-connected",userId=>{
        console.log("hello")
        connectToNewUser(userId,stream)
    })
    peer.on("call",(call)=>{
        call.answer(stream)
        const video = document.createElement("video")
        call.on("stream",userVideoStream=>{
            addVideoStream(video,userVideoStream)
        })
    })
})

function addVideoStream(video,stream){
    video.srcObject = stream
    video.addEventListener('loadedmetadata',()=>{
        video.play()
        $("#video_grid").append(video)
    })
}
function connectToNewUser(userId,stream){
    const call = peer.call(userId,stream)
    const video = document.createElement("video")
    call.on("stream",userVideoStream =>{
        addVideoStream(video,userVideoStream)
    })
}


$(function () {
    $("#show_chat").click(function () {
        $(".left-window").css("display", "none")
        $(".right-window").css("display", "block")
        $(".header_back").css("display", "block")
    })
    $(".header_back").click(function () {
        $(".left-window").css("display", "block")
        $(".right-window").css("display", "none")
        $(".header_back").css("display", "none")
    })

    $("#send").click(function () {
        if ($("#chat_message").val().length !== 0) {
            socket.emit("message", $("#chat_message").val());
            $("#chat_message").val("");
        }
    })

    $("#chat_message").keydown(function (e) {
        if (e.key == "Enter" && $("#chat_message").val().length !== 0) {
            socket.emit("message", $("#chat_message").val());
            $("#chat_message").val("");
        }
    })
    $("#stop_video").click(function(){
        const enabled = my_stream.getVideoTracks()[0].enabled
        if(enabled){
            my_stream.getVideoTracks()[0].enabled = false
            html = `<i class = "fas fa-video-slash"></i>`
            $('#stop_video').toggleClass("background_red")
            $('#stop_video').html(html)
        }
        else{
            my_stream.getVideoTracks()[0].enabled = true
            html = `<i class = "fas fa-video"></i>`
            $('#stop_video').toggleClass("background_red")
            $('#stop_video').html(html)
        }
    })
    $("#mute_button").click(function(){
        const enabled = my_stream.getAudioTracks()[0].enabled
        if(enabled){
            my_stream.getAudioTracks()[0].enabled = false
            html = `<i class = "fas fa-microphone-slash"></i>`
            $('#mute_button').toggleClass("background_red")
            $('#mute_button').html(html)
        }
        else{
            my_stream.getAudioTracks()[0].enabled = true
            html = `<i class = "fas fa-microphone"></i>`
            $('#mute_button').toggleClass("background_red")
            $('#mute_button').html(html)
        }
    })


})

peer.on("open", (id) => {
    socket.emit("join-room", ROOM_ID, id, user);
});

socket.on("createMessage", (message, userName) => {
    $(".messages").append(`
        <div class="message">
            <b><i class="far fa-user-circle"></i> <span> ${userName === user ? "me" : userName
        }</span> </b>
            <span>${message}</span>
        </div>
    `)
});
