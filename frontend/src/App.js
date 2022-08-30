import "./App.css";
import { useEffect,useState } from "react";
import idl from "./idl.json"
import {clusterApiUrl,PublicKey, Connection} from "@solana/web3.js";
import {
	Program,
	AnchorProvider,
	web3,
	utils,
	BN,
} from "@project-serum/anchor";
import {Buffer} from 'buffer';
window.Buffer =  Buffer;

const programId = new PublicKey(idl.metadata.address);
const network = clusterApiUrl("devnet"); 
const opts = {
 preflightCommitment: "processed",
}

function App() {
  const [walletAddress,setWalletAddress] = useState(null);
  const [campaigns, setCampaings] = useState([]);


  const { SystemProgram} = web3
  const getProvider = async() => {
    const connection = new Connection(network,opts.preflightCommitment);
    const provider = new AnchorProvider(connection, window.solana,opts.preflightCommitment );
    return provider;
  }

  const getCampaign = async() => {
    try{
      const connection = new Connection(network,opts.preflightCommitment);
      const provider = await getProvider();
      const program = new Program(idl,programId,provider);
      Promise.all((await connection.getProgramAccounts(programId)).map(async (campaign)=>({
        ...(await program.account.campaign.fetch(campaign.pubkey)), 
        pubkey: campaign.pubkey,
      })) ).then((campaigns) => setCampaings(campaigns));  
      console.log(campaign);
    }catch(e){
      console.log(e);
    }
  }

  const campaign = async() => {
    try{
      const provider = await getProvider();
    const program = new Program(idl,programId,provider);
    const [campaign] = await PublicKey.findProgramAddressSync([
      utils.bytes.utf8.encode("CAMPAIN_DEMO"),
      provider.wallet.publicKey.toBuffer(),
    ],program.programId);
    console.log(provider.wallet.publicKey.toString())
    await program.rpc.create("Billionaire","Airdroping billions",{accounts:{
      campaign,
      user:provider.wallet.publicKey,
      systemProgram: SystemProgram.programId,
    }});

    console.log("Created a new campaign")
    console.log(campaign.toString());
    }catch(err){
      console.log("Error creating campaign account",err);
    }
    
  }
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
          setWalletAddress(response.publicKey.toString());
        }
      } else {
        alert("Please connect you phantom wallet");
      }
    } catch (e) {
      console.error("Wallet Not connected");
    }
  };

  const connectWallet = async() => {

    const {solana} = window;
    try{
      if(solana){
        if(solana.isPhantom){
          console.log("phatom wallet found");
         const response = await  solana.connect()
         setWalletAddress(response.publicKey.toString());
        }
       

      }else{
        alert("Please connect you phantom wallet");
      }
    }catch(err){
      console.log(err);
    } 
  }

  const renderNotConnectedComponent = () => (
     <button onClick={connectWallet}>Connect to Wallet</button>
  );

  const renderConnectedComponent = () => (
    <>
        <button onClick={campaign}>Create a campaign</button>
        <button onClick={getCampaign}>Get Campaigns</button>
        <br />
        {campaigns.map((campaign) => (
          <>
          <p>Program Id: {campaign.pubkey.toString()}</p>
          <p>Amount: {(campaign.amountDonated/web3.LAMPORTS_PER_SOL).toString()}</p>
          <p>{campaign.name}</p>
          <p>{campaign.description}</p>
          <br />
          </>
        ),)}
    </>
 );

  useEffect(() => {
    const onLoad = async () => {
      await isWalletConnected();
    };
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  return <div className="App"><h1>{!walletAddress && renderNotConnectedComponent()}{walletAddress && renderConnectedComponent()}</h1></div>;
}

export default App;
