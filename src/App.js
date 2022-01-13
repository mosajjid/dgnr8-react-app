import logo from './logo.svg';
import './App.css';
import {useEffect,useState} from 'react'
import {getNFTContract} from './helpers/getterFunctions'
import {deploySimpleErc721} from './helpers/setterFunctions'
import {connect} from "./helpers/currentWalletHelper"
import {contract} from './Config/contracts'
import dgnr8ABI from "./Config/abis/dgnr8.json"
import simpleERC721ABI from './Config/abis/simpleERC721.json'

import { ethers } from 'ethers';


function App() {
  const [contract,setContract]=useState();
  const [mintAddress,setMintAddress]=useState();
 
  useEffect(async() => {
    let cont=await getNFTContract("0xa625fb8aD73f2aA8a3D49067e1ccCac400f8679A",dgnr8ABI);
    setContract(cont)
    console.log("dddddd")
    readReceipt();
    await connect()
    
  }, [])


  const _deploySimpleErc721=(async(name,symbol,imgLink,royalty)=>{
    console.log("functon is called in app");
        let res=await deploySimpleErc721(name,symbol,imgLink,royalty);
        
        
  })
  const readReceipt = (async () => {
    let provider = new ethers.providers.Web3Provider(window.ethereum)
    const receipt = await provider.getTransactionReceipt("0x4d534fd7ffc990dc7b8c578495080b767ad8d980b50e4019b950254b23c63c95");
       if(receipt){
         setMintAddress(receipt.logs[0].address)
       }
    console.log(receipt.logs[0].address);
    
    // let iface = new ethers.utils.Interface(dgnr8ABI);
    // let log = iface.parseLog(receipt.logs[1]); // here you can add your own logic to find the correct log
    // console.log(log);
   })

  const _mint=(async()=>{
     let res=await getNFTContract(mintAddress,simpleERC721ABI.abi);
     console.log("mint address is---->",mintAddress)
     let nftmint=await res.mint('0x09b05f922a87e29874A6f04Cd809662daFCC2205',1)
     if(nftmint){
      console.log("nft is minted",nftmint);
     }
     
     

  })

  

  return (
    <div className="App">
     
        
       <button onClick={()=>{
            _deploySimpleErc721("MJ","MJJ","mjcom",1000)
       }}>Deploy Simple ERC 721</button>

<button onClick={()=>{
            _mint()
       }}>Create NFT</button>
      

    </div>
  );
}

export default App;
