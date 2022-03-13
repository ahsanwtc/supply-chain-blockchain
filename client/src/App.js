import React, { useEffect, useState } from 'react';
import { 
  Container, Typography, Box, CssBaseline, Divider, TextField, InputAdornment, Button, Alert, Stack, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper
} from '@mui/material';

import { getWeb3, getContracts, getItemContract } from './utils';

const STATUS = {
  0: 'Created',
  1: 'Paid',
  2: 'Delivered'
};

const App = () => {
  const [web3, setWeb3] = useState(undefined);
  const [contracts, setContracts] = useState(undefined);
  const [accounts, setAccounts] = useState([]);
  const [cost, setCost] = useState(0);
  const [identifier, setIdentifier] = useState('');
  const [error, setError] = useState(undefined);
  const [items, setItems] = useState([]);

  useEffect(() => {
    const init = async () => {
      const web3 = await getWeb3();
      const contracts = await getContracts(web3);
      const accounts = await web3.eth.getAccounts();

      setWeb3(web3);
      setAccounts(accounts);
      setContracts(contracts);
      
    };

    init();
  }, []);

  useEffect(() => {
    const init = async () => await fetchAllItems();
    if (web3 && contracts) {
      init();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [web3, contracts]);

  if (web3 === undefined || contracts === undefined || accounts.length === 0) {
    return (
      <div>Loading...</div>
    );
  }

  const handleButtonOnClick = async () => {
    setError(undefined);
    if (cost === 0 || identifier.length === 0) {
      setError('Please provide valid information.');
      return;
    }

    await contracts.itemManager.methods.createItem(identifier, cost).send({ from: accounts[0] });
    await fetchAllItems();
    setCost(0);
    setIdentifier('');
  };

  const fetchAllItems = async () => {
    const allItems = await contracts.itemManager.methods.getAllItems().call();
    const items = [];
    let index = 0;
    for (const item of allItems) {
      const i = await contracts.itemManager.methods.items(index).call();
      const itemAtAddress = await getItemContract({ web3, address: i._item });
      const cost = await itemAtAddress.methods.priceInWei().call();

      items.push({
        index,
        identifier: item._identifier,
        step: item._step,
        cost,
        address: item._item
      });
      index++;
    }

    setItems(items);
  };

  return (
    <React.Fragment>
      <CssBaseline />
      <Container sx={{ bgcolor: '#cfe8fc', height: '100vh' }}>
        <Typography variant="h4">Supply Chain Blockchain</Typography>
        <Typography variant="subtitle1">A simple project to implement supply chain in blockchain.</Typography>
        
        <Divider variant="middle" />
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', marginTop: '10px' }}>
          <Typography variant="h6">Items</Typography>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell align="right">Identifier</TableCell>
                  <TableCell align="right">Cost (wei)</TableCell>
                  <TableCell align="right">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map(item => (
                  <TableRow key={item.index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell component="th" scope="row">{item.address}</TableCell>
                    <TableCell align="right">{item.identifier}</TableCell>
                    <TableCell align="right">{item.cost}</TableCell>
                    <TableCell align="right">{STATUS[item.step]}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
        
        <Divider variant="middle" />
        
        <Stack sx={{ width: '100%', marginTop: '10px' }} spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}
        </Stack>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', marginTop: '20px' }}>
          <TextField
            label="Cost in Wei"            
            sx={{ m: 1, width: '25ch' }}
            InputProps={{
              startAdornment: <InputAdornment position="start">wei</InputAdornment>,
            }}
            onChange={e => setCost(e.target.value)}
            value={cost}
          />
          <TextField
            label="Item indentifier"            
            sx={{ m: 1, width: '75ch' }}
            InputProps={{
              startAdornment: <InputAdornment position="start">identifier</InputAdornment>,
            }}
            onChange={e => setIdentifier(e.target.value)}
            value={identifier}
          />
          <Button sx={{ m: 1, width: '25ch' }} variant="contained" onClick={handleButtonOnClick}>Create Item</Button>
        </Box>

      </Container>
    </React.Fragment>
  );
}

export default App;
