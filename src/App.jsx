import React, { useState, useRef, useEffect } from 'react';
import jsQR from 'jsqr';

function App() {
  const [view, setView] = useState('main'); // 'main', 'scanning', 'input'
  const [qrCodeText, setQrCodeText] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (view === 'scanning') {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      const tick = () => {
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
          canvas.height = video.videoHeight;
          canvas.width = video.videoWidth;
          context.drawImage(video, 0, 0, canvas.width, canvas.height);

          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });

          if (code) {
            setQrCodeText(code.data);
            setView('result');
          } else {
            requestAnimationFrame(tick);
          }
        } else {
          requestAnimationFrame(tick);
        }
      };

      const startVideo = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
          video.srcObject = stream;
          video.play();
          requestAnimationFrame(tick);
        } catch (err) {
          console.error('Error accessing camera: ', err);
        }
      };

      startVideo();
    }
  }, [view]);

  const renderMainView = () => (
    <div className="flex flex-col items-center">
      <button
        className="bg-teal-500 text-white font-bold py-2 px-4 rounded-lg mb-4 hover:bg-teal-700"
        onClick={() => setView('scanning')}
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            setView('scanning');
          }
        }}
      >
        Start Scanning
      </button>
      <button
        className="bg-teal-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-teal-700"
        onClick={() => setView('input')}
      >
        Input Your Code
      </button>
    </div>
  );

  const renderScanningView = () => (
    <div className="flex flex-col items-center">
      <canvas ref={canvasRef} className="mt-8 border-2 border-orange-600 rounded-lg" />
      <video ref={videoRef} className="hidden"></video>
      <button
        className="bg-gray-500 text-white font-bold py-2 px-4 rounded-lg mt-4 hover:bg-gray-700"
        onClick={() => setView('main')}
      >
        Back
      </button>
    </div>
  );

  const renderInputView = () => (
    <div className="flex flex-col items-center">
      <input
        type="text"
        className="border border-gray-300 rounded-lg p-2 mb-4"
        placeholder="Enter your code"
        value={qrCodeText}
        onChange={(e) => setQrCodeText(e.target.value)}
      />
      <button
        className="bg-teal-500 text-white font-bold py-2 px-4 rounded-lg mb-4 hover:bg-teal-700"
        onClick={() => setView('result')}
      >
        Submit
      </button>
      <button
        className="bg-gray-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-700"
        onClick={() => setView('main')}
      >
        Back
      </button>
    </div>
  );

  const renderResultView = () => (
    <div className="flex flex-col items-center">
      <div className="mt-8 p-4 bg-white rounded-lg shadow-md text-center">
        <p className="font-bold">QR Code Data:</p>
        <p>{qrCodeText}</p>
      </div>
      <button
        className="bg-gray-500 text-white font-bold py-2 px-4 rounded-lg mt-4 hover:bg-gray-700"
        onClick={() => setView('main')}
      >
        Back
      </button>
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-gray-800">
      <h1 className="text-4xl font-bold mb-4 text-orange-600">Welcome to LockIt</h1>
      <p className="mb-8 text-xl">Press "Start Scanning" or "Enter" to scan your QR Code</p>
      {view === 'main' && renderMainView()}
      {view === 'scanning' && renderScanningView()}
      {view === 'input' && renderInputView()}
      {view === 'result' && renderResultView()}
    </div>
  );
}

export default App;

