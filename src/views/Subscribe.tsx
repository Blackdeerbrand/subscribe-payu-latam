import React, {useState, useEffect} from 'react'
import Visa from '../assets/pay_visa.png'
import MasterCard from '../assets/pay_mastercard.png'
import PayU from '../assets/PAYU_logo.png'
import { useForm } from 'react-hook-form'
import { APIGeneral } from '../API'
import { Grid } from '@material-ui/core'
import axios from 'axios'
import md5 from 'md5'
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { countries } from '../components/CountrySelect'
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import '../styles/generalstyles.css'
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import NumberFormat from 'react-number-format';
import Swal from 'sweetalert2'
import Logo from '../assets/Logo.png'
export{}


/* 

      It will be actualized for 2021 September

      SUSCRIPTION LATAM

      Hi developer, here are we going to explain how all the form of suscription from PayU ("Pagos Recurrentes" in Spanish)

      !IMPORTANT => Before all this process, it's important that you have an account in the PayU page
      !IMPORTANT => Also we will only working with VISA and MASTERCARD credit/debit cards (I will actualize in the future)
      !IMPORTANT => This form only works for Colombia, for other countries is similar but asks from a couple of additional variables

      So, let's begin!

      PayU ask you for a form with the next elements:

      - ID
      - fullName
      - Email
      - Phone
      - DNI (national identity card or in Spanish ""Documento nacional de identidad")
      - Address
      - Country
      - City
      - (OPTIONAL)Address 2
      - (OPTIONAL)Phone 2
      - (OPTIONAL)Postal Code

      Credit Card / Debit Card

      - fullName
      - Number
      - Month/Year
      - CVV

      !IMPORTANT => The form ID it's REALLY important, you can create as you want but that means that everytime it renders has a different ID
      It's important for this case: suppose that you fill that form and it fails for any reason (Example: Invalid credit card number or CVV) that form
      DOESN'T WORK ANYMORE because you already used that ID you must reload the page and re-fill that form with a NEW ID.

      So, I give the data, how does it works?

      PayU divides in four parts:

      Plan - Client - CreditCard / Tokenize - Suscription

      1. Plan => The suscription Plan (Price, for how long is valid, etc.)
      2. Client => The data of the client (for minimum, fullName and email)
      3. Credit Card / Tokenize => The data of the credit card and encrypt of the same (Number, CVV, Month/Year)
      4. Suscription => Action of subscribe a Client with a Credit Card to a certain Plan (The combination of the three other steps)
      5. (OPTIONAL)Additional Values => If you want to add more cost to the main plan (It's more used in cases of shipping products)
      6. (OPTIONAL)Invoice => Payment Data

      From the CRUD system of PayU, we are only going to see the CREATE part, because for the others we need that you have some ID's that PayU gives to you

      But....I do not leave you without information 

      http://developers.payulatam.com/es/api/recurring_payments.html Here you can find all the data of the CRUD in general. Once you do the CREATE part all becomes more easy
      http://developers.payulatam.com/es/web_checkout/integration.html At the end of the page, you can see a little app that works with the algorithm MD5 (It will be explained later)
      Let's see the code....

*/

/* Before beginning to see the actual code, we must prepare the next stuff... */
interface CountryType {
   code: string;
   label: string;
   phone: string;
 }

let regex = /^(\d\s?){15,16}$/;

let arrayMonths = new Array(13)

for (let index = 1; index < arrayMonths.length; index++) {
   arrayMonths[index] = index  
}

let arrayYears = new Array(15)

for(let index = 0; index < arrayYears.length; index++){
   arrayYears[index] = 2020 + index
}

/* Reloading after the suscription is made */
function reloadPage(success, data){
   let element = data
   if(success === false){
      return null
   }
   else{
      localStorage.setItem('payment','Successfull')
      localStorage.setItem('dataelement', element)
      window.location.reload()
   }
}
/* Creating MerchantID for the FORM (it's not the same that you find in the PayU Platform)*/
function makeid(length) {
   var result           = '';
   var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   var charactersLength = characters.length;
   for ( var i = 0; i < length; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * 
charactersLength));
  }
  return result;
}

/* Creating flag based on identification code of every country */
function countryToFlag(isoCode: string) {
   return typeof String.fromCodePoint !== 'undefined'
     ? isoCode
         .toUpperCase()
         .replace(/./g, (char) => String.fromCodePoint(char.charCodeAt(0) + 127397))
     : isoCode;
 }
/* General Styles */
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
      root: {
         display: 'flex',
         flexWrap: 'wrap',
            '& > *': {
               margin: theme.spacing(1),
               width: theme.spacing(16),
               height: theme.spacing(16),
         },
      },
      option: {
         fontSize: 15,
         '& > span': {
            marginRight: 10,
            fontSize: 18,
      },
    },
      formControl: {
         margin: 10,
         minWidth: 120,
    },
    selectEmpty: {
      marginTop: theme.spacing(2),
    },
  }),
);

/* Interface for NumberFormatPhone */
interface NumberFormatPhoneProps {
   inputRef: (instance: NumberFormat | null) => void;
   onChange: (event: { target: { name: string; value: string } }) => void;
   name: string;
 }
/* NumberFormatPhone  */
 function NumberFormatPhone(props: NumberFormatPhoneProps) {
   const { inputRef, onChange, ...other } = props;
   return (
      <NumberFormat
        {...other}
        getInputRef={inputRef}
        onValueChange={(values) => {
          onChange({
            target: {
              name: props.name,
              value: values.value,
            },
          });
        }}
        /* thousandSeparator */
        isNumericString
        prefix=""
      />
    );
}

export default function SubscribeLATAM(){

   const classes = useStyles();
   const publicIp = require('public-ip');
   let {register, handleSubmit} = useForm({
      mode: "onChange" // "onChange"
    })
   let [referenceCode] = useState(makeid(20).concat('PlanBasic'))
   let [signature, setsignature] = useState('')
   let [countrycode, setcountrycode] = useState({code:"", phone:""})
   let [month, setMonth] = useState('');
   let [year, setYear] = useState('');
   let [ip, setIp] = useState<string>()
   let [cardType, setCardType] = useState('')
   const [checked, setChecked] = React.useState(false);
   let [cardImage, setCardImage] = useState<JSX.Element>(<div></div>)
   let [errorMessageCard, seterrorMessageCard] = useState<JSX.Element>(<div></div>)
   let [successPay] = useState({success:false, data:signature})

   /*So first step, 
   
   Create Plan this can be created by code (You can see here => http://developers.payulatam.com/es/api/recurring_payments.html )
   or by the PayU Platform

   I did it with the Platform because it is ten times faster, also it's something that you only need to create once for every plan you have. 
   Example: For the next two plans (Free plan, Premium) you must create two plans and that's it

   The only important data that you need from there is the ID from the plan and the value of the plan.
   */

   /* The next functions are for manage the data from the form, so that they arrive in the right way */

   /* (WORKING) Regex for separate the numbers of the credit cards and verify that has at least 14 digits  */
   var regex = /^(\d\s?){15,16}$/; // 16 digitos o de 4 en 4 separados por espacios.

   /*Handler for checkbox function (For policys and stuff) */
   const handleChangeTC = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked);
  };
   /*Handler for Month of the credit card*/
   const handleChangeMonth = (event: React.ChangeEvent<{ value: unknown }>) => {
    setMonth(event.target.value as string);
   };
   /*Handler for Year of the credit card*/
   const handleChangeYear = (event: React.ChangeEvent<{ value: unknown }>) => {
      setYear(event.target.value as string);
     };

   /*Handler for IP (For cookies) */
   let gettingIP = async () => {
      setIp(await publicIp.v4())
   }

   /*

   !IMPORTANT => PayU asks you to create a kind of "signature" based in some data that is encrypted with the MD5 signature

   For creating the signature with the md5 algorithm you need this

   APIkey~MerchantID~referenceCode~Value of your plan~Type of currency
   !IMPORTANT => IT MUST HAVE THAT KIND OF HYPHEN

   APIKey: You can get it in the PayU Account Administrative Module that you created (Settings Option)
   APILogin: You can get it in the PayU Account Administrative Module that you created (Settings Option)
   APIAccountID: You can get it in the PayU Account Administrative Module that you created (Accounts Option)
   APIMerchantID: You can get it in the PayU Account Administrative Module that you created (Settings Option)
   referenceCode: The ID of your plan
   Value: Value of your plan

   ¿Not sure if you are doing right the algorithm?
   No Problem

   At the end of the next page, you will find an app that let you make this operation and you only must ensure that both results are the same
   http://developers.payulatam.com/es/web_checkout/integration.html 

   Also in this useEffect we get the IP from where are we working (It will be explained later)
   */

   useEffect(()=>{
      gettingIP()
   },[])

   useEffect(()=>{
      localStorage.setItem("payment","Vacio")
      let message: string = APIGeneral.APIkey+"~" + APIGeneral.MerchantID + "~" + referenceCode + "~" + 'Value of your plan' + "~" + 'Type of currency'
      let md5Transform: string = md5(message)
      setsignature(md5Transform)
   },[])

   /*ReloadPage with the function reloadPage */
   useEffect(()=>{
      reloadPage(successPay.success, successPay.data)
   },[successPay])

   /* (WORKING) Regex for separate the numbers of the credit cards and verify that has at least 14 digits  */
   /* Also this determinate the type of card (VISA or MASTERCARD in this case) and show their brand logo in the page */
   const TypeCard = (e) => {
      /* let x = new Intl.NumberFormat().format(e) */
      if(regex.test(e)){
         seterrorMessageCard(<div style={{color:"rgb(93, 184, 3)"}}>Este numero es valido </div>)
      }
      else{
         seterrorMessageCard(<div style={{color:"rgb(223, 6, 6)"}}>Debe contener al menos 14 digitos</div>)
      }

      if(e === ""){
         console.log("null")
      }
      let firstCharacter : string = e.charAt(0)

      
      switch (firstCharacter) {
         case "4":
               setCardType('VISA')
               setCardImage(<img alt="visa-card" style={{width:"100%"}} src={Visa}/>)
            break;
         case "5":
               setCardType('MASTERCARD')
               setCardImage(<img alt="master-card" style={{width:"100%"}} src={MasterCard}/>)
            break;
         default:
            setCardImage(<div></div>)
            break;
      }
   }

   /*Here is where complicated 
   
   ManageData it's the main function that receives all the data from the React Hook Form
   And it has a set of steps
   */
    const ManageData = (data)=> {

         let buyerdata = data
         let countrycodedata
         /* (OPTIONAL) set in the localStorage an ID for all the process */
         localStorage.setItem('bpmpi','')
         /* Prepare the country code based on the last choice make by the user*/
         countries.map((item)=>{
            if(buyerdata.country === item.label){
               setcountrycode({code:item.code, phone:item.phone })
               countrycodedata = item.code
            }else{
               return null
            }
         })

         /*Prepare the data for all the transaction, let's see the important ones (The ones that aren't in the form):
         
         APIKey: You can get it in the PayU Account Administrative Module that you created (Settings Option)
         APILogin: You can get it in the PayU Account Administrative Module that you created (Settings Option)
         APIAccountID: You can get it in the PayU Account Administrative Module that you created (Accounts Option)
         APIMerchantID: You can get it in the PayU Account Administrative Module that you created (Settings Option)
         referenceCode: The code of your plan (It will be explained later)
         signature: The signature that we created up there
         IP: The IP that we obtained up there (It is used for the ipAddress in the element inside the dataPayU object)
         paymentMethod: It refers to the kind of brand that has the card (VISA, MASTERCARD, etc.)
         
         */
         let dataPayU = 
                  {
                     "language": "es",
                     "command": "SUBMIT_TRANSACTION",
                     "merchant": {
                        "apiKey": APIGeneral.APIkey,
                        "apiLogin": APIGeneral.APILogin
                     },
                     "transaction": {
                        "order": {
                           "accountId": APIGeneral.AccountID,
                           "referenceCode": referenceCode,
                           "description": "payment test",
                           "language": "es",
                           "signature": signature,
                           "notifyUrl": "https://develop2.dq1cwqjhlb44r.amplifyapp.com/",
                           "additionalValues": {
                              "TX_VALUE": {
                                 "value": 11000,
                                 "currency": "COP"
                           },
                              "TX_TAX": {
                                 "value": 1753,
                                 "currency": "COP"
                           },
                              "TX_TAX_RETURN_BASE": {
                                 "value": 9246,
                                 "currency": "COP"
                           }
                           },
                           "buyer": {
                              "merchantBuyerId": makeid(20),
                              "fullName": buyerdata.fullName,
                              "emailAddress": buyerdata.email,
                              "contactPhone": buyerdata.phone,
                              "dniNumber": buyerdata.dni,
                              "shippingAddress": {
                                 "street1": buyerdata.address1,
                                 "street2": buyerdata.address2 || " ",
                                 "city": buyerdata.city,
                                 "state": "",
                                 "country": countrycode.code,
                                 "postalCode": buyerdata.postalCode || " ",
                                 "phone": countrycode.phone
                              }
                           },
                           "shippingAddress": {
                              "street1": buyerdata.address1,
                              "street2": buyerdata.address2 || " ",
                              "city": buyerdata.city,
                              "state": " ",
                              "country": countrycode.code,
                              "postalCode": buyerdata.postalCode || " ",
                              "phone": countrycode.phone
                           }
                        },
                        "payer": {
                           "merchantPayerId": makeid(20),
                           "fullName": buyerdata.fullName,
                              "emailAddress": buyerdata.email,
                              "contactPhone": buyerdata.phone,
                              "dniNumber": buyerdata.dni,
                           "billingAddress": {
                              "street1": buyerdata.address1,
                              "street2": buyerdata.address2 || " ",
                              "city": buyerdata.city || " ",
                              "state": "", 
                              "country": countrycode.code,
                              "postalCode": buyerdata.postalCode || " ",
                              "phone": countrycode.phone
                           }
                        },
                        "creditCard": {
                           "number": buyerdata.cardnumber,
                           "securityCode": buyerdata.CVV,
                           "expirationDate": year + "/" + month,
                           "name": buyerdata.cardname 
                        },
                        "extraParameters": {
                           "INSTALLMENTS_NUMBER": 1
                        },
                        "type": "AUTHORIZATION_AND_CAPTURE",
                        "paymentMethod": cardType,
                        "paymentCountry": countrycode.code,
                        "deviceSessionId": document.cookie.toString(),
                        "ipAddress": ip,
                        "cookie": "pt1t38347bs6jc9ruv2ecpv7o2",
                        "userAgent": "Mozilla/5.0 (Windows NT 5.1; rv:18.0) Gecko/20100101 Firefox/18.0",
                        "threeDomainSecure": {
                           "embedded": false,
                           "eci": "02",
                           "cavv": "BwABBylVaQAAAAFwllVpAAAAAAA=",
                           "xid": "Nmp3VFdWMlEwZ05pWGN3SGo4TDA=",
                           "directoryServerTransactionId": "f38e6948-5388-41a6-bca4-b49723c19437"
                        }
                     },
                     "test": false
                  }     

               /*Let's continue with the process

               2. Client => The data of the client (for minimum, fullName and email)
               3. Credit Card / Tokenize => The data of the credit card and encrypt of the same (Number, CVV, Month/Year)
               4. Suscription => Action of subscribe a Client with a Credit Card to a certain Plan (The combination of the three other steps)

               Here we need to make a set of promises to an a certain API of PayU

               Develop: https://sandbox.api.payulatam.com/payments-api/
               Production: https://api.payulatam.com/payments-api/ 
               
               (OPTIONAL): I work with Amazon(Amplify) so I wanted that the process will be secure and make an API that use a Lambda to manage the headers of the Post action
               */
               /* So this first axios promise is the optional part of Amplify that i mentioned before if you want to take it off there will be no problem */

               axios({
                 method: 'POST',
                 url: 'Insert API that works with a Lambda that manage the headers',
                 headers: { 
                  'Content-Type': 'application/json', 
                  'Accept': 'application/json',
                 },
                 data : dataPayU,
               })
               .then((res)=> {
                  //---------------------------------------> CREATE USER <----------------------------------------------------
                  /* Here is where we are going to create our user, the authenticate variable is based in the next calculation 
                  
                  PlanName  base64(APIKey:APILogin)

                  Example
                  APIKey => 0123ABCDEF
                  APILogin => A1B2C3D4E5
                  PlanName => Basic
                  Authenticate: Basic <base64 of 0123ABCDEF:A1B2C3D4E5>
                  Authenticate: Basic MDEyM0FCQ0RFRjpBMUIyQzNENEU1 

                  The URL of the API (for Production) https://api.payulatam.com/payments-api/rest/v4.9/customers

                  It only require the fullName and email of the user as data for the API
                  */
                  axios({
                     method: 'post',
                     url: 'https://api.payulatam.com/payments-api/rest/v4.9/customers',
                     headers: { 
                         'Host': 'api.payulatam.com', 
                         'Content-Type': 'application/json; charset=utf-8', 
                         'Accept': 'application/json', 
                         'Accept-Language': 'es', 
                         'Content-Length': 'length', 
                         'Authorization': `Basic ${APIGeneral.authenticate}`
                     },
                     data : {
                         "fullName":buyerdata.email,
                         "email":buyerdata.email
                     }              
                  })
                  .then((response)=> {
                     /* With the user ID that you get from the previous promise, we are going to tokenize the data that comes from the credit cards
                     
                      The URL of the API (for Production) https://api.payulatam.com/payments-api/rest/v4.9/customers/customerID/creditCards

                     */
                        let IDinitial = response.data.id
                        //---------------------------------------> TOKENIZE DATA <---------------------------------------------------
                        axios({
                           method: 'post',
                           url: `https://api.payulatam.com/payments-api/rest/v4.9/customers/${IDinitial}/creditCards`,
                           headers: { 
                              'Host': 'api.payulatam.com', 
                              'Content-Type': 'application/json; charset=utf-8', 
                              'Accept': 'application/json', 
                              'Accept-Language': 'es', 
                              'Content-Length': 'length', 
                              'Authorization': `Basic ${APIGeneral.authenticate}`
                           },
                           data:{
                              "name":buyerdata.cardname,
                              "document":buyerdata.dni,
                              "number":buyerdata.cardnumber,
                              "expMonth":month.toString(),
                              "expYear":year.toString(),
                              "type":cardType,
                              "address": {
                                 "line1":buyerdata.address1,
                                 "line2":buyerdata.address2 || "",
                                 "line3":"",
                                 "postalCode":buyerdata.postalCode || "",
                                 "city": buyerdata.city,
                                 "state": "",
                                 "country": countrycodedata,
                                 "phone": buyerdata.phone,
                                 }
                              }
                           })
                        .then((response)=>{
                          /* With the user ID, the token and the ID of the plan (you create that variable either by code or by the PayU platform) that it's get from the previous promise, we are going to make a suscription plan  */
                           //-----------------------------------------------> SUSCRIPTION <--------------------------------------------------
                           axios({
                              method: 'post',
                              url: 'https://api.payulatam.com/payments-api/rest/v4.9/subscriptions',
                              headers: { 
                                    'Host': 'api.payulatam.com', 
                                    'Content-Type': 'application/json; charset=utf-8', 
                                    'Accept': 'application/json', 
                                    'Accept-Language': 'es', 
                                    'Content-Length': 'length', 
                                    'Authorization': `Basic ${APIGeneral.authenticate}`
                              },
                              data:{
                                    "quantity": 1,
                                    "immediatePayment": true,
                                    "trialDays": "0",
                                    "customer": {
                                       "id": `${IDinitial}`,
                                       "creditCards": [
                                          {
                                                "token": `${response.data.token}`
                                          }
                                       ]
                                       },
                                          "plan": {
                                                "planCode": "1234"
                                       },
                                          "extra1": "Pago MENSUAL, sin fecha de terminacion",
                                          "notifyUrl": "http://test.com/notify"
                                    }       
                              })
                           .then((response)=>{
                              console.log("SuscriptionResponse: ",response)
                              Swal.fire({
                                 icon: 'success',
                                 title: '¡Pago Exitoso!',
                                 text: 'Te estamos redirigiendo al registro',
                              })
                              /*(OPTIONAL) Here, we redirect to another page if the transaction it's successfull */
                              localStorage.setItem('bpmpi',dataPayU.transaction.payer.merchantPayerId)
                              setTimeout(()=>{
                                 window.location.replace(`/q/${dataPayU.transaction.payer.merchantPayerId}/signUp`);
                              },2000)
                           })
                           .catch(function (error) {
                              Swal.fire({
                                 icon: 'error',
                                 title: 'Error Type Suscription',
                                 text: 'Something went wrong with the axios of suscription, check it',
                              })
                              console.log(error);
                           });
                        })
                        .catch(function (error) {
                           Swal.fire({
                              icon: 'error',
                              title: 'Error Type Tokenize',
                              text: 'Something went wrong with the axios of tokenize, check it',
                           })
                              console.log(error);
                           });
                        })
                  .catch(function (error) {
                     Swal.fire({
                        icon: 'error',
                        title: 'Error Type User',
                        text: 'Something went wrong with the axios of create user, check it',
                     })
                        console.log(error);
                  });  
                 })
               .catch(function (error) {
                  Swal.fire({
                     icon: 'error',
                     title: 'Error API Amplify',
                     text: 'There was a mistake on the system, try it later',
                     footer: 'A little mistake'
                   })
               });
    }
    
    return(
        <>
        {/*Here is the minimum quantity of inputs for getting the necessary data to make the transaction, you can add whatever you want (This one works only for Colombia) */}
        <div>
        <Grid container spacing={3}>
            <Grid item xs={12} sm={12} md={6} lg={7} className="subscription-payment-box-form"> 
            <Paper elevation={3} style={{padding:'5%'}}>  
               <form onSubmit={handleSubmit(ManageData)}>
               <Grid container spacing={3} >
                     <Grid item xs={12} sm={12} md={12} lg={6}>
                           <Grid item xs={12} sm={12} md={12} lg={12} style={{textAlignLast:"left"}}>
                              <img alt="logo" src={Logo} width="200"/>
                           </Grid>
                     </Grid>
                     <Grid item xs={12} sm={12} md={12} lg={6}>
                        <Grid container spacing={3} justifyContent="flex-end" alignItems="flex-end">
                           <Grid item xs={12} sm={12} md={12} lg={6} style={{textAlignLast:"right"}}>
                           <div style={{display:"inline-flex"}}>
                              <h6>Powered by</h6>
                              <img alt="PayULogo" src={PayU} width="200"/>
                           </div>
                           </Grid>
                        </Grid>
                     </Grid>
                     <Grid item xs={12} sm={12} md={12} lg={12}>
                        <h2 className="subscription-title"><span className="indicator">1</span>Datos del comprador</h2>
                     </Grid>
                     <Grid item xs={12} sm={12} md={12} lg={6}>
                        <TextField style={{width:"100%"}} required label="Nombre Completo" variant="outlined" type="text" name="fullName"  placeholder="Nombre Completo" {...register('fullName',{required:"Este campo es obligatorio"})} ></TextField>
                     </Grid>
                     <Grid item xs={12} sm={12} md={12} lg={6}>
                        <TextField style={{width:"100%"}} required label="Correo electrónico" variant="outlined" type="email" name="email" placeholder="Correo electrónico" {...register('email',{required:"Este campo es obligatorio"})} ></TextField>
                     </Grid>
                     <Grid item xs={12} sm={12} md={12} lg={6}>
                        <TextField style={{width:"100%"}} 
                        required 
                        label="Telefóno Celular"
                        variant="outlined"  
                        type="text" 
                        name="phone" 
                        placeholder="Telefóno Celular" 
                        {...register('phone')}
                        InputProps={{
                           inputComponent: NumberFormatPhone as any,
                        }}
                        >
                        </TextField>
                     </Grid>
                     <Grid item xs={12} sm={12} md={12} lg={6}>
                        <TextField style={{width:"100%"}} required label="Número de Documento de identificación" variant="outlined" type="text" name="dni" placeholder="Número de Documento de identificación" {...register('dni',{required:"Este campo es obligatorio"})}></TextField>
                     </Grid>
                     <Grid item xs={12} sm={12} md={12} lg={6}>
                        <TextField style={{width:"100%"}} required label="Dirección 1" variant="outlined" type="text" name="address1" placeholder="Dirección 1" {...register('address1',{required:"Este campo es obligatorio"})}></TextField>
                     </Grid>
                     <Grid item xs={12} sm={12} md={12} lg={6}>
                        <TextField style={{width:"100%"}} label="Dirección 2 (Opcional)" variant="outlined" type="text" name="address2" placeholder="Dirección 2 (Opcional)" {...register('address2')}></TextField>
                     </Grid>
                     <Grid item xs={12} sm={12} md={12} lg={6}>
                     <Autocomplete
                           id="country-select-demo"
                           style={{ width: 300 }}
                           options={countries as CountryType[]}
                           classes={{
                           option: classes.option,
                           }}
                           autoHighlight
                           getOptionLabel={(option) => option.label}
                           renderOption={(option) => (
                           <React.Fragment>
                              <span>{countryToFlag(option.code)}</span>
                              {option.label} ({option.code}) +{option.phone}
                           </React.Fragment>
                           )}
                           renderInput={(params) => (
                           <TextField
                              style={{width:"100%"}}
                              name="country"
                              {...register('country',{required:"Este campo es obligatorio"})}
                              {...params}
                              label="País"
                              variant="outlined"
                              inputProps={{
                                 ...params.inputProps,
                                 autoComplete: 'new-password'
                              }}
                           />
                           )}
                           />
                     </Grid>
                     <Grid item xs={12} sm={12} md={12} lg={6}>
                        <TextField style={{width:"100%"}} label="Ciudad" variant="outlined" type="text" name="city" placeholder="Ciudad" {...register('city')}></TextField>
                     </Grid>
                     <Grid item xs={12} sm={12} md={12} lg={6}>
                        <TextField style={{width:"100%"}} label="Telefóno 2 (Opcional)" variant="outlined" type="text" name="phone2" placeholder="Telefono (Opcional)" {...register('phone2')}></TextField>
                     </Grid>
                     <Grid item xs={12} sm={12} md={12} lg={6}>
                        <TextField style={{width:"100%"}} label="Codigo Postal (Opcional)" variant="outlined" type="text" name="postalcode" placeholder="Codigo Postal (Opcional)" {...register('postalcode')}></TextField>
                     </Grid>
                     <Grid item xs={12} sm={12} md={12} lg={12}>
                        <div style={{width:"100%",display:"inline-flex", alignItems:"center"}}>
                           <h2 className="subscription-title" style={{width:"100%"}}><span className="indicator">2</span>Datos del Pago</h2>
                           <img alt="visa-card" style={{width:"5%"}} src={Visa}/>
                           <img alt="master-card" style={{width:"5%"}} src={MasterCard}/>
                        </div>
                     </Grid>
                     <Grid item xs={12} sm={12} md={12} lg={6}>
                        <TextField required style={{width:"100%"}} label="Nombre de la tarjeta" variant="outlined" type="text" name="cardname" placeholder="Nombre Completo" {...register('cardname',{required:"Este campo es obligatorio"})} ></TextField>
                     </Grid>
                     <Grid item xs={12} sm={12} md={12} lg={1} style={{alignSelf:"center"}}>
                        {cardImage}
                     </Grid>
                     <Grid item xs={12} sm={12} md={12} lg={5}>
                        <TextField 
                           required
                           style={{width:"100%"}} 
                           label="Numero de la tarjeta" 
                           variant="outlined" 
                           type="text" 
                           name="cardnumber"  
                           placeholder="Numero de la tarjeta" 
                           {...register('cardnumber',{required:"Este campo es obligatorio", pattern: {
                              value: /^[1-9]\d*(\d+)?$/i,
                              message: 'Please enter an integer',
                           }})} 
                           onChange={(e)=>{TypeCard(e.target.value)}}
                           >
                     </TextField>
                     {errorMessageCard}
                     </Grid>
                     <Grid item xs={12} sm={12} md={12} lg={12}>
                     <h3 className="subscription-title">Fecha de expiración</h3>
                     </Grid>
                     <Grid item xs={12} sm={12} md={12} lg={3}>
                        <InputLabel style={{textAlign:"left"}}>Mes</InputLabel>
                        <Select
                        style={{width:"100%"}}
                           value={month}
                           onChange={handleChangeMonth}
                           name="cardMonth"
                        >
                           {
                              arrayMonths.map((item)=>{

                                 if(item < 10){
                                    return(
                                       <MenuItem value={`0${item}`}>{`0${item}`}</MenuItem>
                                    )
                                 }else{
                                    return null
                                 }
                              })
                           }
                           <MenuItem value={10}>10</MenuItem>
                           <MenuItem value={11}>11</MenuItem>
                           <MenuItem value={12}>12</MenuItem>
                        </Select>
                    
                     </Grid>
                     <Grid item xs={12} sm={12} md={12} lg={3}>
                        <InputLabel style={{textAlign:"left"}}>Año</InputLabel>
                        <Select
                        style={{width:"100%"}}
                           value={year}
                           onChange={handleChangeYear}
                           name="cardYear"
                        >
                           {
                              arrayYears.map((item)=>{
                                    return(
                                       <MenuItem value={item}>{item}</MenuItem>
                                    )
                              })
                           }
                        </Select>
                     </Grid>
                     <Grid item xs={12} sm={12} md={12} lg={5}>
                        <TextField required  label="CVV/CVC" variant="outlined" type="text" name="CVV" placeholder="CVV/CVC" {...register('CVV')}></TextField>
                     </Grid>
                     <Grid item xs={12} sm={12} md={12} lg={12}>
                        <div style={{display:"inline-flex", alignItems:"center"}}>
                           <Checkbox required checked={checked} onChange={handleChangeTC} name="checked" />
                           <p>Antes de realizar este pago, estoy de acuerdo con los <a href="https://legal.payulatam.com/ES/terminos_y_condiciones_comercios.html">Términos y Condiciones</a>* y <a href="https://legal.payulatam.com/ES/terminos_y_condiciones_comercios.html">Politicas de Reembolso</a>*</p>
                        </div>
                     </Grid>
                     <Grid item xs={12} sm={12} md={12} lg={12}>
                        <Button className="subscription-payment-button" type="submit" value="Realizar pago">Realizar Pago</Button>
                     </Grid>
               </Grid>
            </form>
            </Paper>  
            </Grid>       
            <Grid item xs={12} sm={12} md={4} lg={4} className="subscription-payment-box-info">
               <Paper elevation={3} style={{padding:'5%'}}>
                  <Grid container spacing={3}>
                     <Grid item xs={12} sm={12} md={12} lg={12}>
                        <h3 className="subscription-title">Datos de la suscripción</h3>
                     </Grid>
                     <Grid item xs={12} sm={12} md={12} lg={12}>
                        <h4 className="subscription-subtitle">Suscripción Plan Basic....................$7.99 USD</h4>
                     </Grid>
                     <Grid item xs={12} sm={12} md={12} lg={6}>
                        <h4 className="subscription-subtitle">Total</h4>
                     </Grid>
                     <Grid item xs={12} sm={12} md={12} lg={6}>
                        <h2 className="subscription-subtitle">$7.99 USD</h2>
                     </Grid>
                     <Grid item xs={12} sm={12} md={12} lg={6}>
                        <Button className="subscription-payment-cancel" type="submit" value="Cancelar Pago">Cancelar Pago</Button>
                     </Grid>
                  </Grid>
               </Paper>
            </Grid>
        </Grid>
        </div>
        </>
    )
}
/*TERMS AND CONDITIONS https://legal.payulatam.com/ES/terminos_y_condiciones_comercios.html */