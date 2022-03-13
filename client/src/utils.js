import detectEthereumProvider from '@metamask/detect-provider';
import Web3 from 'web3';

import ItemManager from './contracts/ItemManager.json';
import Item from './contracts/Item.json';

export const getWeb3 = () => {
  return new Promise(async (resolve, reject) => {
    let provider = await detectEthereumProvider();    
    if (provider) {
      await provider.request({ method: 'eth_requestAccounts' });
      try {
        const web3 = new Web3(window.ethereum);
        resolve(web3);
      } catch(error) {
        reject(error);
      }
    } 
    
    reject('Install Metamask');    
  });
};

export const getContracts = async web3 => {
  const networkId = await web3.eth.net.getId();
  const itemManager = new web3.eth.Contract(ItemManager.abi, ItemManager.networks[networkId] && ItemManager.networks[networkId].address);
  const item = new web3.eth.Contract(Item.abi, Item.networks[networkId] && Item.networks[networkId].address);

  return { itemManager, item };
};

export const getItemContract = async ({ web3, address }) => new web3.eth.Contract(Item.abi, address);