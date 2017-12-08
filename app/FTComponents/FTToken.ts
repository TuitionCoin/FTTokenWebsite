declare var scaleVideoContainer: any;
declare var rlp: any;
declare var numberToHex: any;
declare var EthJS: any;

import { Component, trigger, state, style, transition, animate, OnInit, AfterViewInit, OnDestroy, NgZone } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Router, ActivatedRoute } from '@angular/router';

import { FTBus } from '../FTFramework/FT-Bus';
import { FTCache } from '../FTFramework/FT-Cache';
import { FTSession } from '../FTFramework/FT-Session';
import { FTObserver } from '../FTFramework/FT-Observer';
/* ToDo: Each time you change tabs scroll to top */
@Component({
  moduleId: module.id,
  selector: 'ft-token',
  templateUrl: '../../html/token.html',
  animations: [trigger('visibilityChanged',[
    state('shownss',style({opacity:0,display:'none' })),
    state('hiddenss',style({opacity:1})),
    transition('*->*',animate('0s 0s')) //1s .25s would have a .25s delay
  ])]
})

export class FTToken {
  zone: NgZone;   
  name = "FinTechToken";
  visibility="hiddenss";
  modal = 0;
  subscribeParam;
  subscribeBlock;
  subscribeBNSec
  seconds=0;
  tabs = 1;
  number='';
  gotFree=false;
  zero="0000000000000000000000000000000000000000";
  maxGas=500000;
  fromAddress = "0000000000000000000000000000000000000000";
  wb3;
  token = {
    name: '' as string,
    mine:"",
    totalSupply:null,
    totalOutstanding:null,
    contract:{} as any,
    estimate:0,
    error:'',
    address: "9287bb21719d283CfdD7d644a89E8492f9845B64",
    abi:{} as any,
    serializedTx:{} as any,
    transaction: '',
    receipt: null as any,
    confirmed: 0,
    subscription: null as any
  }


  constructor( private bus: FTBus, private obs: FTObserver, private router: Router, private route: ActivatedRoute, private session: FTSession, private cache: FTCache, private http:Http )
  {   
    this.zone=new NgZone({enableLongStackTrace:false});//Zone used for old version of IPad. Doesn't update without it.
    this.session.getSession('user_id').subscribe(
          res => {
            if(+res>0) {//Signed In
              this.zone.run(()=>{
              });    
            }
            else {//Signed Out
              this.zone.run(()=>{
              });
            }
          }
        );
        this.bus.getBus().subscribe(
          res => {
            if( res.sender == 'ToDo: SigninOpenModule'){
            }
            if( res.sender=='ToDo: SigninClose'){
            }
          }
        );
  }

  getFreeToken(): void {
    var privateKey = Buffer.from(rlp.stripHexPrefix(this.cache.getCache('key')), 'hex');
    var ABIdata = this.token.contract.methods.getFreeToken().encodeABI();
    var chainId = "913945103463586943";
    this.wb3.eth.getTransactionCount('0x' + this.fromAddress).then( (nonce) => {
        const txData = {
            nonce:    numberToHex(nonce),
            gasPrice: '0x00',
            gasLimit: numberToHex(500000),
            to:       '0x' + this.token.address,
            value:    '0x00',
            data:     ABIdata,
            chainId:  chainId.toString()
        }
        var tx = new EthJS.Tx(txData);
        tx.sign(privateKey);
        this.token.serializedTx = tx.serialize();
        this.token.receipt = null;
        this.token.transaction = '';
        this.token.confirmed = 0;
        this.token.error = '';
        return null;
    });
    this.token.contract.methods.gotFree('0x'+this.fromAddress).call().then( (returns) => 
      this.gotFree = returns
    );
    this.token.contract.methods.getFreeToken().estimateGas({gas:500000,from:'0x'+this.fromAddress}).then( (returns) => {
      this.token.estimate = returns;
    });
    this.showModal(3);
  }

  getFreeTokenConfirm(): void {
    if(this.token.subscription){
      this.token.subscription.removeAllListeners();
    }
    this.token.subscription = this.wb3.eth.sendSignedTransaction('0x' + this.token.serializedTx.toString('hex'))
    .once('transactionHash', (hash) => { this.token.transaction = hash; })
    .once('receipt', (receipt) =>{ this.token.receipt = receipt;})
    .on('confirmation', (confNumber, receipt) => { this.token.confirmed = confNumber; })
    .on('error', (error) => { console.log('ERROR' + error); this.token.error = error;})
    this.showModal(4);
  }

  showModal(modal: number): void {
      this.modal = modal;
      let els = document.getElementsByClassName("modal-body");
      let x=(window.innerHeight-1)*1-100;
      for(let i = 0; i < els.length; i++)
      {
         let el:HTMLElement = els[i] as HTMLElement;
         el.style.height=x*.75+'px';
      }
  }

  ngOnInit(): void{ 
    if(!this.cache.getCache('key')){
      this.router.navigate(['/authenticate']);
    }

    this.subscribeParam = this.route.params.subscribe(params => {
      //params = the token passed in the route
      this.token.address = params['id'];
    });
    if(this.cache.getCache('encrypted_id')){
      this.fromAddress = this.cache.getCache('encrypted_id').address;
    }
    this.subscribeBNSec = this.obs.getObserver('blockSeconds').subscribe( (bnsec) => {
      this.seconds = bnsec;
    });
    scaleVideoContainer();
    this.wb3 = this.cache.getCache('wb3');
    this.token.abi = [{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"gotFree","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"success_","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalOutstanding","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"success_","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"getFreeToken","outputs":[{"name":"success_","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"author","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"success_","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"},{"name":"_extraData","type":"bytes"}],"name":"approveAndCall","outputs":[{"name":"success_","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"admin","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"}],"name":"unapprove","outputs":[{"name":"success_","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"owner","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Approval","type":"event"}];
    this.token.contract = new this.wb3.eth.Contract(this.token.abi, '0x' + this.token.address, {
      from: '0x' + this.fromAddress, // default from address
      gasPrice: '0' // default gas price in wei
    });
    this.getStrings();
  }    

viewNumber(number: string): void {
    this.number = number;
    this.showModal(1);
}

getEther(number:string): number{
  if(number.length > 18){
    return Math.floor(this.wb3.utils.fromWei(number,'ether'));
  }
  else {
    return 0;
  }
}
getFinney(number: string): number{
  if(number.length > 18){
    number = number.substr(number.length-18, 18);
  }
  if(number.length > 15){
    return +number.substr(0,number.length-15);
  } else {
    return 0;
  }
}
getSzabo(number: string): number{
  if(number.length > 15){
    number = number.substr(number.length-15, 15);
  }
  return Math.floor(this.wb3.utils.fromWei(number, 'szabo'));
}
getGwei(number: string): number{
  if(number.length > 12){
    number = number.substr(number.length-12, 12);
  }
  return Math.floor(this.wb3.utils.fromWei(number, 'gwei'));
}
getMwei(number: string): number{
  if(number.length > 9){
    number = number.substr(number.length-9, 9);
  }
  return Math.floor(this.wb3.utils.fromWei(number, 'mwei'));
}
getKwei(number: string): number{
  if(number.length > 6){
    number = number.substr(number.length-6, 6);
  }
  return Math.floor(this.wb3.utils.fromWei(number, 'kwei'));
}
getWei(number: string): number{
  if(number.length > 3){
    number = number.substr(number.length-3, 3);
  }
  return Math.floor(this.wb3.utils.fromWei(number, 'wei'));
}


  onResize(event: any):void {
    scaleVideoContainer();
  }

  ngAfterViewInit(): void{
    this.subscribeBlock = this.obs.getObserver('block').subscribe( (bn) => {
      this.token.contract.methods.totalSupply().call().then( 
        (result1) => {
          this.token.totalSupply = result1 == 0 ? 0 : result1;
        }
      );
      this.token.contract.methods.totalOutstanding().call().then( 
        (result2) => this.token.totalOutstanding = result2 == 0 ? 0 : result2
      );
      this.token.contract.methods.balanceOf(this.fromAddress).call().then( 
        (result3) => this.token.mine = result3 == 0 ? "0" : result3.toString()
      );
    });
  } 

  getStrings(): void{
    this.token.name = 'FreeToken';
  }
  ngDoCheck(): void{
  }
  changeTabs(tab:number): void{
    this.tabs = tab;
  }

  ngOnDestroy(){
    this.subscribeParam.unsubscribe();
    if(this.subscribeBNSec){
      this.subscribeBNSec.unsubscribe();
    }
    if(this.subscribeBlock){
      this.subscribeBlock.unsubscribe();
    }
    if(this.token.subscription){
      this.token.subscription.removeAllListeners();
    }
  }
}