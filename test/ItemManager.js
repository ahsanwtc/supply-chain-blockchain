const ItemManager = artifacts.require('ItemManager.sol');

contract('ItemManager', accounts => {
  let itemManager;

  beforeEach(async () => {
    itemManager = await ItemManager.new();
  });

  it('should create an item', async () => {
    const result = await itemManager.createItem('test', 100, { from: accounts[0] });
    assert.equal(result.logs[0].args._itemIndex, 0, "It's not the first item");

    const item = await itemManager.items(0);
    assert(item._identifier === 'test');
  });
});