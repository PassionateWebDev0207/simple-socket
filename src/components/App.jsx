import React, { useState, useEffect } from 'react';
import * as JsSIP from 'jssip';

const App = () => {
  const [phone, setPhone] = useState(null);
  const [user, setUser] = useState('');
  const [number, setNumber] = useState('');
  const [session, setSession] = useState(null);
  let audioEl = null;

  useEffect(() => {
    if (phone !== null) {
      console.log('>>>>>>>>>>>>>>>>>>>>>>>>>after phone', phone);
      phone.on('registrationFailed', (ev) => {
        alert('Registering on SIP server failed with error' + ev.cause);
      })
  
      phone.on('newRTCSession', (ev) => {
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>newRTCSession');
        if (session) {
          console.log('>>>>>>>>>>>>>>>>>>>>>>>>>terminate session');
          session.terminate();
        }
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>before session', ev.session);
        setSession(ev.session);
      });
  
      phone.start();
    }
  }, [phone, session, setSession]);

  useEffect(() => {
    if (session !== null) {
      if (session.direction === 'outgoing') {
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>stream outgoing');
        session.on('connecting', () => {
          console.log('>>>>>>>>>>>>>>>>>>>>>>>>>CONNECT'); 
        });
        session.on('peerconnection', (e) => {
          console.log('>>>>>>>>>>>>>>>>>>>>>>>>>outgoing peerconnection');
          session.connection.addEventListener('addstream', (e) => {
            audioEl.srcObject = e.stream;
            audioEl.play();
          }); 
        });
        session.on('ended', (e) => {
          console.log('>>>>>>>>>>>>>>>>>>>>>>>>>outgoing ended')
          setSession(null);
        });
        session.on('failed', (e) => {
          console.log('>>>>>>>>>>>>>>>>>>>>>>>>>outgoing failed')
          setSession(null);
        });
        session.on('accepted',(e) => {
          console.log('>>>>>>>>>>>>>>>>>>>>>>>>>outgoing accepted')
        });
        session.on('confirmed', (e) => {
          console.log('>>>>>>>>>>>>>>>>>>>>>>>>>outgoing CONFIRM STREAM');
        });
      }
      if (session.direction === 'incoming') {
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>stream incoming');
        session.on('connecting', () => {
          console.log('>>>>>>>>>>>>>>>>>>>>>>>>>CONNECT');
        });
        session.on('peerconnection', (e) => {
          console.log('>>>>>>>>>>>>>>>>>>>>>>>>>peerconnection');
          session.connection.addEventListener('addstream', (e) => {
            audioEl.srcObject = e.stream;
            audioEl.play();
          }); 
        });
        session.on('ended', (e) => {
          console.log('>>>>>>>>>>>>>>>>>>>>>>>>>ended')
          setSession(null);
        });
        session.on('failed', (e) => {
          console.log('>>>>>>>>>>>>>>>>>>>>>>>>>failed');
          setSession(null);
        });
        session.on('accepted', (e) => {
          console.log('>>>>>>>>>>>>>>>>>>>>>>>>>accepted')
        });
        session.on('confirmed', (e) => {
          console.log('>>>>>>>>>>>>>>>>>>>>>>>>>CONFIRM STREAM');
        });

        const options = {
          mediaConstraints : { audio: true, video: false }
        };
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>Incoming Call');
        session.answer(options);
      }
    }
  }, [session, setSession, audioEl])

  const handleRegistration = () => {
    if (user !== '') {
      const socket = new JsSIP.WebSocketInterface('wss://209.182.219.239:8089/ws');
      socket.via_transport = 'tcp';

      const config = {
        sockets: [ socket ],
        uri: 'sip:' + user + '@209.182.219.239:8089',
        password: 'pppassword',
      };

      JsSIP.debug.enable('JsSIP:*');
      setPhone(new JsSIP.UA(config));
    } else {
      alert('Please input username');
    }
  }

  const handleCall = () => {
    if (number !== '') {
      const options = {
        mediaConstraints : { audio: true, video: false }
      };
      console.log(number);
      phone.call('sip:' + number + '@209.182.219.239:8089', options)
    } else {
      alert('Please input number');
    }
  }

  return (
    <div className="app">
      <input type="text" onChange={(e) => setUser(e.target.value)} />
      <button
        className="btn-register"
        onClick={() => handleRegistration()}
      >
        Register
      </button>
      <input type="text" onChange={(e) => setNumber(e.target.value)} />
      <button
        className="btn-call"
        onClick={() => handleCall()}
      >
        Call
      </button>
      <audio ref={(audio) => {audioEl = audio}} id="audio-element" />
    </div>
  );
}

export default App;