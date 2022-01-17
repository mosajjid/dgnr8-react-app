import logo from './logo.svg';
import './App.css';
import {useEffect,useState} from 'react'
import {getNFTContract} from './helpers/getterFunctions'
import {deploySimpleErc721} from './helpers/setterFunctions'
import {connect} from "./helpers/currentWalletHelper"
import contracts from './Config/contracts'
import dgnr8ABI from "./Config/abis/dgnr8.json"
import simpleERC721ABI from './Config/abis/simpleERC721.json'
import SignMessage from './SignMessage';


import { ethers } from 'ethers';


function App() {
  const [contract,setContract]=useState();
  const [mintAddress,setMintAddress]=useState("");
  const [hash,setHash]=useState("")
  const [name,setName]=useState("")
  const [signature,setSignature]=useState("")
  const [account,setAccount]=useState()
  
  
 
  useEffect(async() => {
    let cont=await getNFTContract(contracts.NFT,dgnr8ABI);
    setContract(cont)
    console.log("dddddd")
    
    let account=await connect();
    console.log("account is ------->",account)
    if(account){
      setAccount(account)
    }
    
  }, [account,contract])


  const _deploySimpleErc721=(async(name,symbol,imgLink,royalty)=>{
    console.log("functon is called in app");
        let res=await deploySimpleErc721(name,symbol,imgLink,royalty);

        setHash(res)
        
        
  })
  const readReceipt = (async () => {
    let provider = new ethers.providers.Web3Provider(window.ethereum)
    console.log("hash value is------->",hash)
    const receipt = await provider.getTransactionReceipt(hash);
       if(receipt){
         setMintAddress(receipt.logs[0].address)
         console.log("mint contract address is----->",receipt.logs[0].address)
       }
    console.log(receipt.logs[0].address);
    
    // let iface = new ethers.utils.Interface(dgnr8ABI);
    // let log = iface.parseLog(receipt.logs[1]); // here you can add your own logic to find the correct log
    return receipt.logs[0].address
    // console.log(log);
   })

  const _mint=(async()=>{
       let maddress=  await readReceipt()
     let res=await getNFTContract(maddress,simpleERC721ABI.abi);
     
     if(res){
      console.log("simple erc721 contract is------->",res)
     }
     
     console.log("mint address is---->",maddress)
     let approval=await res.setApprovalForAll(contracts.MARKETPLACE,true);
     if(approval){
      console.log("approval for marketplace",approval)
     }else{
       console.log("approval didnt happen");
     }
    
     let nftmint=await res.mint('0x09b05f922a87e29874A6f04Cd809662daFCC2205',1)
     if(nftmint){
      console.log("nft is minted",nftmint);
     }
     
     

  })

  

  return (
    <div className="App">

      <SignMessage/>



<label>
    Name:
    <input type="text" name="name" />
  </label>
  

  <label>
    Symbol:
    <input type="text" name="name" />
  </label>
 

  <label>
    image-link:
    <input type="text" name="name" />
  </label>
 

  <label>
    Royalty:
    <input type="text" name="name" />
  </label>
 

  <label>
    NFT Quantity:
    <input type="text" name="name" />
  </label>

     
        
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
