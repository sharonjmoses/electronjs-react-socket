
import React, { useEffect, useState, useRef } from 'react';
import io from "socket.io-client";
import styled from "styled-components";
export default function app() {

    const Video = styled.video`
  border: 1px solid blue;
  width: 50%;
  height: 50%;
`;

    const [stream, setStream] = useState();

    const userVideo = useRef();
    const partnerVideo = useRef();
    const socket = useRef();

    useEffect(() => {
        socket.current = io.connect("http://localhost:8000/");


        console.log(socket.current)

        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
         
            setStream(stream);
            userVideo.current.srcObject = stream;
            partnerVideo.current.srcObject = stream;

        })

    }, []);

    return (
        <div>
            <h1>Your Video</h1>
            <Video playsInline ref={userVideo} autoPlay />
            <h1>Client Video</h1>
            <Video playsInline ref={partnerVideo} autoPlay />
            <button onClick={() => {
                electron.notificationApi.sendNotification('My custom notification!');
            }}>Notify</button>
        </div>

    )

}
