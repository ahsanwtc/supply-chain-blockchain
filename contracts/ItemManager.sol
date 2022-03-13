//SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;

import "./Item.sol";
import "./Ownable.sol";

contract ItemManager is Ownable {
    enum SupplyChain { Created, Paid, Delivered }

    struct S_Item {
        SupplyChain _step;
        string _identifier;
        Item _item;
    }

    mapping(uint => S_Item) public items;
    uint index;
    
    event SupplyChainStep(uint _itemIndex, uint _step, address _address);

    function createItem(string memory _identifier, uint _priceInWei) public  OnlyOwner {
        Item item = new Item(this, _priceInWei, index);
        items[index]._item = item;
        items[index]._step = SupplyChain.Created;
        items[index]._identifier = _identifier;
        emit SupplyChainStep(index, uint(SupplyChain.Created), address(item));
        index++;
    }

    function triggerPayment(uint _index) public payable {
        Item item = items[_index]._item;
        require(address(item) == msg.sender, "Only items are allowed to update themselves");
        require(item.priceInWei() == msg.value, "Not fully paid yet");
        require(items[_index]._step == SupplyChain.Created, "Item is further in the chain");
        items[_index]._step = SupplyChain.Paid;
        emit SupplyChainStep(_index, uint(SupplyChain.Paid), address(item));
    }

    function triggerDelivery(uint _index) public OnlyOwner {
        require(items[_index]._step == SupplyChain.Paid, "Item is further in the chain");
        items[_index]._step = SupplyChain.Delivered;
        emit SupplyChainStep(_index, uint(SupplyChain.Delivered), address(items[_index]._item));
    }

    function getAllItems() public view returns(S_Item[] memory) {
        S_Item[] memory _items = new S_Item[](index);
        for (uint i = 0; i < index; i++) {
            _items[i] = items[i];
        }
        return _items;
    }

}