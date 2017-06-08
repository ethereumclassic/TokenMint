import Immutable from 'immutable';
import { rpc } from '../lib/rpc';
import { generateTx } from '../lib/transaction';
import { functionToData } from '../lib/convert';


const IcoMachineAddress = "0x26c243b8a4a460a9bb20f3afcf127fa7dd764cfa";

const CreateTokenFunc = Immutable.fromJS({
    name:'createToken',
    inputs:[{ name:'initialSupply', type:'uint256' },
            { name:'tokenName', type:'string' },
            { name:'decimals', type:'uint8' },
            { name:'symbol', type:'string' }]
    });

const CreateSaleFunc = Immutable.fromJS({
    name:'Crowdsale',
    inputs:[{ name:'fundingGoal', type:'uint' },
            { name:'etherCostOfEachToken', type:'uint' }]
    });


const initialTx = {
    to: IcoMachineAddress,
    value: 0,
    gasLimit: null,
    gasPrice: null,
    nonce: null,
    data: '0x',
};

export function estimateTokenGas(token, wallet) {
    return (dispatch) => {
        const data = functionToData(CreateTokenFunc, 
            { initialSupply: token.totalSupply || 0, 
            tokenName: token.token || "elaine", 
            decimals: token.decimals,
            symbol: token.symbol });
        return rpc.call("eth_estimateGas", [{
            from: wallet.getAddressString(),
            to: IcoMachineAddress,
            data: data,
        }]).then((result) => {
            console.log(result);
            return result;
        });
    }
}

export function estimateIcoGas(ico, wallet) {
    const addr =  wallet.getAddressString();
    return (dispatch) => {
        const data = functionToData(CreateSaleFunc, 
            { fundingGoal: ico.fundingGoal,
                etherCostOfEachToken: ico.price });
        return rpc.call("eth_estimateGas", [{
            from: addr,
            to: IcoMachineAddress,
            data: data,
        }]).then((result) => {
            console.log(result);
            return result;
        });
    }
}

export function generateTokenTransaction(token, wallet) {
    const addr = wallet.getAddressString();
    const data = functionToData(CreateTokenFunc, 
            { initialSupply: token.totalSupply || 0, 
            tokenName: token.token || "elaine", 
            decimals: token.decimals,
            symbol: token.symbol });
    const tx = Object.assign(initialTx, { 
        gasLimit: token.gasLimit,
        data: data,
        from: addr });
    return (dispatch, getState) => {
        const transaction = getState().transaction;
        if (!transaction.get('busy')) {
            tx.gasPrice = transaction.get('data').get('gasPrice');
            tx.nonce = transaction.get('data').get('nonce');
        }
        return generateTx(tx, wallet.getPrivateKey()).then((result) => {
            dispatch({
                type: 'TRANSACTION/GENERATE',
                raw: result.rawTx,
                signed: result.signedTx,
            });
            return result;
        });
    }
}

export function generateIcoTransaction(ico, wallet) {
    const addr = wallet.getAddressString();
    const data = functionToData(CreateSaleFunc, 
            { fundingGoal: ico.fundingGoal,
                etherCostOfEachToken: ico.price });
    const tx = Object.assign(initialTx, { 
        gasLimit: ico.gasLimit,
        data: data,
        from: addr });
    return (dispatch, getState) => {
        const transaction = getState().transaction;
        if (!transaction.get('busy')) {
            tx.gasPrice = transaction.get('data').get('gasPrice');
            tx.nonce = transaction.get('data').get('nonce');
        }
        return generateTx(tx, wallet.getPrivateKey()).then((result) => {
            dispatch({
                type: 'TRANSACTION/GENERATE',
                raw: result.rawTx,
                signed: result.signedTx,
            });
            return result;
        });
    }
}


export function createToken(token) {
    return (dispatch) => {
        dispatch({
            type: 'TOKEN/CREATE', 
            token,
        });
    }
}


export function createIco(ico) {
    return (dispatch) => {
        dispatch({
            type: 'TOKEN/ICO', 
            ico,
        });
    }
}
