import logo from './logo.svg';
import './App.css';
import { useEffect, useState } from 'react'
import { getContract } from './helpers/getterFunctions'
import { deploySimpleErc721 } from './helpers/setterFunctions'
import { connect } from "./helpers/currentWalletHelper"
import contracts from './Config/contracts'
import dgnr8ABI from "./Config/abis/dgnr8.json"
import simpleERC721ABI from './Config/abis/simpleERC721.json'
import marketplaceABI from './Config/abis/marketplace.json'
// import SignMessage from './SignMessage';


import { ethers } from 'ethers';


function App() {



  const [contract, setContract] = useState();
  const [mintAddress, setMintAddress] = useState(0);
  const [hash, setHash] = useState("")
  const [name, setName] = useState("")
  const [userSignature, setUserSignature] = useState([])
  const [account, setAccount] = useState()
  const [r, setR] = useState(0)


  var domain = [
    { name: "name", type: "string" },
    { name: "version", type: "string" },
    { name: "chainId", type: "uint256" },
    { name: "verifyingContract", type: "address" }
  ];

  var sellOrders = [
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
  ];

  const domainData = {
    name: "DecryptMarketplace",
    version: "1",
    chainId: 80001,  //configurable
    verifyingContract: contracts.MARKETPLACE, //marketPlace Address
  };


  var message = {
    user: account,
    tokenAddress:"0x0Eda1c15bD5319E5fbC5BDe3858E06e1B9457fe4",
    tokenId: '1',
    quantity: '1',
    listingType: '0',
    paymentToken: '0x0000000000000000000000000000000000000000',
    value: '1000000000000000000',
    deadline: '1639048490',
    bundleTokens: '0x0000000000000000000000000000000000000000000000000000000000000000',
    salt: '123',
  };

  var data = JSON.stringify({
    types: {
      EIP712Domain: domain,
      SellOrders: sellOrders,
    },
    domain: domainData,
    primaryType: "SellOrders",
    message: message
  });



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

  const signMessage = async () => {
    try {
      console.log({ message });
      if (!window.ethereum)
        throw new Error("No crypto wallet found. Please install it.");


      let address = await connect()
      var r, s, v;
      let signauteResult = await window.web3.currentProvider.sendAsync({
        method: "eth_signTypedData_v4",
        params: [address[0], data],
        from: address
      }, function (error, result) {
        if (error) {
          console.log(error)
        } else {
          const signature = result.result.substring(2);
          console.log("signature is ----->", signature)
          r = "0x" + signature.substring(0, 64);
          s = "0x" + signature.substring(64, 128);
          v = parseInt(signature.substring(128, 130), 16);
          console.log("r s and v is----->", r, s, v)
          let sig = [r, s, v];
          // setUserSignature(sig)
          localStorage.setItem('Signature', sig);
          if (sig) {
            
          }

          return sig
        }
      });

      let sig = [r, s, v];

      return {
        r,
        s,
        v
      };
    } catch (err) {
      console.log("error is--->", err.message);
    }
  };

  const buyersignMessage = async () => {
    try {
      console.log({ message });
      if (!window.ethereum)
        throw new Error("No crypto wallet found. Please install it.");


      let address = await connect()
      var r, s, v;
      let signauteResult = await window.web3.currentProvider.sendAsync({
        method: "eth_signTypedData_v4",
        params: [address[0], data],
        from: address
      }, function (error, result) {
        if (error) {
          console.log(error)
        } else {
          const signature = result.result.substring(2);
          console.log("signature is ----->", signature)
          r = "0x" + signature.substring(0, 64);
          s = "0x" + signature.substring(64, 128);
          v = parseInt(signature.substring(128, 130), 16);
          console.log("r s and v is----->", r, s, v)
          let sig = [r, s, v];
          localStorage.setItem('buyerSignature',sig)
          setUserSignature(sig)
          if (userSignature) {
            console.log("user signature----->", userSignature)
          }

          return sig
        }
      });

      let sig = [r, s, v];

      return {
        r,
        s,
        v
      };
    } catch (err) {
      console.log("error is--->", err.message);
    }
  };


  const _deploySimpleErc721 = (async (name, symbol, imgLink, royalty) => {
    console.log("functon is called in app");
    let res = await deploySimpleErc721(name, symbol, imgLink, royalty);

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
    let res = await getContract(maddress, simpleERC721ABI.abi);

    if (res) {
      console.log("simple erc721 contract is------->", res)
    }

    console.log("mint address is---->", maddress)
    localStorage.setItem("NFT",maddress)
    if (maddress != 0) {
      setMintAddress(maddress)
    }
    let approval = await res.setApprovalForAll(contracts.MARKETPLACE, true);
    if (approval) {
      console.log("approval for marketplace", approval)
    } else {
      console.log("approval didnt happen");
    }

    let nftmint = await res.mint(account, 1)
    if (nftmint) {
      console.log("nft is minted", nftmint);
      signMessage()
      
    }



  })

  const _buy=(async()=>{

    try{
      let marketPlaceContract=await getContract(contracts.MARKETPLACE,marketplaceABI.abi);
      console.log("marketplace contract is -------->",marketPlaceContract)
      
      let nft=localStorage.getItem('NFT')
      console.log("account and mintaddress is",account,nft,ethers.utils.formatUnits(ethers.utils.parseEther('1.0'), 18));
      let sellOrders=[
        account,
        "0x0Eda1c15bD5319E5fbC5BDe3858E06e1B9457fe4",
        1,1,0,
        '0x58De09Eb0CdB54D9861aC1B9c17B3325E8d36c03',1,1642464000,[],[],123]
      
      let sellerSign=localStorage.getItem('Signature')
      let buySign=localStorage.getItem('buyerSignature');

      const TIME = Math.round(new Date()/1000 + 3600);
      const sellerOrder = [
        account, "0x0Eda1c15bD5319E5fbC5BDe3858E06e1B9457fe4",
        1,1,0,
        '0x58De09Eb0CdB54D9861aC1B9c17B3325E8d36c03',
        ethers.utils.formatUnits(ethers.utils.parseEther('1.0'), 18),
        TIME-3700,[],[],Math.round(Math.random()*1000)
      ];
      
      console.log("SellerOder",sellerOrder);
      let comleteOrder=await marketPlaceContract.completeOrder(sellerOrder,sellerSign,sellerOrder,buySign);
      console.log("complete order function is ------->",comleteOrder)

     
    }catch(e){
      console.log("buy error is----->",e.message)
    }
  
  })



  return (
    <div className="App">





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



      <button onClick={() => {
        _deploySimpleErc721("MJ", "MJJ", "mjcom", 1000)
      }}>Deploy Simple ERC 721</button>

      <button onClick={() => {
        _mint()
      }}>Create NFT</button>

<button onClick={() => {
        buyersignMessage();
      }}>Create Signature for buyer</button>


      <button onClick={() => {
        _buy()
      }}>Buy NFT</button>


    </div>
  );
}

export default App;
