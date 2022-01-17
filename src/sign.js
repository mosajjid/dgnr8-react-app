
  //Input custom values
  var message = {
    user: '0xD022311DAcaa30f8396cA9d2C4662a2eF083A1Dd',
    tokenAddress:'0x1F0Ad1F5280adF7AD971c0f911Cc1F7A882033C5',
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
  
  var r,s,v;
  window.web3.currentProvider.sendAsync({
    method: "eth_signTypedData_v4",
    params: [address, data],
    from: address
  }, function(error, result) {
    if (error) { 
      errorCallback(); 
    } else {
      const signature = result.result.substring(2);
       r = "0x" + signature.substring(0, 64);
       s = "0x" + signature.substring(64, 128);
       v = parseInt(signature.substring(128, 130), 16);
    }
  });
  let sig = [r, s, v];
  