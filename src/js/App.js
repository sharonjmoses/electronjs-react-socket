
import React, { useEffect, useState, useRef } from 'react';
import io from "socket.io-client";
import styled from "styled-components";
import Peer from "simple-peer";


export default function app() {

const Video = styled.video`
  border: 1px solid blue;
  width: 50%;
  height: 50%;
`;

    const [stream, setStream] = useState();
    const [yourID, setYourID] = useState("");
    const [users, setUsers] = useState({});


    const [receivingCall, setReceivingCall] = useState(false);
    const [caller, setCaller] = useState("");
    const [callerSignal, setCallerSignal] = useState();
    const [callAccepted, setCallAccepted] = useState(false);

    const userVideo = useRef();
    const partnerVideo = useRef();
    const socket = useRef();

    useEffect(() => {
        socket.current = io.connect("http://localhost:8000/");


        console.log(socket.current)

        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {

            setStream(stream);

            if (userVideo.current) {
                userVideo.current.srcObject = stream;
            }
            // userVideo.current.srcObject = stream;
            // partnerVideo.current.srcObject = stream;

        })

        socket.current.on("yourID", (id) => {
            // console.log(id)
            setYourID(id);
        })

        socket.current.on("allUsers", (users) => {
            // console.log(users)
            setUsers(users);
        });

        socket.current.on("hey", (data) => {

            setReceivingCall(true);
            setCaller(data.from);
            setCallerSignal(data.signal);
        })

    }, []);


    function callPeer(id) {
        console.log(id)
        const peer = new Peer({
          initiator: true,
          trickle: false,
         
          config: {

            iceServers: [
                {
                    urls: "stun:numb.viagenie.ca",
                    username: "sultan1640@gmail.com",
                    credential: "98376683"
                },
                {
                    urls: "turn:numb.viagenie.ca",
                    username: "sultan1640@gmail.com",
                    credential: "98376683"
                }
            ]
        },
   
          stream: stream,
        });

        console.log(peer)

        peer.on("signal", data => {
          console.log(data)
          socket.current.emit("callUser", { userToCall: id, signalData: data, from: yourID })
        })

        peer.on("stream", stream => {
          if (partnerVideo.current) {
            partnerVideo.current.srcObject = stream;
          }
        });

        socket.current.on("callAccepted", signal => {
          setCallAccepted(true);
          peer.signal(signal);
        })

    }
    let incomingCall;
    if (receivingCall) {
      incomingCall = (
        <div>
          <h1>{caller} is calling you</h1>
          <button onClick={acceptCall}>Accept</button>
        </div>
      )
    }

    return (
        <div>
            <h1>Your Video</h1>
            <Video playsInline ref={userVideo} autoPlay />
            <h1>Client Video</h1>
            <Video playsInline ref={partnerVideo} autoPlay />
            <button onClick={() => {
                electron.notificationApi.sendNotification('My custom notification!');
            }}>Notify</button>

            {Object.keys(users).map(key => {
                if (key === yourID) {
                    return null;
                }
                return (
                    <button id={`${key}`} onClick={() => callPeer(key)}>Call {key}</button>
                );
            })}
        </div>

    )

}
