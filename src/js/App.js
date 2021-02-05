
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
const Container = styled.div`
  height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const Row = styled.div`
  display: flex;
  width: 100%;
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


   
  function acceptCall() {
    setCallAccepted(true);
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream,
    });
    peer.on("signal", data => {
      socket.current.emit("acceptCall", { signal: data, to: caller })
    })

    peer.on("stream", stream => {
      partnerVideo.current.srcObject = stream;
    });

    peer.signal(callerSignal);
  }


    function callPeer(id) {
        console.log(id)
        const peer = new Peer({
          initiator: true,
          trickle: false,
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
    let logs = true;
    let UserVideo;
    if (logs) {
      UserVideo = (
        <Video playsInline muted ref={userVideo} autoPlay />
      );
    }
  
    let PartnerVideo;
    if (callAccepted) {
      PartnerVideo = (
        <Video playsInline ref={partnerVideo} autoPlay />
      );
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
        // <div>
        //     <h1>Your Video</h1>
        //     {UserVideo}
        //     <h1>Client Video</h1>
        //     {PartnerVideo}
        //     <button onClick={() => {
        //         electron.notificationApi.sendNotification('My custom notification!');
        //     }}>Notify</button>

        //     {Object.keys(users).map(key => {
        //         if (key === yourID) {
        //             return null;
        //         }
        //         return (
        //             <button id={`${key}`} onClick={() => callPeer(key)}>Call {key}</button>
        //         );
        //     })}

        //     {incomingCall}
        // </div>

        <Container>
        <Row>
          {UserVideo}
          {PartnerVideo}
        </Row>
        <Row>
          {Object.keys(users).map(key => {
            if (key === yourID) {
              return null;
            }
            return (
              <button key={`${key}`} onClick={() => callPeer(key)}>Call {key}</button>
            );
          })}
        </Row>
        <Row>
          {incomingCall}
        </Row>
      </Container>

    )

}
