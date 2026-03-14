import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';
import CallOverlay from '../components/chat/CallOverlay';

const CallContext = createContext();

export function useCall() {
  return useContext(CallContext);
}

export function CallProvider({ children }) {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [callState, setCallState] = useState('idle'); // idle, dialing, incoming, active
  const [incomingCallData, setIncomingCallData] = useState(null);
  const [activeCallPeer, setActiveCallPeer] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [peerConnection, setPeerConnection] = useState(null);
  const [activeCallMatchId, setActiveCallMatchId] = useState(null);
  const [activeCallType, setActiveCallType] = useState(null);
  const [callStartTime, setCallStartTime] = useState(null);

  const pcRef = useRef(null);
  const iceCandidateQueue = useRef([]);

  const ICE_SERVERS = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  };

  useEffect(() => {
    if (!socket) return;

    socket.on('incoming_call', ({ from, fromUser, offer, type, matchId }) => {
      if (callState !== 'idle') {
        socket.emit('reject_call', { to: from });
        return;
      }
      setCallState('incoming');
      setIncomingCallData({ from, fromUser, offer, type, matchId });
      setActiveCallPeer(from);
      setActiveCallMatchId(matchId);
      setActiveCallType(type);
    });

    socket.on('call_accepted', async ({ from, answer }) => {
      if (pcRef.current) {
        try {
          await pcRef.current.setRemoteDescription(answer);
          setCallState('active');
          setCallStartTime(Date.now());
          toast.success('Call Connected');
          processIceQueue();
        } catch (err) {
          console.error('Error setting remote description on accept:', err);
          toast.error('Connection failed');
          endCall();
        }
      }
    });

    socket.on('call_rejected', () => {
      toast.error('Call Rejected');
      endCall();
    });

    socket.on('ice_candidate', async ({ from, candidate }) => {
      if (pcRef.current && pcRef.current.remoteDescription) {
        try {
          await pcRef.current.addIceCandidate(candidate);
        } catch (e) {
          console.error('Error adding ice candidate', e);
        }
      } else {
        iceCandidateQueue.current.push(candidate);
      }
    });

    socket.on('call_ended', () => {
      toast('Call Ended');
      cleanupCall();
    });

    return () => {
      socket.off('incoming_call');
      socket.off('call_accepted');
      socket.off('call_rejected');
      socket.off('ice_candidate');
      socket.off('call_ended');
    };
  }, [socket, callState]);

  const createPeerConnection = (targetId) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice_candidate', { to: targetId, candidate: event.candidate });
      }
    };

    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    pcRef.current = pc;
    setPeerConnection(pc);
    return pc;
  };

  const startCall = async (otherUserId, type = 'video', matchId) => {
    try {
      setCallState('dialing');
      setActiveCallPeer(otherUserId);
      setActiveCallMatchId(matchId);
      setActiveCallType(type);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true, 
        video: type === 'video' 
      });
      setLocalStream(stream);

      const pc = createPeerConnection(otherUserId);
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit('call_user', { to: otherUserId, offer, type, matchId });
    } catch (err) {
      console.error(err);
      toast.error('Media Access Denied');
      setCallState('idle');
    }
  };

  const acceptCall = async () => {
    try {
      if (!incomingCallData) throw new Error('No incoming call data');
      const { from, offer, type } = incomingCallData;
      
      console.log('Accepting call:', { from, type });
      
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          audio: true, 
          video: type === 'video' 
        });
      } catch (mediaErr) {
        console.error('Initial getUserMedia failed:', mediaErr);
        if (type === 'video') {
          try {
            console.log('Attempting fallback to audio-only');
            stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            toast('Video failed, starting with audio only');
          } catch (audioErr) {
            console.error('Audio-only fallback also failed:', audioErr);
            throw new Error('Camera and Microphone access denied or not found');
          }
        } else {
          throw new Error('Microphone access denied or not found');
        }
      }
      
      setLocalStream(stream);

      const pc = createPeerConnection(from);
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      await pc.setRemoteDescription(offer);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit('accept_call', { to: from, answer });
      setCallState('active');
      setCallStartTime(Date.now());
      
      // Process queued ice candidates
      processIceQueue();
    } catch (err) {
      console.error('Failed to answer call:', err);
      toast.error(`Failed to answer: ${err.message || 'Unknown error'}`);
      rejectCall();
    }
  };

  const processIceQueue = () => {
    if (pcRef.current && pcRef.current.remoteDescription) {
      console.log(`Processing ${iceCandidateQueue.current.length} queued candidates`);
      iceCandidateQueue.current.forEach(async (candidate) => {
        try {
          await pcRef.current.addIceCandidate(candidate);
        } catch (e) {
          console.error('Error adding queued ice candidate', e);
        }
      });
      iceCandidateQueue.current = [];
    }
  };

  const rejectCall = () => {
    if (incomingCallData) {
      socket.emit('reject_call', { 
        to: incomingCallData.from, 
        matchId: incomingCallData.matchId,
        type: incomingCallData.type
      });
    }
    cleanupCall();
  };

  const endCall = () => {
    if (activeCallPeer) {
      const duration = callStartTime ? Math.floor((Date.now() - callStartTime) / 1000) : 0;
      socket.emit('end_call', { 
        to: activeCallPeer, 
        matchId: activeCallMatchId,
        type: activeCallType,
        status: callState === 'active' ? 'ended' : 'missed',
        duration
      });
    }
    cleanupCall();
  };

  const cleanupCall = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (pcRef.current) {
      pcRef.current.close();
    }
    pcRef.current = null;
    iceCandidateQueue.current = [];
    setLocalStream(null);
    setRemoteStream(null);
    setCallState('idle');
    setIncomingCallData(null);
    setActiveCallPeer(null);
    setActiveCallMatchId(null);
    setActiveCallType(null);
    setCallStartTime(null);
    setPeerConnection(null);
    setIsAudioMuted(false);
    setIsVideoMuted(false);
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoMuted(!videoTrack.enabled);
      }
    }
  };

  return (
    <CallContext.Provider value={{ startCall, acceptCall, rejectCall, endCall, callState, incomingCallData }}>
      {children}
      <CallOverlay 
        callState={callState}
        incomingCallData={incomingCallData}
        onAccept={acceptCall}
        onReject={rejectCall}
        onEnd={endCall}
        localStream={localStream}
        remoteStream={remoteStream}
        onToggleAudio={toggleAudio}
        onToggleVideo={toggleVideo}
        isAudioMuted={isAudioMuted}
        isVideoMuted={isVideoMuted}
      />
    </CallContext.Provider>
  );
}
