import logo from './logo.svg';
import './App.css';
import { useEffect, useState } from 'react'
import { getContract } from './helpers/getterFunctions'
import { deploySimpleErc721,deploySimpleErc1155 } from './helpers/setterFunctions'
import { connect } from "./helpers/currentWalletHelper"
import contracts from './Config/contracts'
import dgnr8ABI from "./Config/abis/dgnr8.json"
import simpleERC721ABI from './Config/abis/simpleERC721.json'
import simpleERC1155ABI from './Config/abis/simpleERC1155.json'
import marketplaceABI from './Config/abis/marketplace.json'
import { BigNumber } from 'ethers';


// import SignMessage from './SignMessage';


import { ethers } from 'ethers';


function App() {

  const ethereum = window.ethereum;

  const [contract, setContract] = useState();
  const [mintAddress, setMintAddress] = useState(0);
  const [hash, setHash] = useState("")
  const [nftName, setNftName] = useState("")
  const [symbol,setSymbol]=useState("")
  const [imgLink,setImgLink]=useState("")
  const [royalty,setRoyalty]=useState(0)
  const [userSignature, setUserSignature] = useState([])
  const [account, setAccount] = useState()
  const [r, setR] = useState(0)

  const [domainName, setDomainName] = useState("Decrypt Marketplace");
  const [domainVerifyingContract, setDomainVerifyingContract] = useState("0x8F2910773e07CC0bcd333F81DAF5e2B3abA4F06A");
  const [domainVerifyingContractVersion, setDomainVerifyingContractVersion] = useState("1");

  const [name, setName] = useState("0xe900960bd85db6469a0b32f455b6bf26b1709fab");
  const [tokenAddress, setTokenAddress] = useState("0x86c4fe7e54f4dd606d4e8a79855da6d82b9eeb92");
  const [tokenId, setTokenId] = useState(1);
  const [quantity, setQuantity] = useState(1);
  const [listingType, setListingType] = useState(0);
  const [paymentToken, setPaymentToken] = useState("0x9d39d84bfe2009749610a53014e7d5022331fded");
  const [value, setValue] = useState(1000000000000000);
  const [deadline, setDeadline] = useState(1646114315);
  const [bundleTokens, setBundleTokens] = useState("0x0000000000000000000000000000000000000000000000000000000000000000");
  const [salt, setSalt] = useState(456);
  const [r1, setR1] = useState();
  const [s, setS] = useState();
  const [v, setV] = useState();

  const [signature, setSignature] = useState();

  const [chainId, setChainId] = useState("not connected");
  const [recoveredAddress, setRecoveredAddress] = useState();


  const toTypedOrder = (
    userAddress, tokenAddress, id, quantity, listingType, paymentTokenAddress, valueToPay, deadline, bundleTokens, bundleTokensQuantity, salt
) => {
    const domain = {
        chainId: 80001,
        name: 'Decrypt Marketplace',
        verifyingContract:contracts.MARKETPLACE,
        version: '1',
    };

    const types = {
        Order: [
            { name: 'user', type: 'address' },
            { name: 'tokenAddress', type: 'address' },
            { name: 'tokenId', type: 'uint256' },
            { name: 'quantity', type: 'uint256' },
            { name: 'listingType', type: 'uint256' },
            { name: 'paymentToken', type: 'address' },
            { name: 'value', type: 'uint256' },
            { name: 'deadline', type: 'uint256' },
            { name: 'bundleTokens', type: 'bytes32' },
            { name: 'salt', type: 'uint256' },
        ],
    };

    //hashing array of tokens IDs + array of tokens quantities
    //same as keccak256(abi.encodePacked( <array> ))
    let bundleTokensHash;
    if(bundleTokens.length === 0){
        bundleTokensHash = '0x0000000000000000000000000000000000000000000000000000000000000000';
    }
    else{
        const typesArray = new Array(bundleTokens.length).fill('uint256');
        const indexHash = ethers.utils.solidityKeccak256(typesArray,bundleTokens);
        const arrayHash = ethers.utils.solidityKeccak256(typesArray,bundleTokensQuantity);
        bundleTokensHash = ethers.utils.solidityKeccak256(['bytes32','bytes32'],[indexHash,arrayHash]);
    }
    const TIME = Math.round(new Date()/1000 + 3600000);
    const value = {
        user: userAddress,
        tokenAddress: tokenAddress,
        tokenId: id,
        quantity: quantity,
        listingType: listingType,
        paymentToken:paymentTokenAddress,
        value:valueToPay,
        deadline: deadline,
        bundleTokens: bundleTokensHash,
        salt: salt,
    };

    return { domain, types, value };
}
  

  const getSignature = async (signer,...args) => {
    const order = toTypedOrder(...args);
    let provider = new ethers.providers.Web3Provider(window.ethereum)

      const signer1 =  provider.getSigner()
      //console.log("signer is------>",signer1)

    const signedTypedHash =  await signer1._signTypedData(
        order.domain,
        order.types,
        order.value
    );
    const sig = ethers.utils.splitSignature(signedTypedHash);

    return [sig.v, sig.r, sig.s];
}

const getHashedTypedData = async (...args) => {
  const order = toTypedOrder(...args)

  return ethers.utils._TypedDataEncoder.hash(
      order.domain,
      order.types,
      order.value
  );
}


  useEffect(async () => {
    let cont = await getContract(contracts.NFT, dgnr8ABI);
    setContract(cont)
    console.log("dddddd")
    // _buy()


    let acc = await connect();

    if (acc) {
      setAccount(acc[0])

      console.log("account is ------->", account)
    }

  }, [account])

  

  const _deploySimpleErc721 = (async () => {
    console.log("functon is called in app");
    console.log(nftName,symbol,imgLink,royalty);
    let res = await deploySimpleErc721(nftName, symbol, imgLink, royalty);
   
    setHash(res)
  })


  const _deploySimpleErc1155=(async()=>{
    let res=await deploySimpleErc1155(imgLink,royalty);
    
    setHash(res)
  })

  const readReceipt = (async () => {
    let provider = new ethers.providers.Web3Provider(window.ethereum)
    console.log("hash value is------->", hash)
    const receipt = await provider.getTransactionReceipt(hash);
    if (receipt) {
      setMintAddress(receipt.logs[0].address)
      console.log("mint contract address is----->", receipt.logs[0].address)
    }
    console.log(receipt.logs[0].address);


    return receipt.logs[0].address
    // console.log(log);
  })

  const _mint = (async () => {
    let maddress = await readReceipt()
    let res = await getContract(maddress, simpleERC1155ABI.abi);


    if (res) {
      console.log("simple erc1155 contract is------->", res)
    }

    
   
    let approval = await res.setApprovalForAll(contracts.MARKETPLACE, true);
    if (approval) {
      console.log("approval for marketplace", approval)
    } else {
      console.log("approval didnt happen");
    }

    let nftmint = await res.mint(account,1,10)
    console.log("accout in mint is---->",account)
    console.log("nft mint variable--->",nftmint)
   
    if (nftmint) {
      
      console.log("nft is minted", nftmint);
     
      
    }



  })





  const _buy=(async()=>{

    try{
      let marketPlaceContract=await getContract(contracts.MARKETPLACE,marketplaceABI.abi);
      console.log("marketplace contract is -------->",marketPlaceContract)
      
      let nft=localStorage.getItem('NFT')
      console.log("account and mintaddress is",account,nft);
    
      
      

      const TIME = Math.round(new Date()/1000 + 3600000);
     
      const sellerOrder = [
        "0x09b05f922a87e29874A6f04Cd809662daFCC2205","0xEB1cA040A851982Fd06E9ce1A747E6305ff9c839",
        1,1,0,
        "0x9d39D84Bfe2009749610A53014e7d5022331FDEd",0,
       deadline,[],[],salt
      ];
      // let sellerSignNew = await getSignature("0x09b05f922a87e29874A6f04Cd809662daFCC2205",...sellerOrder);
      // console.log("sellere sign is",sellerSignNew)
    

      const buyerOrder = [
        account,"0xEB1cA040A851982Fd06E9ce1A747E6305ff9c839",
        1,1,0,
        "0x9d39D84Bfe2009749610A53014e7d5022331FDEd",0,
       deadline,[],[],salt
      ];
     
      

     
     
      let sellerSignNew = [28, '0x32c82f0f79ffdf6e87ce3ce9e84bdf89505921d187ac94f608bb98572d83de49', '0x46f67aeed6c36a83ecc29d783e76d6a4591e3e994ac9d82a7cbef5c0dd19c880'];

    
      console.log("seller sig new",sellerSignNew)

    
     
     console.log("seller sign and buy sign",sellerSignNew)
      
      console.log("marketplace address",marketPlaceContract);
      const options = {
        from: account,
        gasPrice: 10000000000,
        gasLimit: 9000000,
        value: ethers.utils.parseEther("0.1")
      }
      
      

      let completeOrder= await marketPlaceContract.completeOrder(sellerOrder,sellerSignNew,buyerOrder,sellerSignNew,options);
      console.log("complete order function is ------->",completeOrder)

     
    }catch(e){
      console.log("buy error is----->",e)
    }
  
  })



  return (
    <div className="App">


   


      <label>
        Name:
        <input type="text" name="name" onChange={(e)=>{
          console.log(e.target.value)
          setNftName(e.target.value)
        }} />
      </label>


      <label>
        Symbol:
        <input type="text" name="name" onChange={(e)=>{
          setSymbol(e.target.value)
        }} />
      </label>


      <label>
        image-link:
        <input type="text" name="name"
         onChange={(e)=>{
          setImgLink(e.target.value)
        }} />
      </label>


      <label>
        Royalty:
        <input type="text" name="name" 
        onChange={(e)=>{
          let no=e.target.value;
          no=parseInt(no)*100;
          console.log(
            "no is",no
          )
          setRoyalty(no)
        }}/>
      </label>


     



      <button onClick={() => {
        _deploySimpleErc1155()
      }}>Deploy Simple ERC 1155</button>

      <button onClick={() => {
        _mint()
      }}>Create NFT</button>

{/* <button onClick={() => {
        buyersignMessage();
      }}>Create Signature for buyer</button> */}


      <button onClick={() => {
        _buy()
      }}>Buy NFT</button>


    </div>
  );
}

export default App;
