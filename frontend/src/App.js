import "./App.css";
import { useEffect } from "react";

function App() {
  const isWalletConnected = async () => {
    const { solana } = window;
    try {
      if (solana) {
        if (solana.isPhantom) {
          console.log("phatom wallet found");
          const response = await solana.connect({ onlyIfTrusted: true });
          console.log(
            "connected with public key",
            response.publicKey.toString()
          );
        }
      } else {
        alert("Please connect you phantom wallet");
      }
    } catch (e) {
      console.error("Wallet Not connected");
    }
  };

  const connectWallet = async() => {}

  const renderNotConnectedComponent = () => {
     <button onClick={connectWallet }>Connect to Wallet</button>
  }

  useEffect(() => {
    const onLoad = async () => {
      await isWalletConnected();
    };
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  });

  return <div className="App">{renderNotConnectedComponent}</div>;
}

export default App;
